import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createCheckoutPreference, productPricing } from "@/lib/payments/mercadopago";
import { recordPendingPayment } from "@/lib/payments/fulfillment";
import { isPhaseEnabled, paymentsDemoMode, type PaymentProduct } from "@/lib/payments/config";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  product: z.enum(["BUMP_STANDARD", "BUMP_PREMIUM", "PREMIUM_SUBSCRIPTION", "PROTOCOL_FEE"]),
  itemId: z.string().uuid().optional(),
  rentalId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError("Producto inválido.");

  const { product, itemId, rentalId } = body.data;

  if (product.startsWith("BUMP") && !itemId) {
    return jsonError("itemId requerido para bump.");
  }
  if (product === "PREMIUM_SUBSCRIPTION" && user.rol === "PREMIUM_OWNER") {
    return jsonError("Ya tienes Premium activo.");
  }
  if (product === "PROTOCOL_FEE" && !rentalId) {
    return jsonError("rentalId requerido para fee protocolo.");
  }

  if (product === "BUMP_STANDARD" || product === "BUMP_PREMIUM") {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== user.id) return jsonError("Anuncio no encontrado.", 404);
  }

  const { soles, title } = productPricing(product as PaymentProduct);
  const payment = await recordPendingPayment({
    userId: user.id,
    tipo: product as PaymentProduct,
    montoSoles: soles,
    itemId,
    rentalId,
  });

  const checkout = await createCheckoutPreference({
    product: product as PaymentProduct,
    title,
    unitPrice: soles,
    quantity: 1,
    userId: user.id,
    itemId,
    rentalId,
    externalReference: payment.id,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { mpPreferenceId: checkout.preferenceId ?? undefined },
  });

  return NextResponse.json({
    ok: true,
    paymentId: payment.id,
    initPoint: checkout.initPoint,
    demo: checkout.demo ?? paymentsDemoMode(),
    phase: isPhaseEnabled(1),
  });
}
