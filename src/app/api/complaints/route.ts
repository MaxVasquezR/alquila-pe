import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  nombre: z.string().min(3),
  email: z.string().email(),
  telefono: z.string().min(9),
  tipoDoc: z.string(),
  numDoc: z.string().min(6),
  domicilio: z.string().min(5),
  producto: z.string().min(3),
  monto: z.coerce.number().optional(),
  descripcion: z.string().min(20),
  pedido: z.string().min(10),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError("Completa todos los campos del reclamo.");

  const row = await prisma.complaint.create({
    data: {
      userId: user?.id,
      ...body.data,
      monto: body.data.monto ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: row.id.slice(0, 8).toUpperCase() });
}
