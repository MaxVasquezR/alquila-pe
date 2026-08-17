"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { soles } from "@/lib/utils";
import type { RiskFlag } from "@/lib/types";
import { requiresEscrowGarantia, WEDGE } from "@/lib/business-rules";

export function RequestRental({
  itemId,
  precioDia,
  garantia,
  valorEstimado,
  minDias,
  maxDias,
  canRequest,
  blockReason,
  flags,
  puntosSeguros,
}: {
  itemId: string;
  precioDia: number;
  garantia: number;
  valorEstimado: number;
  minDias: number;
  maxDias: number;
  canRequest: boolean;
  blockReason?: string;
  flags: RiskFlag[];
  puntosSeguros: string[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [dias, setDias] = useState(minDias);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId,
        fechaInicio: fd.get("fechaInicio"),
        fechaFin: fd.get("fechaFin"),
        mensajeRenter: fd.get("mensajeRenter"),
        puntoEncuentro: fd.get("puntoEncuentro"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo solicitar");
      return;
    }
    router.push(`/alquileres/${data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-white p-5 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Solicitar alquiler</p>
      <p className="font-display text-3xl text-forest-800">
        {soles(precioDia)}
        <span className="text-base font-sans font-medium text-ink-400"> / día</span>
      </p>
      <p className="text-sm text-ink-400">
        Garantía {soles(garantia)} (solo lectura) · {minDias}–{maxDias} días
      </p>
      <p className="rounded-xl bg-forest-50 px-3 py-2 text-xs text-forest-800">
        Sin WhatsApp en este paso. Si el dueño acepta, coordinan dentro de Alquila.
        {requiresEscrowGarantia(valorEstimado)
          ? ` ${WEDGE.renterPitch}`
          : " WhatsApp auditado tras aceptación (modo demo)."}
      </p>
      {flags.map((f) => (
        <p
          key={f.code}
          className={`rounded-xl px-3 py-2 text-xs ${
            f.level === "block"
              ? "bg-danger-50 text-danger-600"
              : f.level === "warn"
                ? "bg-gold-200/40 text-gold-700"
                : "bg-forest-50 text-forest-800"
          }`}
        >
          {f.message}
        </p>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-semibold">
          Desde
          <input
            type="date"
            name="fechaInicio"
            required
            className="mt-1 w-full rounded-xl border px-2 py-2 text-sm"
            onChange={(e) => {
              const fin = (e.currentTarget.form?.elements.namedItem("fechaFin") as HTMLInputElement)
                ?.value;
              if (e.target.value && fin) {
                const a = new Date(e.target.value).getTime();
                const b = new Date(fin).getTime();
                setDias(Math.max(1, Math.ceil((b - a) / 86400000)));
              }
            }}
          />
        </label>
        <label className="text-xs font-semibold">
          Hasta
          <input
            type="date"
            name="fechaFin"
            required
            className="mt-1 w-full rounded-xl border px-2 py-2 text-sm"
            onChange={(e) => {
              const ini = (e.currentTarget.form?.elements.namedItem("fechaInicio") as HTMLInputElement)
                ?.value;
              if (e.target.value && ini) {
                const a = new Date(ini).getTime();
                const b = new Date(e.target.value).getTime();
                setDias(Math.max(1, Math.ceil((b - a) / 86400000)));
              }
            }}
          />
        </label>
      </div>
      <label className="text-xs font-semibold">
        Punto de encuentro sugerido (zona pública)
        <select name="puntoEncuentro" required className="mt-1 w-full rounded-xl border px-2 py-2 text-sm">
          {puntosSeguros.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <textarea
        name="mensajeRenter"
        required
        minLength={10}
        placeholder="Preséntate: para qué lo necesitas, dónde te queda cómodo el encuentro (distrito, no dirección exacta)."
        className="h-24 w-full rounded-xl border px-3 py-2 text-sm"
      />
      <p className="text-sm font-semibold">
        Estimado {soles(precioDia * dias)} + garantía {soles(garantia)}
      </p>
      {error ? <p className="text-sm text-danger-600">{error}</p> : null}
      {canRequest ? (
        <button className="w-full rounded-full bg-forest-800 py-2.5 text-sm font-bold text-white">
          Enviar solicitud (no revela WhatsApp aún)
        </button>
      ) : (
        <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-700">
          {blockReason ?? "No puedes solicitar este alquiler todavía."}
        </p>
      )}
    </form>
  );
}
