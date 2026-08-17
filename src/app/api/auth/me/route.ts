import { NextResponse } from "next/server";
import { getSessionUser, toPublicUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("No autenticado", 401);
  return NextResponse.json({ user: { ...toPublicUser(user), strikes: user.strikes } });
}
