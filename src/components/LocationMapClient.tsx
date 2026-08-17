"use client";

import dynamic from "next/dynamic";

export const LocationMap = dynamic(
  () => import("./LocationMap").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 items-center justify-center rounded-2xl bg-ink-50 text-sm text-ink-400">
        Cargando mapa…
      </div>
    ),
  },
);
