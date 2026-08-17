import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const { motivo } = await req.json();
  if (!motivo || String(motivo).length < 10) {
    return jsonError("Describe por qué necesitas verificación adicional.");
  }

  const pending = await prisma.kycRequest.findFirst({
    where: { userId: user.id, status: "PENDING" },
  });
  if (pending) return jsonError("Ya tienes una solicitud KYC en revisión.");

  const row = await prisma.kycRequest.create({
    data: { userId: user.id, motivo: String(motivo) },
  });
  return NextResponse.json({ ok: true, id: row.id });
}
