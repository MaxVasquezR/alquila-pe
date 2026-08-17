"use client";

import { useEffect, useState } from "react";

type Dispute = {
  id: string;
  codigo: string;
  disputaMotivo: string | null;
  escrowStatus: string;
  garantiaSoles: number;
  item: { titulo: string };
};

export function AdminDisputesPanel() {
  const [data, setData] = useState<{
    reports: Array<{ id: string; motivo: string; detalle: string }>;
    disputes: Dispute[];
    complaints: Array<{ id: string; nombre: string; producto: string; descripcion: string }>;
  } | null>(null);

  async function refresh() {
    const fresh = await fetch("/api/admin/disputes").then((r) => r.json());
    setData(fresh);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function resolve(action: string, id: string) {
    await fetch("/api/admin/metrics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    refresh();
  }

  if (!data) return null;

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="font-display text-xl">Disputas y garantía</h2>
        {data.disputes.length === 0 ? (
          <p className="mt-2 text-sm text-ink-400">Ninguna abierta.</p>
        ) : (
          data.disputes.map((d) => (
            <div key={d.id} className="mt-3 border-t pt-3 text-sm">
              <p className="font-mono text-xs">{d.codigo}</p>
              <p>{d.item.titulo}</p>
              <p className="text-ink-400">{d.disputaMotivo}</p>
              <p className="mt-1 text-xs">
                Garantía S/ {d.garantiaSoles.toFixed(2)} · estado {d.escrowStatus}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {d.escrowStatus === "HELD" && (
                  <>
                    <button
                      onClick={() => resolve("release_escrow", d.id)}
                      className="rounded-full bg-forest-800 px-2 py-1 text-[10px] font-bold text-white"
                    >
                      Liberar al arrendatario
                    </button>
                    <button
                      onClick={() => resolve("claim_escrow", d.id)}
                      className="rounded-full bg-gold-500 px-2 py-1 text-[10px] font-bold text-ink-950"
                    >
                      Reclamar al dueño
                    </button>
                  </>
                )}
                <button
                  onClick={() => resolve("resolve_dispute", d.id)}
                  className="text-xs font-bold text-forest-800"
                >
                  Cerrar disputa
                </button>
              </div>
            </div>
          ))
        )}
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="font-display text-xl">Reportes</h2>
        {data.reports.map((r) => (
          <div key={r.id} className="mt-3 border-t pt-3 text-sm">
            <p className="font-semibold">{r.motivo}</p>
            <p className="text-ink-400">{r.detalle.slice(0, 80)}…</p>
            <button
              onClick={() => resolve("resolve_report", r.id)}
              className="mt-2 text-xs font-bold text-forest-800"
            >
              Marcar resuelto
            </button>
          </div>
        ))}
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-card sm:col-span-2 lg:col-span-1">
        <h2 className="font-display text-xl">Reclamos</h2>
        {data.complaints.map((c) => (
          <div key={c.id} className="mt-3 border-t pt-3 text-sm">
            <p className="font-semibold">{c.nombre}</p>
            <p>{c.producto}</p>
            <button
              onClick={() => resolve("resolve_complaint", c.id)}
              className="mt-2 text-xs font-bold text-forest-800"
            >
              Cerrar reclamo
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
