import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { createSession, verifyPassword } from "@/lib/auth";
import { consumeRateLimit, hashIp, logAudit } from "@/lib/security";
import { fromZod, getClientIp, jsonError } from "@/lib/http";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = await consumeRateLimit(`login:${ip ?? "na"}`, 12, 15 * 60 * 1000);
    if (!rl.ok) return jsonError("Demasiados intentos. Espera 15 minutos.", 429);

    const body = loginSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return jsonError("Correo o contraseña incorrectos.", 401);
    }

    await createSession(user.id);
    await logAudit({
      userId: user.id,
      action: "LOGIN",
      entidad: "User",
      entidadId: user.id,
      ipHash: hashIp(ip),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ZodError) return fromZod(e);
    return jsonError("No se pudo iniciar sesión.", 500);
  }
}
