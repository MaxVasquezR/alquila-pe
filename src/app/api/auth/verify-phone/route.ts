import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { sendPhoneOtp } from "@/lib/otp";
import { consumeRateLimit, logAudit } from "@/lib/security";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ telefono: z.string().regex(/^9\d{8}$/) });

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const rl = await consumeRateLimit(`otp-send:${user.id}`, 5, 60 * 60 * 1000);
  if (!rl.ok) return jsonError("Demasiados OTP enviados. Espera 1 hora.", 429);

  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError("Celular inválido.");
  if (body.data.telefono !== user.telefono) {
    return jsonError("El celular no coincide con el de tu cuenta.");
  }

  try {
    const result = await sendPhoneOtp(user.id, user.telefono);
    await logAudit({
      userId: user.id,
      action: "OTP_SEND",
      entidad: "User",
      entidadId: user.id,
      metadata: { demo: result.demo ?? false },
    });
    return NextResponse.json({
      ok: true,
      demo: result.demo,
      message: result.demo
        ? "Modo demo: usa el código 184729 (configura Twilio para SMS real)."
        : "Código enviado por SMS.",
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "No se pudo enviar OTP.", 500);
  }
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const body = z
    .object({ telefono: z.string(), otp: z.string().regex(/^\d{6}$/) })
    .safeParse(await req.json());
  if (!body.success) return jsonError("OTP inválido.");

  const { verifyPhoneOtp } = await import("@/lib/otp");
  const ok = await verifyPhoneOtp(user.id, body.data.telefono, body.data.otp);
  if (!ok) return jsonError("Código incorrecto o expirado.");

  await prisma.user.update({
    where: { id: user.id },
    data: { telefonoVerificado: true, verificadoEn: user.verificadoEn ?? new Date() },
  });
  await logAudit({
    userId: user.id,
    action: "VERIFY_PHONE",
    entidad: "User",
    entidadId: user.id,
  });
  return NextResponse.json({ ok: true });
}
