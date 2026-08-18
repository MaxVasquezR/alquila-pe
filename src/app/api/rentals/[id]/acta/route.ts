import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { last4, signActaSchema } from "@/lib/validations";
import { assertTransition } from "@/lib/rental-machine";
import { CHECKLIST_DEVOLUCION, CHECKLIST_ENTREGA } from "@/lib/peru";
import { logAudit } from "@/lib/security";
import { notifyRentalEvent } from "@/lib/notifications";
import { fromZod, jsonError } from "@/lib/http";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ActaTipo, ConditionGrade } from "@/lib/types";

function checklistComplete(tipo: ActaTipo, checklist: Record<string, boolean>) {
  const required = tipo === "ENTREGA" ? CHECKLIST_ENTREGA : CHECKLIST_DEVOLUCION;
  return required.every((item) => checklist[item.id] === true);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: { actas: true, item: true },
  });
  if (!rental) return jsonError("Alquiler no encontrado", 404);
  if (rental.ownerId !== user.id && rental.renterId !== user.id) {
    return jsonError("No autorizado", 403);
  }

  try {
    const body = signActaSchema.parse(await req.json());
    const tipo: ActaTipo =
      rental.status === "HANDOVER_PENDING" || rental.status === "ACCEPTED"
        ? "ENTREGA"
        : rental.status === "RETURN_PENDING" || rental.status === "DISPUTED"
          ? "DEVOLUCION"
          : ("" as ActaTipo);

    if (tipo !== "ENTREGA" && tipo !== "DEVOLUCION") {
      return jsonError("Este alquiler no está en una etapa de acta.");
    }
    if (tipo === "ENTREGA" && rental.status !== "HANDOVER_PENDING") {
      return jsonError("Primero inicia el protocolo de entrega.");
    }
    if (tipo === "DEVOLUCION" && rental.status !== "RETURN_PENDING" && rental.status !== "DISPUTED") {
      return jsonError("Primero inicia el protocolo de devolución.");
    }

    if (body.dniUltimos4 !== last4(user.dni)) {
      return jsonError("Los últimos 4 dígitos del DNI no coinciden. No se firma el acta.");
    }
    if (!checklistComplete(tipo, body.checklist)) {
      return jsonError("Debes confirmar todos los puntos del checklist de seguridad.");
    }

    const isOwner = user.id === rental.ownerId;
    const existing = rental.actas.find((a) => a.tipo === tipo);

    if (existing) {
      const already =
        (isOwner && existing.ownerFirmadoEn) || (!isOwner && existing.renterFirmadoEn);
      if (already) return jsonError("Ya firmaste esta acta.");
    }

    const acta = existing
      ? await prisma.acta.update({
          where: { id: existing.id },
          data: {
            conditionGrade: body.conditionGrade,
            fotosEvidencia: JSON.stringify(body.fotosEvidencia),
            checklist: JSON.stringify(body.checklist),
            notas: [existing.notas, body.notas].filter(Boolean).join("\n---\n"),
            ownerFirmadoEn: isOwner ? new Date() : existing.ownerFirmadoEn,
            renterFirmadoEn: !isOwner ? new Date() : existing.renterFirmadoEn,
            ownerDniUltimos4: isOwner ? body.dniUltimos4 : existing.ownerDniUltimos4,
            renterDniUltimos4: !isOwner ? body.dniUltimos4 : existing.renterDniUltimos4,
            garantiaEstado:
              rental.escrowStatus === "HELD" || rental.escrowStatus === "NONE"
                ? "HOLD"
                : existing.garantiaEstado,
            garantiaMontoRetenido: rental.garantiaSoles,
          },
        })
      : await prisma.acta.create({
          data: {
            rentalId: rental.id,
            tipo,
            conditionGrade: body.conditionGrade,
            fotosEvidencia: JSON.stringify(body.fotosEvidencia),
            checklist: JSON.stringify(body.checklist),
            notas: body.notas ?? "",
            ownerFirmadoEn: isOwner ? new Date() : null,
            renterFirmadoEn: !isOwner ? new Date() : null,
            ownerDniUltimos4: isOwner ? body.dniUltimos4 : null,
            renterDniUltimos4: !isOwner ? body.dniUltimos4 : null,
            garantiaEstado: "HOLD",
            garantiaMontoRetenido: rental.garantiaSoles,
          },
        });

    const signed = Boolean(acta.ownerFirmadoEn && acta.renterFirmadoEn);

    if (signed && tipo === "ENTREGA") {
      assertTransition(rental.status as never, "ACTIVE");
      await prisma.item.update({ where: { id: rental.itemId }, data: { disponible: false } });
      await prisma.rental.update({ where: { id: rental.id }, data: { status: "ACTIVE" } });
    }

    if (signed && tipo === "DEVOLUCION") {
      const firstGrade = (existing?.conditionGrade ?? body.conditionGrade) as ConditionGrade;
      const secondGrade = body.conditionGrade as ConditionGrade;
      const severe = (g: ConditionGrade) => g === "DAMAGED" || g === "MISSING_PARTS";
      const damaged = severe(firstGrade) || severe(secondGrade);
      const mismatch = damaged && rental.status !== "DISPUTED";

      if (mismatch && rental.status !== "DISPUTED") {
        assertTransition(rental.status as never, "DISPUTED");
        await prisma.rental.update({
          where: { id: rental.id },
          data: {
            status: "DISPUTED",
            disputaMotivo:
              "La devolución no coincide con el estado de entrega. Garantía en retención.",
          },
        });
        await prisma.user.update({
          where: { id: rental.ownerId },
          data: { disputasAbiertas: { increment: 1 } },
        });
        await prisma.user.update({
          where: { id: rental.renterId },
          data: { disputasAbiertas: { increment: 1 } },
        });
      } else {
        const closeDispute = rental.status === "DISPUTED";
        if (rental.status !== "DISPUTED") {
          assertTransition(rental.status as never, "COMPLETED");
        }
        await prisma.$transaction([
          prisma.rental.update({ where: { id: rental.id }, data: { status: "COMPLETED" } }),
          prisma.item.update({ where: { id: rental.itemId }, data: { disponible: true } }),
          prisma.user.update({
            where: { id: rental.ownerId },
            data: {
              alquileresCompletados: { increment: 1 },
              devolucionesOk: damaged ? undefined : { increment: 1 },
              disputasAbiertas: closeDispute ? { decrement: 1 } : undefined,
            },
          }),
          prisma.user.update({
            where: { id: rental.renterId },
            data: {
              alquileresCompletados: { increment: 1 },
              devolucionesOk: damaged ? undefined : { increment: 1 },
              disputasAbiertas: closeDispute ? { decrement: 1 } : undefined,
            },
          }),
        ]);
        if (!rental.protocolFeePaid) {
          const { paymentsEnabled, PRICING } = await import("@/lib/payments/config");
          if (paymentsEnabled()) {
            const { recordPendingPayment } = await import("@/lib/payments/fulfillment");
            await recordPendingPayment({
              userId: rental.renterId,
              tipo: "PROTOCOL_FEE",
              montoSoles: PRICING.protocolFee.soles,
              rentalId: rental.id,
            });
          } else {
            await prisma.rental.update({
              where: { id: rental.id },
              data: { protocolFeePaid: true },
            });
          }
        }
        if (rental.escrowStatus === "HELD" && !damaged) {
          const { releaseEscrowForRental } = await import("@/lib/payments/escrow-release");
          await releaseEscrowForRental(rental.id, "RELEASE");
        }
        await notifyRentalEvent(rental.id, "COMPLETED");
      }
    }

    await logAudit({
      userId: user.id,
      action: `ACTA_SIGN_${tipo}`,
      entidad: "Acta",
      entidadId: acta.id,
      metadata: { rentalId: rental.id, signed },
    });

    return NextResponse.json({
      ok: true,
      signed,
      bothSigned: signed,
      statusAfter: signed ? (tipo === "ENTREGA" ? "ACTIVE" : "COMPLETED") : rental.status,
    });
  } catch (e) {
    if (e instanceof ZodError) return fromZod(e);
    return jsonError(e instanceof Error ? e.message : "No se pudo firmar el acta.");
  }
}
