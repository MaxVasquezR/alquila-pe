import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createCheckoutPreference } from "@/lib/payments/mercadopago";
import { recordPendingPayment } from "@/lib/payments/fulfillment";
import { paymentsEnabled } from "@/lib/payments/config";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

/** Compat: POST bump usa checkout unificado */
export async function POST(_: Request, { params }: { params: { id: string } }) {
  if (!paymentsEnabled()) {
    return jsonError("Los cobros de la plataforma están desactivados en la beta.", 403);
  }
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item || item.userId !== user.id) return jsonError("No autorizado", 403);

  const payment = await recordPendingPayment({
    userId: user.id,
    tipo: "BUMP_STANDARD",
    montoSoles: 9.9,
    itemId: item.id,
  });

  const checkout = await createCheckoutPreference({
    product: "BUMP_STANDARD",
    title: "Destacado distrito",
    unitPrice: 9.9,
    quantity: 1,
    userId: user.id,
    itemId: item.id,
    externalReference: payment.id,
  });

  return NextResponse.json({ ok: true, initPoint: checkout.initPoint, paymentId: payment.id });
}
