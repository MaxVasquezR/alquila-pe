"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AdminKycPanel() {
  const [queue, setQueue] = useState<
    Array<{
      id: string;
      motivo: string;
      user: { nombre: string; apellidos: string; email: string; dni: string; telefono: string };
    }>
  >([]);

  async function load() {
    const data = await fetch("/api/admin/kyc").then((r) => r.json());
    if (data.queue) setQueue(data.queue);
  }

  useEffect(() => {
    load();
  }, []);

  async function review(id: string, action: "approve" | "reject") {
    await fetch("/api/admin/kyc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    load();
  }

  return (
    <section className="mt-10 rounded-2xl bg-white p-5 shadow-card">
      <h2 className="font-display text-2xl">Cola KYC manual</h2>
      <p className="mt-1 text-sm text-ink-400">Cuentas de alto valor o reportes graves.</p>
      {queue.length === 0 ? (
        <p className="mt-4 text-sm text-ink-400">Sin solicitudes pendientes.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {queue.map((q) => (
            <li key={q.id} className="rounded-xl border border-ink-100 p-3 text-sm">
              <p className="font-semibold">
                {q.user.nombre} {q.user.apellidos}
              </p>
              <p className="text-ink-400">
                {q.user.email} · DNI {q.user.dni.slice(-4)} · {q.user.telefono}
              </p>
              <p className="mt-1">{q.motivo}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => review(q.id, "approve")}
                  className="rounded-full bg-forest-800 px-3 py-1 text-xs font-bold text-white"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => review(q.id, "reject")}
                  className="rounded-full bg-ink-50 px-3 py-1 text-xs font-semibold"
                >
                  Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
