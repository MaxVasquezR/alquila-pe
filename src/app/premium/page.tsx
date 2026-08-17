import Link from "next/link";
import { soles } from "@/lib/utils";
import { PremiumSubscribeButton } from "@/components/PaymentButtons";
import { phaseLabel, PAYMENT_PHASE, PRICING } from "@/lib/payments/config";

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Monetización</p>
      <h1 className="mt-2 font-display text-5xl">Destacados y dueños Premium</h1>
      <p className="mt-4 max-w-2xl text-ink-400">
        Alquila no cobra comisión sobre el inventario en Fase 1. Cobramos visibilidad y confianza.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="text-sm font-bold text-gold-700">Bump · 3 días</p>
          <p className="mt-2 font-display text-4xl">{soles(PRICING.bump.standard.soles)}</p>
          <p className="mt-2 text-sm text-ink-400">
            Destaca desde la página de tu anuncio. Top 3 distrito: {soles(PRICING.bump.premium.soles)}.
          </p>
          <Link href="/perfil" className="mt-4 inline-block text-sm font-semibold text-forest-800">
            Ir a mis anuncios →
          </Link>
        </div>
        <div className="rounded-2xl bg-forest-900 p-6 text-white">
          <p className="text-sm font-bold text-gold-400">Membresía Premium</p>
          <p className="mt-2 font-display text-4xl">
            {soles(PRICING.premium.mensual.soles)}
            <span className="text-lg">/mes</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-forest-100">
            <li>Insignia Premium en cada anuncio</li>
            <li>Prioridad en el feed del distrito</li>
            <li>Soporte preferente en disputas</li>
            <li>Hasta 15 publicaciones activas</li>
          </ul>
          <PremiumSubscribeButton />
        </div>
      </div>
      <p className="mt-6 text-sm text-ink-400">
        {phaseLabel()} · Fee protocolo por intercambio cerrado: {soles(PRICING.protocolFee.soles)}
      </p>
      <p className="mt-2 text-xs text-ink-400">Fase activa: {PAYMENT_PHASE}</p>
      <Link href="/" className="mt-8 inline-block font-semibold text-forest-800">
        Volver al marketplace →
      </Link>
    </div>
  );
}
