import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseJsonArray } from "@/lib/validations";
import { jsonError } from "@/lib/http";
import { maskDni, maskPhone } from "@/lib/validations";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: {
      item: true,
      owner: true,
      renter: true,
      actas: true,
      reviews: true,
    },
  });
  if (!rental) return jsonError("Alquiler no encontrado", 404);
  if (rental.ownerId !== user.id && rental.renterId !== user.id) {
    return jsonError("No tienes acceso a este alquiler.", 403);
  }

  const phoneUnlocked =
    rental.telefonoDesbloqueado &&
    (rental.status === "ACCEPTED" ||
      rental.status === "HANDOVER_PENDING" ||
      rental.status === "ACTIVE" ||
      rental.status === "RETURN_PENDING" ||
      rental.status === "DISPUTED");

  const counterparty = rental.ownerId === user.id ? rental.renter : rental.owner;

  return NextResponse.json({
    rental: {
      ...rental,
      item: {
        ...rental.item,
        fotos: parseJsonArray(rental.item.fotos),
        accesorios: parseJsonArray(rental.item.accesorios),
      },
      actas: rental.actas.map((a) => ({
        ...a,
        fotosEvidencia: parseJsonArray(a.fotosEvidencia),
        checklist: JSON.parse(a.checklist || "{}"),
      })),
      counterparty: {
        id: counterparty.id,
        nombre: counterparty.nombre,
        apellidos: counterparty.apellidos,
        distrito: counterparty.distrito,
        dniMasked: maskDni(counterparty.dni),
        telefonoMasked: maskPhone(counterparty.telefono),
        telefono: phoneUnlocked ? counterparty.telefono : null,
        dniVerificado: counterparty.dniVerificado,
        reputacionScore: counterparty.reputacionScore,
        reputacionCount: counterparty.reputacionCount,
      },
      role: rental.ownerId === user.id ? "OWNER" : "RENTER",
    },
  });
}
