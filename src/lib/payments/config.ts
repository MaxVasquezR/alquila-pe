/**
 * Modelo de pagos escalonado — Plan Maestro Alquila
 * Fase 1: bumps, Premium, fee protocolo (sin custodia de alquiler)
 * Fase 2: escrow garantía
 * Fase 3: escrow alquiler + comisión GMV (feature flag)
 */

export type PaymentPhase = 1 | 2 | 3;

export const PAYMENT_PHASE: PaymentPhase = Number(process.env.ALQUILA_PAYMENT_PHASE ?? "1") as PaymentPhase;

export const PRICING = {
  bump: {
    standard: { soles: 9.9, dias: 3, label: "Destacado distrito" },
    premium: { soles: 14.9, dias: 3, label: "Top 3 distrito" },
  },
  premium: {
    mensual: { soles: 24.9, label: "Membresía Premium dueño" },
  },
  protocolFee: { soles: 2.5, label: "Fee protocolo (acta cerrada)" },
  escrowGarantiaFeePct: 0.04,
  gmvCommissionPct: 0.1,
} as const;

export type PaymentProduct =
  | "BUMP_STANDARD"
  | "BUMP_PREMIUM"
  | "PREMIUM_SUBSCRIPTION"
  | "PROTOCOL_FEE"
  | "ESCROW_GARANTIA";

export function isPhaseEnabled(minPhase: PaymentPhase): boolean {
  return PAYMENT_PHASE >= minPhase;
}

export function phaseLabel(): string {
  if (PAYMENT_PHASE >= 3) return "Fase 3 — Escrow completo";
  if (PAYMENT_PHASE >= 2) return "Fase 2 — Escrow garantía";
  return "Fase 1 — Bumps y Premium";
}

export function mercadoPagoConfigured(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN?.trim());
}

export function paymentsDemoMode(): boolean {
  return !mercadoPagoConfigured();
}
