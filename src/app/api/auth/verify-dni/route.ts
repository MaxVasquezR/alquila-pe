import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { isValidDni, last4 } from "@/lib/validations";
import { consumeRateLimit, logAudit } from "@/lib/security";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  dni: z.string(),
  dniConfirm: z.string(),
  last4: z.string().regex(/^\d{4}$/),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const rl = await consumeRateLimit(`verify-dni:${user.id}`, 6, 60 * 60 * 1000);
  if (!rl.ok) return jsonError("Demasiados intentos de verificación.", 429);

  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError("Datos incompletos.");

  if (body.data.dni !== user.dni || body.data.dniConfirm !== user.dni) {
    return jsonError("El DNI no coincide con el registrado en tu cuenta.");
  }
  if (!isValidDni(body.data.dni)) return jsonError("DNI con formato inválido.");
  if (body.data.last4 !== last4(user.dni)) {
    return jsonError("Los últimos 4 dígitos no coinciden.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      dniVerificado: true,
      verificadoEn: user.verificadoEn ?? new Date(),
    },
  });
  await logAudit({
    userId: user.id,
    action: "VERIFY_DNI",
    entidad: "User",
    entidadId: user.id,
  });
  return NextResponse.json({ ok: true });
}
