import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { fulfillPayment } from "@/lib/payments/fulfillment";
import { paymentsDemoMode } from "@/lib/payments/config";
import { jsonError } from "@/lib/http";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" || !paymentsDemoMode()) {
    return jsonError("No encontrado", 404);
  }

  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const { paymentId } = await req.json();
  if (!paymentId) return jsonError("paymentId requerido");

  const payment = await fulfillPayment(paymentId);
  if (!payment) return jsonError("Pago no encontrado", 404);

  return NextResponse.json({ ok: true, status: payment.status, tipo: payment.tipo });
}
