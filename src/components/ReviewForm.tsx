"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ rentalId }: { rentalId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/rentals/${rentalId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: Number(fd.get("rating")),
        comentario: fd.get("comentario"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo calificar");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <select name="rating" className="rounded-xl border px-3 py-2 text-sm">
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} estrellas
          </option>
        ))}
      </select>
      <textarea
        name="comentario"
        required
        minLength={12}
        placeholder="¿La entrega y la devolución se cumplieron?"
        className="h-20 w-full rounded-xl border px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-danger-600">{error}</p> : null}
      <button className="rounded-full bg-forest-800 px-4 py-2 text-sm font-bold text-white">
        Publicar reseña
      </button>
    </form>
  );
}
