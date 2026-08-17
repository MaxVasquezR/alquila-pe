"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIAS, DISTRITOS_LIMA } from "@/lib/peru";
import { Search } from "lucide-react";

export function Filters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/?${next.toString()}`);
  }

  return (
    <div className="rounded-2xl bg-white p-3 shadow-card ring-1 ring-ink-100/80">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q") as string;
          update("q", q.trim());
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <input
            name="q"
            defaultValue={params.get("q") ?? ""}
            placeholder="Busca taladro, sillas, cámara, generador..."
            className="w-full rounded-xl border border-ink-100 bg-ink-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-forest-500"
          />
        </div>
        <select
          value={params.get("distrito") ?? ""}
          onChange={(e) => update("distrito", e.target.value)}
          className="rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos los distritos</option>
          {DISTRITOS_LIMA.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-forest-800 px-4 py-2 text-sm font-semibold text-white">
          Buscar
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => update("categoria", "")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            !params.get("categoria") ? "bg-forest-800 text-white" : "bg-ink-50 text-ink-700"
          }`}
        >
          Todas
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            onClick={() => update("categoria", c.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              params.get("categoria") === c.id
                ? "bg-forest-800 text-white"
                : "bg-ink-50 text-ink-700"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
