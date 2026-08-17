import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { expireBoostedItems, syncPremiumExpiry } from "@/lib/payments/fulfillment";
import { jsonError } from "@/lib/http";

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) return jsonError("No autorizado", 401);

  const boosts = await expireBoostedItems();
  const premium = await syncPremiumExpiry();
  return NextResponse.json({ ok: true, boostsExpired: boosts, premiumExpired: premium });
}

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user)) {
    if (!authorized(req)) return jsonError("No autorizado", 401);
  }
  const boosts = await expireBoostedItems();
  const premium = await syncPremiumExpiry();
  return NextResponse.json({ ok: true, boostsExpired: boosts, premiumExpired: premium });
}
