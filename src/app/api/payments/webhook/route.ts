import { NextResponse } from "next/server";
import { fulfillPayment } from "@/lib/payments/fulfillment";
import { paymentsEnabled } from "@/lib/payments/config";

export async function POST(req: Request) {
  if (!paymentsEnabled() || !process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const body = await req.json().catch(() => ({}));
  const paymentId = body?.data?.id;
  if (!paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });
    const mp = await res.json();
    if (mp.status === "approved" && mp.external_reference) {
      await fulfillPayment(mp.external_reference, String(paymentId));
    }
  } catch {
    /* webhook best-effort */
  }

  return NextResponse.json({ ok: true });
}

/** Mercado Pago a veces hace GET de verificación. Nunca cumplir pagos por query. */
export async function GET() {
  return NextResponse.json({ ok: true });
}
