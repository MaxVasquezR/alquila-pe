"use client";

import { useState } from "react";
import { LegalLayout } from "@/components/LegalLayout";

export default function ReclamacionesPage() {
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Error");
      return;
    }
    setOk(true);
    setMsg("Reclamo registrado. Código: " + data.id);
  }

  return (
    <LegalLayout title="Libro de reclamaciones">
      <p>
        Conforme al Código de Protección y Defensa del Consumidor (Ley N.° 29571). Tiempo de
        respuesta máximo: 30 días calendario.
      </p>
      {ok ? (
        <p className="mt-6 rounded-xl bg-forest-50 p-4 font-semibold text-forest-800">{msg}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <input name="nombre" required placeholder="Nombre completo" className="w-full rounded-xl border px-3 py-2" />
          <input name="email" type="email" required placeholder="Correo" className="w-full rounded-xl border px-3 py-2" />
          <input name="telefono" required placeholder="Celular" className="w-full rounded-xl border px-3 py-2" />
          <div className="grid grid-cols-2 gap-2">
            <select name="tipoDoc" className="rounded-xl border px-3 py-2">
              <option value="DNI">DNI</option>
              <option value="CE">CE</option>
              <option value="RUC">RUC</option>
            </select>
            <input name="numDoc" required placeholder="N.° documento" className="rounded-xl border px-3 py-2" />
          </div>
          <input name="domicilio" required placeholder="Domicilio" className="w-full rounded-xl border px-3 py-2" />
          <input name="producto" required placeholder="Producto/servicio (ej. Bump, Premium, alquiler)" className="w-full rounded-xl border px-3 py-2" />
          <input name="monto" type="number" step="0.01" placeholder="Monto S/. (opcional)" className="w-full rounded-xl border px-3 py-2" />
          <textarea name="descripcion" required minLength={20} placeholder="Detalle del reclamo" className="h-24 w-full rounded-xl border px-3 py-2" />
          <textarea name="pedido" required minLength={10} placeholder="Qué solicitas (devolución, corrección, etc.)" className="h-20 w-full rounded-xl border px-3 py-2" />
          {msg && !ok ? <p className="text-sm text-danger-600">{msg}</p> : null}
          <button className="rounded-full bg-forest-800 px-5 py-2.5 text-sm font-bold text-white">
            Registrar reclamo
          </button>
        </form>
      )}
    </LegalLayout>
  );
}
