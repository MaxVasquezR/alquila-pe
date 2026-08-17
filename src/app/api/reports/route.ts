import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { MOTIVOS_REPORTE } from "@/lib/peru";
import { consumeRateLimit, logAudit } from "@/lib/security";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  targetId: z.string().uuid(),
  itemId: z.string().uuid().optional(),
  rentalId: z.string().uuid().optional(),
  motivo: z.string(),
  detalle: z.string().trim().min(20).max(800),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const rl = await consumeRateLimit(`report:${user.id}`, 5, 24 * 60 * 60 * 1000);
  if (!rl.ok) return jsonError("Límite diario de reportes alcanzado.", 429);

  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError("Reporte incompleto.");
  if (!MOTIVOS_REPORTE.includes(body.data.motivo as (typeof MOTIVOS_REPORTE)[number])) {
    return jsonError("Motivo no válido.");
  }
  if (body.data.targetId === user.id) return jsonError("No puedes reportarte a ti mismo.");

  await prisma.report.create({
    data: {
      reporterId: user.id,
      targetId: body.data.targetId,
      itemId: body.data.itemId,
      rentalId: body.data.rentalId,
      motivo: body.data.motivo,
      detalle: body.data.detalle,
    },
  });
  await prisma.user.update({
    where: { id: body.data.targetId },
    data: { strikes: { increment: 1 } },
  });
  await logAudit({
    userId: user.id,
    action: "REPORT_CREATE",
    entidad: "User",
    entidadId: body.data.targetId,
  });

  return NextResponse.json({ ok: true });
}
