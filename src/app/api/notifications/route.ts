import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("No autenticado", 401);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const unread = await prisma.notification.count({
    where: { userId: user.id, leida: false },
  });
  return NextResponse.json({ notifications, unread });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("No autenticado", 401);

  const { id, all } = await req.json();
  if (all) {
    await prisma.notification.updateMany({
      where: { userId: user.id, leida: false },
      data: { leida: true },
    });
  } else if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { leida: true },
    });
  }
  return NextResponse.json({ ok: true });
}
