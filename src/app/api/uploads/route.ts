import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { storeUpload } from "@/lib/storage";
import { consumeRateLimit } from "@/lib/security";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión", 401);
  if (!user.dniVerificado) return jsonError("Verifica tu DNI antes de subir fotos.", 403);

  const rl = await consumeRateLimit(`upload:${user.id}`, 30, 24 * 60 * 60 * 1000);
  if (!rl.ok) return jsonError("Límite diario de cargas alcanzado.", 429);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Archivo requerido.");

  try {
    const url = await storeUpload(file, user.id);
    return NextResponse.json({ url });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Error al subir", 400);
  }
}
