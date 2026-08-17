import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { createSession, hashPassword } from "@/lib/auth";
import { consumeRateLimit, hashIp, logAudit } from "@/lib/security";
import { fromZod, getClientIp, jsonError } from "@/lib/http";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = await consumeRateLimit(`register:${ip ?? "na"}`, 8, 60 * 60 * 1000);
    if (!rl.ok) return jsonError("Demasiados intentos de registro. Espera una hora.", 429);

    const body = registerSchema.parse(await req.json());

    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.email }, { dni: body.dni }, { telefono: body.telefono }],
      },
    });
    if (exists) {
      if (exists.email === body.email) return jsonError("Ese correo ya está registrado.");
      if (exists.dni === body.dni) return jsonError("Ese DNI ya está registrado.");
      return jsonError("Ese celular ya está registrado.");
    }

    const user = await prisma.user.create({
      data: {
        nombre: body.nombre,
        apellidos: body.apellidos,
        dni: body.dni,
        telefono: body.telefono,
        email: body.email,
        passwordHash: await hashPassword(body.password),
        distrito: body.distrito,
        dniVerificado: false,
        telefonoVerificado: false,
        termsAcceptedAt: new Date(),
      },
    });

    await createSession(user.id);
    await logAudit({
      userId: user.id,
      action: "REGISTER",
      entidad: "User",
      entidadId: user.id,
      ipHash: hashIp(ip),
    });

    return NextResponse.json({ ok: true, needsVerification: true });
  } catch (e) {
    if (e instanceof ZodError) return fromZod(e);
    return jsonError("No se pudo crear la cuenta.", 500);
  }
}
