"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CHECKLIST_DEVOLUCION, CHECKLIST_ENTREGA } from "@/lib/peru";
import { CONDITION_LABEL, type ActaTipo, type ConditionGrade } from "@/lib/types";
import { WEDGE } from "@/lib/business-rules";

export function ActaForm({
  rentalId,
  tipo,
}: {
  rentalId: string;
  tipo: ActaTipo;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const items = tipo === "ENTREGA" ? CHECKLIST_ENTREGA : CHECKLIST_DEVOLUCION;

  async function upload(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setFotos((p) => [...p, data.url].slice(0, 6));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const checklist: Record<string, boolean> = {};
    items.forEach((i) => {
      checklist[i.id] = fd.get(i.id) === "on";
    });
    const res = await fetch(`/api/rentals/${rentalId}/acta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dniUltimos4: fd.get("dniUltimos4"),
        conditionGrade: fd.get("conditionGrade"),
        checklist,
        notas: fd.get("notas"),
        fotosEvidencia: fotos,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo firmar");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-white p-4 sm:p-5 shadow-card">
      <h3 className="font-display text-xl sm:text-2xl">
        Firmar acta de {tipo === "ENTREGA" ? "entrega" : "devolución"}
      </h3>
      <p className="text-sm text-ink-400">
        Firma con los últimos 4 dígitos de tu DNI. Sube al menos 2 fotos del bien en este momento.
      </p>
      {tipo === "DEVOLUCION" && (
        <p className="rounded-xl bg-forest-50 px-3 py-2 text-xs text-forest-800">
          {WEDGE.garantiaAlquila} Registren el monto y quién lo retiene en el acta.
        </p>
      )}
      <select name="conditionGrade" className="w-full rounded-xl border px-3 py-2.5 text-sm">
        {(Object.keys(CONDITION_LABEL) as ConditionGrade[]).map((k) => (
          <option key={k} value={k}>
            {CONDITION_LABEL[k]}
          </option>
        ))}
      </select>
      <div className="space-y-2">
        {items.map((i) => (
          <label key={i.id} className="flex items-start gap-2 text-sm">
            <input type="checkbox" name={i.id} className="mt-1 h-4 w-4 shrink-0" />
            <span>{i.label}</span>
          </label>
        ))}
      </div>
      <input
        name="dniUltimos4"
        required
        maxLength={4}
        inputMode="numeric"
        placeholder="Últimos 4 del DNI"
        className="w-full rounded-xl border px-3 py-2.5"
      />
      <textarea
        name="notas"
        placeholder="Notas (rayones, horas de atraso)"
        className="h-20 w-full rounded-xl border px-3 py-2 text-sm"
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="w-full text-sm"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            await upload(f);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error");
          }
        }}
      />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {fotos.map((f) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={f} src={f} alt="" className="h-16 w-full rounded object-cover" />
        ))}
      </div>
      {error ? <p className="text-sm text-danger-600">{error}</p> : null}
      <button className="w-full rounded-full bg-forest-800 px-4 py-3 text-sm font-bold text-white sm:w-auto">
        Firmar con DNI
      </button>
    </form>
  );
}
