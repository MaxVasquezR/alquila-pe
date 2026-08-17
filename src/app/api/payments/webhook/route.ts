import { NextResponse } from "next/server";
import { fulfillPayment } from "@/lib/payments/fulfillment";
import { jsonError } from "@/lib/http";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const type = body?.type ?? req.headers.get("x-mp-signature") ? "payment" : "unknown";

  if (type === "payment" || body?.data?.id) {
    const paymentId = body?.data?.id;
    if (paymentId && process.env.MP_ACCESS_TOKEN) {
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
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");
  const topic = searchParams.get("topic");
  const id = searchParams.get("id");

  if (topic === "payment" && id && process.env.MP_ACCESS_TOKEN) {
    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      });
      const mp = await res.json();
      if (mp.status === "approved" && mp.external_reference) {
        await fulfillPayment(mp.external_reference, String(id));
      }
    } catch {
      /* ignore */
    }
  }

  if (ref) {
    await fulfillPayment(ref);
  }

  return NextResponse.json({ ok: true });
}
