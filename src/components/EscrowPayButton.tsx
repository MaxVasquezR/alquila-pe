"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { escrowFeeSoles, escrowTotalSoles } from "@/lib/business-rules";

export function EscrowPayButton({
  rentalId,
  monto,
  enabled,
}: {
  rentalId: string;
  monto: number;
  enabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!enabled) return null;

  const fee = escrowFeeSoles(monto);
  const total = escrowTotalSoles(monto);

  async function pay() {
    setLoading(true);
    const res = await fetch("/api/payments/escrow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rentalId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error ?? "Error");
      return;
    }
    if (data.initPoint) window.location.href = data.initPoint;
    else router.refresh();
  }

  return (
    <div className="space-y-2">
      <ul className="text-xs text-ink-500">
        <li>Garantía: S/ {monto.toFixed(2)}</li>
        <li>Fee retención (4%): S/ {fee.toFixed(2)}</li>
        <li className="font-semibold text-forest-800">Total a depositar: S/ {total.toFixed(2)}</li>
      </ul>
      <button
        onClick={pay}
        disabled={loading}
        className="rounded-full bg-forest-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Procesando…" : `Retener garantía · S/ ${total.toFixed(2)}`}
      </button>
      <p className="text-[11px] text-ink-400">
        Tras confirmar, se desbloquea WhatsApp auditado para coordinar el encuentro.
      </p>
    </div>
  );
}
