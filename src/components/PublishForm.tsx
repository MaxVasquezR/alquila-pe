"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIAS, DISTRITOS_LIMA, puntosSeguros } from "@/lib/peru";
import { suggestedDeposit } from "@/lib/utils";

export function PublishForm({ defaultDistrito }: { defaultDistrito: string }) {
  const router = useRouter();
  const [fotos, setFotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [valor, setValor] = useState(400);
  const [distrito, setDistrito] = useState(defaultDistrito);
  const meetingPoints = useMemo(() => puntosSeguros(distrito), [distrito]);
  const [zonaReferencial, setZonaReferencial] = useState(meetingPoints[0] ?? "");

  async function upload(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setFotos((prev) => [...prev, data.url].slice(0, 4));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (fotos.length < 3) {
      setError("Sube al menos 3 fotos reales del bien.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const accesorios = String(fd.get("accesorios") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: fd.get("titulo"),
        descripcion: fd.get("descripcion"),
        categoria: fd.get("categoria"),
        precioDiaSoles: Number(fd.get("precioDiaSoles")),
        valorEstimadoSoles: Number(fd.get("valorEstimadoSoles")),
        garantiaSugeridaSoles: Number(fd.get("garantiaSugeridaSoles")),
        minDias: Number(fd.get("minDias")),
        maxDias: Number(fd.get("maxDias")),
        distrito: fd.get("distrito"),
        zonaReferencial: fd.get("zonaReferencial"),
        serialOIdentificador: fd.get("serialOIdentificador"),
        fotos,
        accesorios,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo publicar");
      return;
    }
    router.push(`/items/${data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
      <input name="titulo" required minLength={8} placeholder="Título claro (marca + modelo)" className="w-full rounded-xl border px-3 py-2" />
      <textarea name="descripcion" required minLength={40} placeholder="Estado, uso, qué incluye, reglas. Mínimo 40 caracteres." className="h-28 w-full rounded-xl border px-3 py-2" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="categoria" className="rounded-xl border px-3 py-2">
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          name="distrito"
          value={distrito}
          onChange={(e) => {
            const d = e.target.value;
            setDistrito(d);
            const pts = puntosSeguros(d);
            setZonaReferencial(pts[0] ?? "");
          }}
          className="rounded-xl border px-3 py-2"
        >
          {DISTRITOS_LIMA.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <label className="block text-sm">
        Zona segura sugerida (punto de encuentro referencial)
        <select
          name="zonaReferencial"
          value={zonaReferencial}
          onChange={(e) => setZonaReferencial(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border px-3 py-2"
        >
          {meetingPoints.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <p className="rounded-xl bg-forest-50 p-3 text-xs leading-5 text-ink-700">
        <strong>Privacidad:</strong> no guardamos ni mostramos tu dirección exacta. Solo distrito + zona referencial (~500 m en mapa).
        Alquila no valida lugares físicos; las partes eligen encuentro en zona pública tras aceptar la solicitud.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Precio / día (S/.)
          <input name="precioDiaSoles" type="number" min={5} required className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="text-sm">
          Valor estimado (S/.)
          <input
            name="valorEstimadoSoles"
            type="number"
            min={20}
            required
            className="mt-1 w-full rounded-xl border px-3 py-2"
            onChange={(e) => setValor(Number(e.target.value) || 0)}
          />
        </label>
        <label className="text-sm">
          Garantía (S/.) · sugerida {suggestedDeposit(valor)}
          <input
            name="garantiaSugeridaSoles"
            type="number"
            min={0}
            defaultValue={suggestedDeposit(valor)}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
          <span className="mt-1 block text-xs text-ink-400">
            Este monto lo depositará el arrendatario en cuenta Alquila (no editable en el acta).
          </span>
        </label>
        <input name="serialOIdentificador" placeholder="Serie / identificador (opcional)" className="rounded-xl border px-3 py-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Mín. días
          <input name="minDias" type="number" defaultValue={1} min={1} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="text-sm">
          Máx. días
          <input name="maxDias" type="number" defaultValue={7} min={1} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
      </div>
      <input name="accesorios" placeholder="Accesorios separados por coma (cargador, maletín, 2 mandos)" className="w-full rounded-xl border px-3 py-2" />
      <div>
        <p className="text-sm font-semibold">Fotos (3 o 4) · el bien real, no stock</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 text-sm"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              await upload(file);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error al subir");
            }
          }}
        />
        <div className="mt-2 grid grid-cols-4 gap-2">
          {fotos.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={f} src={f} alt="" className="h-20 w-full rounded-lg object-cover" />
          ))}
        </div>
      </div>
      {error ? <p className="text-sm text-danger-600">{error}</p> : null}
      <button className="rounded-full bg-forest-800 px-5 py-2.5 text-sm font-bold text-white">
        Publicar con ubicación ofuscada
      </button>
    </form>
  );
}
