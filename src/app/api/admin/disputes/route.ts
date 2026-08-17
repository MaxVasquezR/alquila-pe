import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return jsonError("No autorizado", 403);

  const [reports, disputes, complaints] = await Promise.all([
    prisma.report.findMany({
      where: { status: "OPEN" },
      include: { reporter: true, target: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.rental.findMany({
      where: { status: "DISPUTED" },
      include: { item: true, owner: true, renter: true },
      take: 20,
    }),
    prisma.complaint.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({ reports, disputes, complaints });
}
