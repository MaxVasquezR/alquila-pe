import { prisma } from "../prisma";
import { logAudit } from "../security";
import { notifyUser } from "../notifications";

export type EscrowReleaseAction = "RELEASE" | "CLAIM" | "PARTIAL";

export async function releaseEscrowForRental(
  rentalId: string,
  action: EscrowReleaseAction,
  options?: { partialToOwner?: number; adminUserId?: string; notas?: string },
) {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { escrowHolds: true },
  });
  if (!rental) throw new Error("Alquiler no encontrado");
  if (rental.escrowStatus !== "HELD") {
    return { skipped: true, reason: "No hay garantía retenida" };
  }

  const now = new Date();
  let escrowStatus: string;
  let holdStatus: string;
  let actaGarantia: "RELEASED" | "CLAIMED" | "PARTIAL";

  if (action === "RELEASE") {
    escrowStatus = "RELEASED";
    holdStatus = "RELEASED";
    actaGarantia = "RELEASED";
  } else if (action === "CLAIM") {
    escrowStatus = "CLAIMED";
    holdStatus = "CLAIMED";
    actaGarantia = "CLAIMED";
  } else {
    escrowStatus = "PARTIAL";
    holdStatus = "RELEASED";
    actaGarantia = "PARTIAL";
  }

  await prisma.$transaction([
    prisma.rental.update({
      where: { id: rentalId },
      data: { escrowStatus },
    }),
    prisma.escrowHold.updateMany({
      where: { rentalId, status: "HELD" },
      data: {
        status: holdStatus,
        releasedAt: action === "CLAIM" ? undefined : now,
        claimedAt: action === "CLAIM" ? now : undefined,
      },
    }),
    prisma.acta.updateMany({
      where: { rentalId, tipo: "DEVOLUCION" },
      data: {
        garantiaEstado: actaGarantia,
        garantiaMontoRetenido:
          action === "PARTIAL" ? (options?.partialToOwner ?? rental.garantiaSoles) : 0,
      },
    }),
  ]);

  await logAudit({
    userId: options?.adminUserId ?? null,
    action: `ESCROW_${action}`,
    entidad: "Rental",
    entidadId: rentalId,
    metadata: { notas: options?.notas ?? null },
  });

  if (action === "RELEASE" || action === "PARTIAL") {
    await notifyUser({
      userId: rental.renterId,
      tipo: "ESCROW_RELEASED",
      titulo: "Garantía liberada",
      cuerpo:
        action === "PARTIAL"
          ? `Se liberó parte de tu garantía del alquiler ${rental.codigo}.`
          : `Tu garantía del alquiler ${rental.codigo} fue liberada tras devolución exitosa.`,
      link: `/alquileres/${rentalId}`,
    });
  }
  if (action === "CLAIM" || action === "PARTIAL") {
    await notifyUser({
      userId: rental.ownerId,
      tipo: "ESCROW_CLAIMED",
      titulo: "Resolución de garantía",
      cuerpo: `Garantía del alquiler ${rental.codigo} resuelta a favor del dueño según disputa.`,
      link: `/alquileres/${rentalId}`,
    });
  }

  return { ok: true, escrowStatus };
}
