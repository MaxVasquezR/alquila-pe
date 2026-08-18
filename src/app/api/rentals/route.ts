import { prisma } from "@/lib/prisma";
import { canTransact, getSessionUser } from "@/lib/auth";
import { rentalRequestSchema } from "@/lib/validations";
import {
  BLOCKING_STATUSES,
  datesOverlap,
  generateRentalCode,
  rentalDays,
  startOfDay,
} from "@/lib/rental-machine";
import { consumeRateLimit, logAudit, riskForOwner, riskForRenter } from "@/lib/security";
import { notifyRentalEvent } from "@/lib/notifications";
import { renterHasUnpaidProtocolFee } from "@/lib/business-rules";
import { fromZod, jsonError } from "@/lib/http";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);

  const rentals = await prisma.rental.findMany({
    where: { OR: [{ ownerId: user.id }, { renterId: user.id }] },
    include: {
      item: true,
      owner: true,
      renter: true,
      actas: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ rentals });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión para solicitar un alquiler.", 401);
  if (!canTransact(user)) {
    return jsonError("Verifica DNI y celular antes de solicitar un alquiler.", 403);
  }
  if (user.disputasAbiertas > 0) {
    return jsonError("Tienes una disputa abierta. Ciérrala antes de un nuevo alquiler.", 403);
  }
  if (await renterHasUnpaidProtocolFee(user.id)) {
    return jsonError(
      "Tienes un fee de protocolo pendiente por un intercambio cerrado. Págalo en Alquileres antes de solicitar otro.",
      403,
    );
  }

  const rl = await consumeRateLimit(`rental-req:${user.id}`, 10, 24 * 60 * 60 * 1000);
  if (!rl.ok) return jsonError("Límite diario de solicitudes alcanzado.", 429);

  try {
    const body = rentalRequestSchema.parse(await req.json());
    const item = await prisma.item.findUnique({
      where: { id: body.itemId },
      include: { user: true },
    });
    if (!item || !item.disponible || !item.publicado) return jsonError("Este bien no está disponible.");
    if (item.userId === user.id) return jsonError("No puedes alquilar tu propio bien.");
    if (!item.user.dniVerificado) return jsonError("El dueño aún no está verificado.");

    const start = startOfDay(body.fechaInicio);
    const end = startOfDay(body.fechaFin);
    const today = startOfDay(new Date().toISOString().slice(0, 10));
    if (start < today) return jsonError("La fecha de inicio no puede ser pasada.");
    if (end < start) return jsonError("La fecha de fin debe ser posterior al inicio.");

    const dias = rentalDays(start, end);
    if (dias < item.minDias || dias > item.maxDias) {
      return jsonError(`Este bien se alquila entre ${item.minDias} y ${item.maxDias} día(s).`);
    }

    const renterFlags = riskForRenter(user);
    if (renterFlags.some((f) => f.level === "block")) {
      return jsonError(renterFlags.find((f) => f.level === "block")!.message, 403);
    }
    const ownerFlags = riskForOwner(item.user, item);
    if (ownerFlags.some((f) => f.level === "block")) {
      return jsonError(ownerFlags.find((f) => f.level === "block")!.message, 403);
    }

    const conflicts = await prisma.rental.findMany({
      where: { itemId: item.id, status: { in: BLOCKING_STATUSES } },
    });
    const overlap = conflicts.some((r) => datesOverlap(start, end, r.fechaInicio, r.fechaFin));
    if (overlap) return jsonError("Esas fechas chocan con otro alquiler ya aceptado.");

    const rental = await prisma.rental.create({
      data: {
        codigo: generateRentalCode(),
        itemId: item.id,
        ownerId: item.userId,
        renterId: user.id,
        fechaInicio: start,
        fechaFin: end,
        dias,
        precioDiaSoles: item.precioDiaSoles,
        totalSoles: Number((item.precioDiaSoles * dias).toFixed(2)),
        garantiaSoles: item.garantiaSugeridaSoles,
        status: "REQUESTED",
        mensajeRenter: body.mensajeRenter,
        puntoEncuentro: body.puntoEncuentro ?? null,
      },
    });

    await logAudit({
      userId: user.id,
      action: "RENTAL_REQUEST",
      entidad: "Rental",
      entidadId: rental.id,
      metadata: { codigo: rental.codigo },
    });
    await notifyRentalEvent(rental.id, "REQUESTED");

    return NextResponse.json({ ok: true, id: rental.id, codigo: rental.codigo });
  } catch (e) {
    if (e instanceof ZodError) return fromZod(e);
    return jsonError("No se pudo crear la solicitud.", 500);
  }
}
