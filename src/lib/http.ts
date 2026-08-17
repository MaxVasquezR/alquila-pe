import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function fromZod(err: ZodError) {
  const first = err.errors[0];
  return jsonError(first?.message ?? "Datos inválidos", 422, {
    fields: err.flatten().fieldErrors,
  });
}

export function getClientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip");
}
