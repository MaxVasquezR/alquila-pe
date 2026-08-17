import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";
import type { PublicUser } from "./types";
export type { PublicUser } from "./types";

const COOKIE = "alquila_session";

function secret() {
  const raw = process.env.SESSION_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("SESSION_SECRET inválido");
  }
  return new TextEncoder().encode(raw);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSessionUser(): Promise<User | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return prisma.user.findUnique({ where: { id: payload.sub } });
  } catch {
    return null;
  }
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    nombre: user.nombre,
    apellidos: user.apellidos,
    email: user.email,
    distrito: user.distrito,
    dniVerificado: user.dniVerificado,
    telefonoVerificado: user.telefonoVerificado,
    reputacionScore: user.reputacionScore,
    reputacionCount: user.reputacionCount,
    alquileresCompletados: user.alquileresCompletados,
    devolucionesOk: user.devolucionesOk,
    rol: user.rol,
    dniMasked: `****${user.dni.slice(-4)}`,
    telefonoMasked: `9****${user.telefono.slice(-3)}`,
  };
}

export function displayName(user: Pick<User, "nombre" | "apellidos">) {
  return `${user.nombre} ${user.apellidos}`.trim();
}

export function canTransact(user: User) {
  return user.dniVerificado && user.telefonoVerificado && user.strikes < 3;
}

export function isFullyVerified(user: User) {
  return user.dniVerificado && user.telefonoVerificado;
}

export function isAdmin(user: User) {
  return user.rol === "ADMIN" || user.email === process.env.ADMIN_EMAIL;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user)) return null;
  return user;
}
