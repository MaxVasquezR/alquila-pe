import type { RentalStatus } from "./types";

export const STATUS_LABEL: Record<RentalStatus, string> = {
  REQUESTED: "Solicitud enviada",
  REJECTED: "Rechazada",
  ACCEPTED: "Aceptada · coordinar entrega",
  HANDOVER_PENDING: "Acta de entrega en curso",
  ACTIVE: "Alquiler en curso",
  RETURN_PENDING: "Acta de devolución en curso",
  DISPUTED: "Disputa abierta",
  COMPLETED: "Cerrado con devolución",
  CANCELLED: "Cancelado",
};

const ALLOWED: Record<RentalStatus, RentalStatus[]> = {
  REQUESTED: ["ACCEPTED", "REJECTED", "CANCELLED"],
  REJECTED: [],
  ACCEPTED: ["HANDOVER_PENDING", "CANCELLED"],
  HANDOVER_PENDING: ["ACTIVE", "DISPUTED", "CANCELLED"],
  ACTIVE: ["RETURN_PENDING", "DISPUTED"],
  RETURN_PENDING: ["COMPLETED", "DISPUTED"],
  DISPUTED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: RentalStatus, to: RentalStatus) {
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: RentalStatus, to: RentalStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Transición no permitida: ${from} → ${to}`);
  }
}

export function datesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart <= bEnd && bStart <= aEnd;
}

export function rentalDays(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / 86_400_000);
  return Math.max(1, days);
}

export function startOfDay(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export const BLOCKING_STATUSES: RentalStatus[] = [
  "ACCEPTED",
  "HANDOVER_PENDING",
  "ACTIVE",
  "RETURN_PENDING",
  "DISPUTED",
];

export function generateRentalCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  const y = new Date().getFullYear();
  return `ALQ-${y}-${n}`;
}
