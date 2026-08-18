import { prisma } from "./prisma";
import { isPhaseEnabled, paymentsEnabled, PRICING } from "./payments/config";

/** Referencia histórica KYC alto valor — no aplica al escrow (100% Alquila). */
export const ESCROW_REQUIRED_VALUE_SOLES = 800;

export const KYC_INVENTORY_THRESHOLD_SOLES = 2000;
export const VERIFIED_EXCHANGE_MIN = 3;

export const WEDGE = {
  headline: "Alquila cosas en Lima con protocolo: identidad, encuentro público y acta digital.",
  subline:
    "Beta pública. No somos un tablón: DNI y celular declarados, WhatsApp tras aceptación, fotos de entrega y devolución. Publicar es gratis.",
  ownerPitch:
    "Publica tu bien por S/ 9.90. El arrendatario solicita fechas en la app; tú aceptas, coordinan en zona pública y firman acta.",
  renterPitch:
    "No Yapees el 100% por adelantado a un desconocido. Acuerda la garantía en el encuentro, con acta y fotos. El alquiler diario es entre ustedes (Yape/Plin/efectivo).",
  alquilerP2P:
    "El alquiler diario y la garantía se pagan entre ustedes (Yape/Plin/efectivo) en el encuentro. Alquila no cobra ni custodia fondos en esta beta.",
  garantiaAlquila:
    "La garantía se acuerda entre las partes en el encuentro y queda registrada en el acta. Alquila no retiene ese dinero en la beta.",
  whatsappAfterEscrow:
    "WhatsApp se desbloquea cuando el dueño acepta la solicitud — nunca aparece en el anuncio.",
} as const;

const WHATSAPP_STATUSES = ["ACCEPTED", "HANDOVER_PENDING", "ACTIVE", "RETURN_PENDING", "DISPUTED"];

/** Toda garantía pasa por Alquila cuando Fase 2+ está activa. */
export function requiresEscrowGarantia(_valorEstimadoSoles?: number): boolean {
  return isPhaseEnabled(2);
}

export function isVerifiedExchanger(alquileresCompletados: number, devolucionesOk: number): boolean {
  return (
    alquileresCompletados >= VERIFIED_EXCHANGE_MIN && devolucionesOk >= VERIFIED_EXCHANGE_MIN
  );
}

export function escrowFeeSoles(garantiaSoles: number): number {
  return Number((garantiaSoles * PRICING.escrowGarantiaFeePct).toFixed(2));
}

export function escrowTotalSoles(garantiaSoles: number): number {
  return Number((garantiaSoles + escrowFeeSoles(garantiaSoles)).toFixed(2));
}

export function escrowEnforced(): boolean {
  return isPhaseEnabled(2);
}

export function mustHoldEscrow(_valorEstimadoSoles?: number): boolean {
  return escrowEnforced();
}

export function canProceedToHandover(
  escrowStatus: string,
  _valorEstimadoSoles?: number,
): { ok: boolean; reason?: string } {
  if (!mustHoldEscrow()) return { ok: true };
  if (escrowStatus === "HELD") return { ok: true };
  return {
    ok: false,
    reason:
      "El arrendatario debe depositar la garantía en Alquila antes de la entrega física.",
  };
}

export function canUnlockWhatsApp(
  rental: {
    status: string;
    telefonoDesbloqueado: boolean;
    escrowStatus: string;
  },
  _itemValor?: number,
): { ok: boolean; reason?: string; nextStep?: string } {
  if (!rental.telefonoDesbloqueado) {
    return {
      ok: false,
      reason: "El celular se desbloquea cuando el dueño acepta la solicitud.",
      nextStep: "Espera la aceptación del dueño.",
    };
  }
  if (!WHATSAPP_STATUSES.includes(rental.status)) {
    return {
      ok: false,
      reason: "WhatsApp no disponible en este estado del intercambio.",
      nextStep: "Completa los pasos anteriores del protocolo.",
    };
  }
  if (mustHoldEscrow() && rental.escrowStatus !== "HELD") {
    return {
      ok: false,
      reason:
        "Deposita la garantía en Alquila antes de contactar por WhatsApp. No pagues garantía directo al dueño.",
      nextStep: "Arrendatario: deposita la garantía. Dueño: espera confirmación.",
    };
  }
  return { ok: true };
}

export async function ownerInventoryValueSoles(userId: string): Promise<number> {
  const items = await prisma.item.findMany({
    where: { userId, publicado: true },
    select: { valorEstimadoSoles: true },
  });
  return items.reduce((sum, i) => sum + i.valorEstimadoSoles, 0);
}

export async function ownerNeedsKyc(userId: string, additionalValue = 0): Promise<boolean> {
  const total = (await ownerInventoryValueSoles(userId)) + additionalValue;
  return total > KYC_INVENTORY_THRESHOLD_SOLES;
}

export async function ownerHasKycApproved(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycVerificado: true },
  });
  return Boolean(user?.kycVerificado);
}

export async function ownerHasPendingKyc(userId: string): Promise<boolean> {
  const pending = await prisma.kycRequest.findFirst({
    where: { userId, status: "PENDING" },
  });
  return Boolean(pending);
}

export async function assertOwnerCanPublish(
  userId: string,
  valorEstimadoSoles: number,
): Promise<{ ok: true } | { ok: false; error: string; code: string }> {
  const needs = await ownerNeedsKyc(userId, valorEstimadoSoles);
  if (!needs) return { ok: true };
  if (await ownerHasKycApproved(userId)) return { ok: true };
  if (await ownerHasPendingKyc(userId)) {
    return {
      ok: false,
      code: "KYC_PENDING",
      error: `Inventario alto valor (> S/ ${KYC_INVENTORY_THRESHOLD_SOLES}). Tu verificación KYC está en revisión (24–72 h).`,
    };
  }
  return {
    ok: false,
    code: "KYC_REQUIRED",
    error: `Dueños con inventario > S/ ${KYC_INVENTORY_THRESHOLD_SOLES} requieren verificación KYC manual. Solicítala en tu perfil antes de publicar.`,
  };
}

export async function renterHasUnpaidProtocolFee(userId: string): Promise<boolean> {
  if (!paymentsEnabled()) return false;
  const pending = await prisma.rental.count({
    where: { renterId: userId, status: "COMPLETED", protocolFeePaid: false },
  });
  return pending > 0;
}
