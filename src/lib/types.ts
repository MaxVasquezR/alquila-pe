export type Role = "USER" | "PREMIUM_OWNER" | "ADMIN";

export type RentalStatus =
  | "REQUESTED"
  | "REJECTED"
  | "ACCEPTED"
  | "HANDOVER_PENDING"
  | "ACTIVE"
  | "RETURN_PENDING"
  | "DISPUTED"
  | "COMPLETED"
  | "CANCELLED";

export type ActaTipo = "ENTREGA" | "DEVOLUCION";

export type ConditionGrade = "EXCELLENT" | "GOOD" | "FAIR" | "DAMAGED" | "MISSING_PARTS";

export type GarantiaEstado = "HOLD" | "RELEASED" | "PARTIAL" | "CLAIMED";

export type ReviewTipo = "RENTER_TO_OWNER" | "OWNER_TO_RENTER";

export const CONDITION_LABEL: Record<ConditionGrade, string> = {
  EXCELLENT: "Excelente · como nuevo",
  GOOD: "Bueno · uso normal",
  FAIR: "Regular · desgaste visible",
  DAMAGED: "Dañado",
  MISSING_PARTS: "Faltan piezas / accesorios",
};

export const GARANTIA_LABEL: Record<GarantiaEstado, string> = {
  HOLD: "Retenida hasta la devolución",
  RELEASED: "Liberada al arrendatario",
  PARTIAL: "Retención parcial",
  CLAIMED: "Reclamada por el dueño",
};

export type PublicUser = {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  distrito: string;
  dniVerificado: boolean;
  telefonoVerificado: boolean;
  reputacionScore: number;
  reputacionCount: number;
  alquileresCompletados: number;
  devolucionesOk: number;
  rol: string;
  dniMasked: string;
  telefonoMasked: string;
};

export type RiskFlag = {
  level: "info" | "warn" | "block";
  code: string;
  message: string;
};
