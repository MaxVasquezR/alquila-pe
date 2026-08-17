"use client";

import { useEffect, useState } from "react";
import { soles } from "@/lib/utils";

type Metrics = {
  users: number;
  itemsActivos: number;
  intercambiosCompletados: number;
  alquileresActivos: number;
  devolucionesOk: number;
  gmvCompletado: number;
  ingresosPlataforma: number;
  ingresosPorTipo: Record<string, number>;
  disputasAbiertas: number;
  reportesAbiertos: number;
  reclamosAbiertos: number;
};

export function AdminDashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      });
  }, []);

  if (error) return <p className="text-danger-600">{error}</p>;
  if (!data) return <p className="text-ink-400">Cargando métricas…</p>;

  const cards = [
    ["Usuarios", String(data.users)],
    ["Anuncios activos", String(data.itemsActivos)],
    ["Intercambios cerrados", String(data.intercambiosCompletados)],
    ["En curso", String(data.alquileresActivos)],
    ["Devoluciones OK", String(data.devolucionesOk)],
    ["GMV completado", soles(data.gmvCompletado)],
    ["Ingresos plataforma", soles(data.ingresosPlataforma)],
    ["Disputas abiertas", String(data.disputasAbiertas)],
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 shadow-card">
            <p className="text-xs uppercase text-ink-400">{k}</p>
            <p className="font-display text-2xl">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl bg-white p-5 shadow-card">
        <h2 className="font-display text-2xl">Ingresos por producto</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {Object.entries(data.ingresosPorTipo).map(([k, v]) => (
            <li key={k}>
              {k}: {soles(v)}
            </li>
          ))}
          {Object.keys(data.ingresosPorTipo).length === 0 && (
            <li className="text-ink-400">Sin pagos aprobados aún.</li>
          )}
        </ul>
      </div>
      <p className="mt-4 text-sm text-ink-400">
        Reportes abiertos: {data.reportesAbiertos} · Reclamos: {data.reclamosAbiertos}
      </p>
    </div>
  );
}
