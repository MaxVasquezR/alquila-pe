import Link from "next/link";
import { WEDGE } from "@/lib/business-rules";

export default function ParaDuenosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Programa dueños Lima</p>
      <h1 className="mt-2 font-display text-3xl sm:text-5xl">Publica gratis. Alquila cierra el protocolo.</h1>
      <p className="mt-4 text-base text-ink-400 sm:text-lg">{WEDGE.ownerPitch}</p>
      <ul className="mt-8 space-y-3 text-sm sm:text-base">
        {[
          WEDGE.garantiaAlquila,
          "WhatsApp auditado solo tras depósito de garantía — no en el anuncio.",
          "Acta digital de entrega y devolución con fotos y firma DNI.",
          "Alquiler diario entre ustedes (Yape/Plin). Alquila no cobra comisión del alquiler en Fase 2.",
        ].map((line) => (
          <li key={line} className="rounded-xl bg-white p-4 shadow-card">
            {line}
          </li>
        ))}
      </ul>
      <Link
        href="/items/nuevo"
        className="mt-10 inline-block rounded-full bg-forest-800 px-6 py-3 font-bold text-white"
      >
        Publicar un bien
      </Link>
    </div>
  );
}
