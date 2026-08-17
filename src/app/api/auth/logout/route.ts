import { NextResponse } from "next/server";
import { clearSession, getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/security";

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    await logAudit({
      userId: user.id,
      action: "LOGOUT",
      entidad: "User",
      entidadId: user.id,
    });
  }
  clearSession();
  return NextResponse.json({ ok: true });
}
