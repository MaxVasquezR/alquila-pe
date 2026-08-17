import { z } from "zod";
import { DISTRITOS_LIMA } from "./peru";

const DNI_BLOCKLIST = new Set([
  "00000000",
  "11111111",
  "22222222",
  "12345678",
  "87654321",
  "01234567",
  "12312312",
  "99999999",
]);

export function isValidDni(dni: string): boolean {
  if (!/^\d{8}$/.test(dni)) return false;
  if (DNI_BLOCKLIST.has(dni)) return false;
  if (/^(\d)\1{7}$/.test(dni)) return false;
  const digits = dni.split("").map(Number);
  const sequentialUp = digits.every((d, i) => i === 0 || d === (digits[i - 1] + 1) % 10);
  const sequentialDown = digits.every((d, i) => i === 0 || d === (digits[i - 1] + 9) % 10);
  if (sequentialUp || sequentialDown) return false;
  return true;
}

export function isValidCelularPeru(phone: string): boolean {
  return /^9\d{8}$/.test(phone);
}

export function maskDni(dni: string): string {
  if (!dni || dni.length < 4) return "********";
  return `****${dni.slice(-4)}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return "*********";
  return `9****${phone.slice(-3)}`;
}

export function last4(dni: string): string {
  return dni.slice(-4);
}

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Incluye al menos una mayúscula")
  .regex(/[a-z]/, "Incluye al menos una minúscula")
  .regex(/\d/, "Incluye al menos un número");

export const registerSchema = z.object({
  nombre: z.string().trim().min(2).max(40).regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/, "Solo letras"),
  apellidos: z.string().trim().min(2).max(60).regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/, "Solo letras"),
  dni: z.string().refine(isValidDni, "DNI inválido. Debe tener 8 dígitos reales, no secuenciales"),
  telefono: z.string().refine(isValidCelularPeru, "Celular inválido. Debe ser 9 dígitos y empezar con 9"),
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  distrito: z.string().refine((d) => DISTRITOS_LIMA.includes(d as (typeof DISTRITOS_LIMA)[number]), "Distrito no válido"),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Debes aceptar los Términos y la Política de Privacidad." }) }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const itemSchema = z.object({
  titulo: z.string().trim().min(8).max(80),
  descripcion: z.string().trim().min(40).max(2000),
  categoria: z.enum(["herramientas", "eventos", "tecnologia", "hogar", "movilidad"]),
  precioDiaSoles: z.number().min(5).max(2000),
  valorEstimadoSoles: z.number().min(20).max(100000),
  garantiaSugeridaSoles: z.number().min(0).max(20000),
  minDias: z.number().int().min(1).max(7),
  maxDias: z.number().int().min(1).max(30),
  distrito: z.string().refine((d) => DISTRITOS_LIMA.includes(d as (typeof DISTRITOS_LIMA)[number])),
  zonaReferencial: z.string().trim().min(8).max(80),
  fotos: z.array(z.string().min(4)).min(3).max(4),
  accesorios: z.array(z.string().trim().min(2).max(80)).max(12),
  serialOIdentificador: z.string().trim().max(60).optional().nullable(),
});

export const rentalRequestSchema = z.object({
  itemId: z.string().uuid(),
  fechaInicio: z.string().min(8),
  fechaFin: z.string().min(8),
  mensajeRenter: z.string().trim().min(10).max(400),
  puntoEncuentro: z.string().trim().min(8).max(120).optional(),
});

export const signActaSchema = z
  .object({
    dniUltimos4: z.string().regex(/^\d{4}$/, "Ingresa los 4 últimos dígitos de tu DNI"),
    conditionGrade: z.enum(["EXCELLENT", "GOOD", "FAIR", "DAMAGED", "MISSING_PARTS"]),
    checklist: z.record(z.boolean()),
    notas: z.string().trim().max(600).optional().default(""),
    fotosEvidencia: z.array(z.string().min(4)).min(2).max(6),
    garantiaEstado: z.enum(["HOLD", "RELEASED", "PARTIAL", "CLAIMED"]).optional(),
    garantiaMontoRetenido: z.number().min(0).optional(),
  })
  .transform(({ garantiaEstado: _g, garantiaMontoRetenido: _m, ...rest }) => rest);

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
