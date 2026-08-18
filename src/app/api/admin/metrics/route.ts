import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { z } from "zod";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return jsonError("No autorizado", 403);

  const [
    users,
    items,
    rentalsCompleted,
    rentalsActive,
    devolucionesOk,
    paymentsApproved,
    disputes,
    reportsOpen,
    complaintsOpen,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.item.count({ where: { disponible: true } }),
    prisma.rental.count({ where: { status: "COMPLETED" } }),
    prisma.rental.count({
      where: { status: { in: ["ACTIVE", "RETURN_PENDING", "HANDOVER_PENDING"] } },
    }),
    prisma.user.aggregate({ _sum: { devolucionesOk: true } }),
    prisma.payment.findMany({ where: { status: "APPROVED" }, select: { montoSoles: true, tipo: true } }),
    prisma.rental.count({ where: { status: "DISPUTED" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.complaint.count({ where: { status: "OPEN" } }),
  ]);

  const gmv = await prisma.rental.aggregate({
    where: { status: "COMPLETED" },
    _sum: { totalSoles: true },
  });

  const ingresos = paymentsApproved.reduce((s, p) => s + p.montoSoles, 0);
  const byTipo = paymentsApproved.reduce(
    (acc, p) => {
      acc[p.tipo] = (acc[p.tipo] ?? 0) + p.montoSoles;
      return acc;
    },
    {} as Record<string, number>,
  );

  return NextResponse.json({
    users,
    itemsActivos: items,
    intercambiosCompletados: rentalsCompleted,
    alquileresActivos: rentalsActive,
    devolucionesOk: devolucionesOk._sum.devolucionesOk ?? 0,
    gmvCompletado: gmv._sum.totalSoles ?? 0,
    ingresosPlataforma: ingresos,
    ingresosPorTipo: byTipo,
    disputasAbiertas: disputes,
    reportesAbiertos: reportsOpen,
    reclamosAbiertos: complaintsOpen,
  });
}

const patchSchema = z.object({
  action: z.enum([
    "resolve_report",
    "resolve_dispute",
    "resolve_complaint",
    "release_escrow",
    "claim_escrow",
    "publish_item",
  ]),
  id: z.string(),
  resolution: z.string().optional(),
});

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("No autorizado", 403);

  const body = patchSchema.safeParse(await req.json());
  if (!body.success) return jsonError("Acción inválida");

  const { action, id, resolution } = body.data;

  if (action === "resolve_report") {
    await prisma.report.update({ where: { id }, data: { status: "RESOLVED" } });
  } else if (action === "publish_item") {
    await prisma.item.update({ where: { id }, data: { publicado: true } });
  } else if (action === "resolve_complaint") {
    await prisma.complaint.update({ where: { id }, data: { status: "RESOLVED" } });
  } else if (action === "release_escrow") {
    const { releaseEscrowForRental } = await import("@/lib/payments/escrow-release");
    await releaseEscrowForRental(id, "RELEASE", { adminUserId: admin.id, notas: resolution });
  } else if (action === "claim_escrow") {
    const { releaseEscrowForRental } = await import("@/lib/payments/escrow-release");
    await releaseEscrowForRental(id, "CLAIM", { adminUserId: admin.id, notas: resolution });
  } else if (action === "resolve_dispute") {
    const rental = await prisma.rental.findUnique({ where: { id } });
    if (!rental) return jsonError("Alquiler no encontrado", 404);
    await prisma.$transaction([
      prisma.rental.update({
        where: { id },
        data: { status: "COMPLETED", disputaMotivo: resolution ?? rental.disputaMotivo },
      }),
      prisma.item.update({ where: { id: rental.itemId }, data: { disponible: true } }),
      prisma.user.update({
        where: { id: rental.ownerId },
        data: { disputasAbiertas: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: rental.renterId },
        data: { disputasAbiertas: { decrement: 1 } },
      }),
    ]);
    if (rental.escrowStatus === "HELD") {
      const { releaseEscrowForRental } = await import("@/lib/payments/escrow-release");
      await releaseEscrowForRental(id, "RELEASE", { adminUserId: admin.id, notas: resolution });
    }
  }

  return NextResponse.json({ ok: true });
}
