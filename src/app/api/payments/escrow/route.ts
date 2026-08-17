import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isPhaseEnabled, PRICING } from "@/lib/payments/config";
import { createCheckoutPreference } from "@/lib/payments/mercadopago";
import { recordPendingPayment } from "@/lib/payments/fulfillment";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function POST(req: Request) {
  if (!isPhaseEnabled(2)) {
    return jsonError("Escrow de garantía disponible en Fase 2. Contacta soporte.", 503);
  }

  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const { rentalId } = await req.json();
  if (!rentalId) return jsonError("rentalId requerido");

  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) return jsonError("Alquiler no encontrado", 404);
  if (rental.renterId !== user.id) return jsonError("Solo el arrendatario retiene la garantía.", 403);
  if (rental.status !== "ACCEPTED" && rental.status !== "HANDOVER_PENDING") {
    return jsonError("La garantía se retiene tras aceptación y antes de la entrega.", 400);
  }
  if (rental.escrowStatus === "HELD") return jsonError("Garantía ya retenida.");

  const fee = rental.garantiaSoles * PRICING.escrowGarantiaFeePct;
  const total = rental.garantiaSoles + fee;

  const hold = await prisma.escrowHold.create({
    data: { rentalId, montoSoles: rental.garantiaSoles, status: "PENDING" },
  });

  const payment = await recordPendingPayment({
    userId: user.id,
    tipo: "ESCROW_GARANTIA",
    montoSoles: total,
    rentalId,
    metadata: { holdId: hold.id, garantia: rental.garantiaSoles, fee },
  });

  const checkout = await createCheckoutPreference({
    product: "ESCROW_GARANTIA",
    title: `Garantía ${rental.codigo}`,
    unitPrice: total,
    quantity: 1,
    userId: user.id,
    rentalId,
    externalReference: payment.id,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { mpPreferenceId: checkout.preferenceId ?? undefined },
  });

  return NextResponse.json({
    ok: true,
    initPoint: checkout.initPoint,
    demo: checkout.demo,
    monto: total,
    holdId: hold.id,
  });
}
