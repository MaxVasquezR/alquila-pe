import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { consumeRateLimit, logAudit } from "@/lib/security";
import { canUnlockWhatsApp, mustHoldEscrow } from "@/lib/business-rules";
import { jsonError } from "@/lib/http";
import { whatsappLink } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);
  if (!user.dniVerificado || !user.telefonoVerificado) {
    return jsonError("Verifica tu identidad antes de contactar.", 403);
  }

  const rl = await consumeRateLimit(`wa:${user.id}`, 8, 24 * 60 * 60 * 1000);
  if (!rl.ok) return jsonError("Límite diario de contactos WhatsApp alcanzado (8).", 429);

  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: { item: true, owner: true, renter: true },
  });
  if (!rental) return jsonError("Alquiler no encontrado", 404);
  if (rental.ownerId !== user.id && rental.renterId !== user.id) {
    return jsonError("No autorizado", 403);
  }

  const wa = canUnlockWhatsApp(
    {
      status: rental.status,
      telefonoDesbloqueado: rental.telefonoDesbloqueado,
      escrowStatus: rental.escrowStatus,
    },
    rental.item.valorEstimadoSoles,
  );
  if (!wa.ok) {
    return jsonError(wa.reason ?? "WhatsApp bloqueado.", 403);
  }

  const other = user.id === rental.ownerId ? rental.renter : rental.owner;
  const meName = `${user.nombre} ${user.apellidos}`;
  const lines = [
    `Hola ${other.nombre}, te contacto por Alquila.`,
    `Solicitud: ${rental.codigo}`,
    `Artículo: ${rental.item.titulo}`,
    `Precio: S/ ${rental.precioDiaSoles.toFixed(2)}/día · Total alquiler S/ ${rental.totalSoles.toFixed(2)} (Yape/Plin entre ustedes)`,
    `Garantía: S/ ${rental.garantiaSoles.toFixed(2)}${
      rental.escrowStatus === "HELD"
        ? " · RETENIDA en Alquila"
        : mustHoldEscrow(rental.item.valorEstimadoSoles)
          ? ""
          : " · acordar en acta de entrega"
    }`,
    `Fechas: ${rental.fechaInicio.toISOString().slice(0, 10)} → ${rental.fechaFin.toISOString().slice(0, 10)}`,
  ];
  if (rental.puntoEncuentro) {
    lines.push(`Punto de encuentro: ${rental.puntoEncuentro} (zona pública)`);
  }
  lines.push(
    `Soy ${meName}.`,
    "No compartas dirección exacta ni pagues garantía extra por fuera de Alquila.",
  );

  await prisma.contactEvent.create({
    data: {
      userId: user.id,
      rentalId: rental.id,
      itemId: rental.itemId,
      canal: "whatsapp",
    },
  });
  await logAudit({
    userId: user.id,
    action: "WHATSAPP_UNLOCK",
    entidad: "Rental",
    entidadId: rental.id,
  });

  return NextResponse.json({
    ok: true,
    url: whatsappLink(other.telefono, lines.join("\n")),
  });
}
