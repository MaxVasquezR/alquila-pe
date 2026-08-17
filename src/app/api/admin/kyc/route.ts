import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { z } from "zod";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return jsonError("No autorizado", 403);

  const queue = await prisma.kycRequest.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          email: true,
          dni: true,
          telefono: true,
          distrito: true,
          dniVerificado: true,
          telefonoVerificado: true,
          strikes: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ queue });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  notas: z.string().max(400).optional(),
});

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("No autorizado", 403);

  const body = patchSchema.safeParse(await req.json());
  if (!body.success) return jsonError("Datos inválidos");

  const row = await prisma.kycRequest.findUnique({
    where: { id: body.data.id },
    include: { user: true },
  });
  if (!row || row.status !== "PENDING") return jsonError("Solicitud no encontrada", 404);

  if (body.data.action === "approve") {
    await prisma.$transaction([
      prisma.kycRequest.update({
        where: { id: row.id },
        data: { status: "APPROVED", notas: body.data.notas ?? "Aprobado por admin" },
      }),
      prisma.user.update({
        where: { id: row.userId },
        data: {
          dniVerificado: true,
          telefonoVerificado: true,
          kycVerificado: true,
          verificadoEn: new Date(),
        },
      }),
    ]);
  } else {
    await prisma.kycRequest.update({
      where: { id: row.id },
      data: { status: "REJECTED", notas: body.data.notas ?? "Rechazado" },
    });
  }
  return NextResponse.json({ ok: true });
}
