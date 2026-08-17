"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

type N = { id: string; titulo: string; cuerpo: string; link: string | null; leida: boolean };

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<N[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications ?? []);
    setUnread(data.unread ?? 0);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    load();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-1.5 hover:bg-white"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-2xl bg-white p-3 shadow-card ring-1 ring-ink-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-ink-400">Alertas</p>
            {items.length > 0 ? (
              <button onClick={markAll} className="text-[10px] font-semibold text-forest-800">
                Marcar leídas
              </button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <p className="mt-3 text-xs text-ink-400">Sin alertas por ahora.</p>
          ) : (
            <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className={`rounded-lg p-2 text-xs ${n.leida ? "opacity-60" : "bg-forest-50"}`}>
                  <p className="font-semibold">{n.titulo}</p>
                  <p className="text-ink-400">{n.cuerpo}</p>
                  {n.link ? (
                    <Link href={n.link} className="font-semibold text-forest-800" onClick={() => setOpen(false)}>
                      Ver →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
