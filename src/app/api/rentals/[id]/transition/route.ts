import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { assertTransition } from "@/lib/rental-machine";
import { logAudit } from "@/lib/security";
import { notifyRentalEvent } from "@/lib/notifications";
import { canProceedToHandover } from "@/lib/business-rules";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["accept", "reject", "cancel", "start_handover", "start_return", "open_dispute"]),
  motivo: z.string().trim().max(400).optional(),
  puntoEncuentro: z.string().trim().min(8).max(120).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError("Acción inválida.");

  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: { item: true },
  });
  if (!rental) return jsonError("Alquiler no encontrado", 404);

  const isOwner = rental.ownerId === user.id;
  const isRenter = rental.renterId === user.id;
  if (!isOwner && !isRenter) return jsonError("No autorizado", 403);

  const { action, motivo, puntoEncuentro } = body.data;

  try {
    if (action === "accept") {
      if (!isOwner) return jsonError("Solo el dueño puede aceptar.", 403);
      assertTransition(rental.status as never, "ACCEPTED");
      await prisma.rental.update({
        where: { id: rental.id },
        data: {
          status: "ACCEPTED",
          telefonoDesbloqueado: true,
          puntoEncuentro: puntoEncuentro ?? rental.puntoEncuentro,
        },
      });
    } else if (action === "reject") {
      if (!isOwner) return jsonError("Solo el dueño puede rechazar.", 403);
      assertTransition(rental.status as never, "REJECTED");
      await prisma.rental.update({
        where: { id: rental.id },
        data: { status: "REJECTED", motivoRechazo: motivo || "No disponible en esas fechas" },
      });
    } else if (action === "cancel") {
      assertTransition(rental.status as never, "CANCELLED");
      if (rental.status === "ACTIVE" || rental.status === "RETURN_PENDING") {
        return jsonError("Un alquiler en curso se cierra con acta de devolución o disputa.");
      }
      await prisma.rental.update({
        where: { id: rental.id },
        data: { status: "CANCELLED", motivoRechazo: motivo || "Cancelado por una de las partes" },
      });
    } else if (action === "start_handover") {
      const handover = canProceedToHandover(rental.escrowStatus, rental.item.valorEstimadoSoles);
      if (!handover.ok) return jsonError(handover.reason ?? "Entrega bloqueada.", 403);
      assertTransition(rental.status as never, "HANDOVER_PENDING");
      await prisma.rental.update({
        where: { id: rental.id },
        data: { status: "HANDOVER_PENDING" },
      });
    } else if (action === "start_return") {
      assertTransition(rental.status as never, "RETURN_PENDING");
      await prisma.rental.update({
        where: { id: rental.id },
        data: { status: "RETURN_PENDING" },
      });
    } else if (action === "open_dispute") {
      if (!motivo || motivo.length < 12) {
        return jsonError("Describe el conflicto con al menos 12 caracteres.");
      }
      assertTransition(rental.status as never, "DISPUTED");
      await prisma.$transaction([
        prisma.rental.update({
          where: { id: rental.id },
          data: { status: "DISPUTED", disputaMotivo: motivo },
        }),
        prisma.user.update({
          where: { id: rental.ownerId },
          data: { disputasAbiertas: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: rental.renterId },
          data: { disputasAbiertas: { increment: 1 } },
        }),
      ]);
    }

    await logAudit({
      userId: user.id,
      action: `RENTAL_${action.toUpperCase()}`,
      entidad: "Rental",
      entidadId: rental.id,
      metadata: { motivo: motivo ?? null },
    });

    if (action === "accept") await notifyRentalEvent(rental.id, "ACCEPTED");
    if (action === "accept") {
      const { notifyUser } = await import("@/lib/notifications");
      await notifyUser({
        userId: rental.renterId,
        tipo: "DEPOSIT_GARANTIA",
        titulo: "Deposita la garantía",
        cuerpo: "Tu solicitud fue aceptada. Deposita la garantía en Alquila para desbloquear WhatsApp y coordinar entrega.",
        link: `/alquileres/${rental.id}`,
      });
    }
    if (action === "start_handover") await notifyRentalEvent(rental.id, "HANDOVER");
    if (action === "start_return") await notifyRentalEvent(rental.id, "RETURN");
    if (action === "open_dispute") await notifyRentalEvent(rental.id, "DISPUTED");

    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "No se pudo actualizar el alquiler.");
  }
}
