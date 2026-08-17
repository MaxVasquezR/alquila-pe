import { prisma } from "./prisma";
import type { Item, User } from "@prisma/client";
import type { RiskFlag } from "./types";
export type { RiskFlag } from "./types";

export function hoursSince(date: Date) {
  return (Date.now() - date.getTime()) / 3_600_000;
}

export function riskForOwner(owner: User, item: Item): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (!owner.dniVerificado) {
    flags.push({
      level: "block",
      code: "OWNER_UNVERIFIED",
      message: "El dueño no tiene DNI verificado. No se puede iniciar un alquiler.",
    });
  }
  if (hoursSince(owner.createdAt) < 48 && item.valorEstimadoSoles >= 800) {
    flags.push({
      level: "warn",
      code: "NEW_ACCOUNT_HIGH_VALUE",
      message: "Cuenta con menos de 48 h publicando un bien de alto valor. Pide acta y encuentro público.",
    });
  }
  if (owner.alquileresCompletados === 0) {
    flags.push({
      level: "info",
      code: "FIRST_RENTALS",
      message: "Primeros alquileres del dueño. Usa el protocolo de entrega con fotos.",
    });
  }
  if (owner.strikes > 0) {
    flags.push({
      level: "warn",
      code: "OWNER_STRIKES",
      message: "Este perfil tiene reportes previos. Revisa el historial antes de coordinar.",
    });
  }
  const garantiaRatio = item.garantiaSugeridaSoles / Math.max(item.valorEstimadoSoles, 1);
  if (garantiaRatio < 0.15 && item.valorEstimadoSoles >= 400) {
    flags.push({
      level: "warn",
      code: "LOW_DEPOSIT",
      message: "La garantía es baja frente al valor estimado. Negocia un depósito razonable en el acta.",
    });
  }
  if (item.precioDiaSoles < item.valorEstimadoSoles * 0.01 && item.valorEstimadoSoles >= 500) {
    flags.push({
      level: "warn",
      code: "PRICE_TOO_LOW",
      message: "Precio anómalamente bajo para el valor declarado. Puede ser anzuelo de estafa.",
    });
  }
  return flags;
}

export function riskForRenter(renter: User): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (!renter.dniVerificado || !renter.telefonoVerificado) {
    flags.push({
      level: "block",
      code: "RENTER_UNVERIFIED",
      message: "Debes verificar DNI y celular antes de solicitar un alquiler.",
    });
  }
  if (hoursSince(renter.createdAt) < 24) {
    flags.push({
      level: "warn",
      code: "NEW_RENTER",
      message: "Cuenta nueva. El dueño puede pedir encuentro en lugar público y no aceptar pagos adelantados.",
    });
  }
  if (renter.disputasAbiertas > 0) {
    flags.push({
      level: "warn",
      code: "OPEN_DISPUTE",
      message: "Tienes una disputa abierta. Resuélvela antes de iniciar otro alquiler.",
    });
  }
  return flags;
}

export async function logAudit(input: {
  userId?: string | null;
  action: string;
  entidad: string;
  entidadId: string;
  metadata?: Record<string, unknown>;
  ipHash?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entidad: input.entidad,
      entidadId: input.entidadId,
      metadata: JSON.stringify(input.metadata ?? {}),
      ipHash: input.ipHash ?? null,
    },
  });
}

export async function consumeRateLimit(key: string, max: number, windowMs: number) {
  const now = new Date();
  const row = await prisma.rateLimit.findUnique({ where: { id: key } });
  if (!row || row.windowEnd < now) {
    await prisma.rateLimit.upsert({
      where: { id: key },
      update: { count: 1, windowEnd: new Date(now.getTime() + windowMs) },
      create: { id: key, count: 1, windowEnd: new Date(now.getTime() + windowMs) },
    });
    return { ok: true, remaining: max - 1 };
  }
  if (row.count >= max) {
    return { ok: false, remaining: 0 };
  }
  await prisma.rateLimit.update({
    where: { id: key },
    data: { count: { increment: 1 } },
  });
  return { ok: true, remaining: max - row.count - 1 };
}

export function hashIp(ip: string | null) {
  if (!ip) return null;
  let h = 0;
  for (let i = 0; i < ip.length; i++) h = (h * 31 + ip.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export const SCAM_WARNINGS = [
  "Nunca pagues el 100% por adelantado a Yape/Plin de un desconocido.",
  "Deposita la garantía en Alquila antes de WhatsApp — nunca Yapees garantía directo al dueño.",
  "El celular del dueño no está en el anuncio. Solo WhatsApp auditado dentro del intercambio.",
  "Si te piden la dirección exacta por chat, denuncia y no la des.",
  "Compara el DNI físico con el perfil (últimos 4 dígitos) en el encuentro.",
  "No entregues el bien sin fotos, checklist y firma de ambas partes.",
  "Códigos de 'verificación bancaria' o 'pago de garantía por link' son estafa.",
];
