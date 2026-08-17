"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KYC_INVENTORY_THRESHOLD_SOLES } from "@/lib/business-rules";

export function KycRequestForm({ pending }: { pending?: boolean }) {
  const router = useRouter();
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  if (pending || ok) {
    return (
      <p className="rounded-xl bg-gold-200/30 p-4 text-sm text-gold-800">
        {ok
          ? "Solicitud KYC enviada. Revisión en 24–72 h hábiles."
          : "Verificación KYC en revisión. Te avisaremos por notificación."}
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/kyc/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error");
      return;
    }
    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-xs font-bold uppercase text-gold-700">Verificación alto valor</p>
      <p className="mt-1 text-sm text-ink-700">
        Dueños con inventario &gt; S/ {KYC_INVENTORY_THRESHOLD_SOLES.toLocaleString("es-PE")} requieren
        revisión manual (selfie + DNI). Describe tu inventario y uso previsto.
      </p>
      <textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        required
        minLength={20}
        placeholder="Ej.: Tengo 4 herramientas eléctricas por S/ 3,200 total. Ferretería informal en Los Olivos..."
        className="mt-3 h-24 w-full rounded-xl border px-3 py-2 text-sm"
      />
      {error ? <p className="mt-2 text-sm text-danger-600">{error}</p> : null}
      <button className="mt-3 rounded-full bg-forest-800 px-4 py-2 text-sm font-bold text-white">
        Solicitar verificación KYC
      </button>
    </form>
  );
}
