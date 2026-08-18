"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, MessageCircle } from "lucide-react";
import type { RentalStatus } from "@/lib/types";

export function RentalActions({
  rentalId,
  status,
  role,
  puntosSeguros,
  puntoEncuentro,
  whatsappAllowed,
  whatsappBlockReason,
  escrowRequired,
  escrowHeld,
  canStartHandover,
  handoverBlockReason,
}: {
  rentalId: string;
  status: RentalStatus;
  role: "OWNER" | "RENTER";
  puntosSeguros: string[];
  puntoEncuentro?: string | null;
  whatsappAllowed: boolean;
  whatsappBlockReason?: string;
  escrowRequired: boolean;
  escrowHeld: boolean;
  canStartHandover: boolean;
  handoverBlockReason?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function act(action: string, motivo?: string, extra?: Record<string, string>) {
    const res = await fetch(`/api/rentals/${rentalId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, motivo, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo");
      return;
    }
    router.refresh();
  }

  async function wa() {
    const res = await fetch(`/api/rentals/${rentalId}/whatsapp`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "WhatsApp bloqueado");
      return;
    }
    window.open(data.url, "_blank");
  }

  const showWaZone = ["ACCEPTED", "HANDOVER_PENDING", "ACTIVE", "RETURN_PENDING", "DISPUTED"].includes(status);

  return (
    <div className="space-y-3">
      {role === "OWNER" && status === "REQUESTED" && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold">
            Punto de encuentro acordado (zona pública)
            <select
              id="punto-owner"
              defaultValue={puntoEncuentro ?? puntosSeguros[0]}
              className="mt-1 w-full rounded-xl border px-2 py-2.5 text-sm"
            >
              {puntosSeguros.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const el = document.getElementById("punto-owner") as HTMLSelectElement;
                act("accept", undefined, { puntoEncuentro: el?.value ?? puntosSeguros[0] });
              }}
              className="min-h-[44px] rounded-full bg-forest-800 px-4 py-2 text-sm font-bold text-white"
            >
              Aceptar solicitud
            </button>
            <button
              onClick={() => act("reject", "No disponible en esas fechas")}
              className="min-h-[44px] rounded-full bg-ink-50 px-4 py-2 text-sm font-semibold"
            >
              Rechazar
            </button>
          </div>
          <p className="text-xs text-ink-400">
            {escrowRequired
              ? "Tras aceptar, el arrendatario deposita la garantía en Alquila. Luego WhatsApp y entrega."
              : "Tras aceptar se desbloquea WhatsApp auditado para coordinar el encuentro público y el acta."}
          </p>
        </div>
      )}

      {puntoEncuentro && status !== "REQUESTED" && (
        <p className="rounded-xl bg-forest-50 px-3 py-2 text-sm text-forest-800">
          Punto de encuentro: <strong>{puntoEncuentro}</strong>
        </p>
      )}

      {escrowRequired && status === "ACCEPTED" && !escrowHeld && (
        <p className="rounded-xl border border-gold-400/50 bg-gold-200/20 px-3 py-2 text-sm text-gold-800">
          {role === "RENTER"
            ? "Paso 1: deposita la garantía en Alquila abajo. Paso 2: WhatsApp se desbloquea automáticamente."
            : "Esperando que el arrendatario deposite la garantía en Alquila. Luego podrán contactarse por WhatsApp."}
        </p>
      )}

      {showWaZone && (
        whatsappAllowed ? (
          <button
            onClick={wa}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp auditado (código ALQ)
          </button>
        ) : (
          <div className="rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-600">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Lock className="h-4 w-4" /> WhatsApp bloqueado
            </span>
            <p className="mt-1 text-xs">{whatsappBlockReason}</p>
          </div>
        )
      )}

      {status === "ACCEPTED" && (
        canStartHandover ? (
          <button
            onClick={() => act("start_handover")}
            className="min-h-[44px] rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-ink-950"
          >
            Iniciar protocolo de entrega
          </button>
        ) : handoverBlockReason ? (
          <p className="text-xs text-ink-400">{handoverBlockReason}</p>
        ) : null
      )}

      {status === "ACTIVE" && (
        <button
          onClick={() => act("start_return")}
          className="min-h-[44px] rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-ink-950"
        >
          Iniciar protocolo de devolución
        </button>
      )}

      {["REQUESTED", "ACCEPTED", "HANDOVER_PENDING"].includes(status) && (
        <button onClick={() => act("cancel", "Cancelado por el usuario")} className="text-sm text-ink-400">
          Cancelar
        </button>
      )}

      {["HANDOVER_PENDING", "ACTIVE", "RETURN_PENDING"].includes(status) && (
        <button
          onClick={() => {
            const motivo = prompt("Describe el conflicto (mín. 12 caracteres)");
            if (motivo) act("open_dispute", motivo);
          }}
          className="text-sm font-semibold text-danger-600"
        >
          Abrir disputa
        </button>
      )}

      {error ? <p className="text-sm text-danger-600">{error}</p> : null}
    </div>
  );
}
