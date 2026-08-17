import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseJsonArray } from "@/lib/validations";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";
import { maskDni } from "@/lib/validations";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      user: true,
    },
  });
  if (!item) return jsonError("Anuncio no encontrado", 404);

  const me = await getSessionUser();
  const isOwner = me?.id === item.userId;

  return NextResponse.json({
    item: {
      ...item,
      fotos: parseJsonArray(item.fotos),
      accesorios: parseJsonArray(item.accesorios),
      user: {
        id: item.user.id,
        nombre: item.user.nombre,
        apellidos: item.user.apellidos,
        distrito: item.user.distrito,
        dniVerificado: item.user.dniVerificado,
        telefonoVerificado: item.user.telefonoVerificado,
        reputacionScore: item.user.reputacionScore,
        reputacionCount: item.user.reputacionCount,
        alquileresCompletados: item.user.alquileresCompletados,
        devolucionesOk: item.user.devolucionesOk,
        rol: item.user.rol,
        dniMasked: maskDni(item.user.dni),
        createdAt: item.user.createdAt,
      },
      telefono: isOwner ? item.user.telefono : undefined,
    },
  });
}
