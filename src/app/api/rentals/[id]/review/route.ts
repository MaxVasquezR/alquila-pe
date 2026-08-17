import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/security";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comentario: z.string().trim().min(12).max(400),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: { reviews: true },
  });
  if (!rental) return jsonError("Alquiler no encontrado", 404);
  if (rental.status !== "COMPLETED") {
    return jsonError("Solo se califica después de una devolución cerrada.");
  }
  if (rental.ownerId !== user.id && rental.renterId !== user.id) {
    return jsonError("No autorizado", 403);
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError("Calificación inválida.");

  const tipo = user.id === rental.renterId ? "RENTER_TO_OWNER" : "OWNER_TO_RENTER";
  if (rental.reviews.some((r) => r.tipo === tipo)) {
    return jsonError("Ya dejaste tu reseña en este intercambio.");
  }

  const toUserId = user.id === rental.renterId ? rental.ownerId : rental.renterId;

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        rentalId: rental.id,
        fromUserId: user.id,
        toUserId,
        tipo,
        rating: body.data.rating,
        comentario: body.data.comentario,
      },
    });
    const stats = await tx.review.aggregate({
      where: { toUserId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await tx.user.update({
      where: { id: toUserId },
      data: {
        reputacionScore: Number((stats._avg.rating ?? 5).toFixed(2)),
        reputacionCount: stats._count.rating,
      },
    });
  });

  await logAudit({
    userId: user.id,
    action: "REVIEW_CREATE",
    entidad: "Rental",
    entidadId: rental.id,
  });

  return NextResponse.json({ ok: true });
}
