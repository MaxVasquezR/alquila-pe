import Link from "next/link";
import { soles } from "@/lib/utils";
import { PremiumSubscribeButton } from "@/components/PaymentButtons";
import { paymentsEnabled, phaseLabel, PAYMENT_PHASE, PRICING } from "@/lib/payments/config";

export default function PremiumPage() {
  const charging = paymentsEnabled();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">
        {charging ? "Precios" : "Precios (cobros apagados)"}
      </p>
      <h1 className="mt-2 font-display text-5xl">Publicar, destacar y Premium</h1>
      <p className="mt-4 max-w-2xl text-ink-400">
        {charging
          ? `Publicar un anuncio cuesta ${soles(PRICING.listing.soles)}. No cobramos comisión sobre el alquiler diario. Destacados y Premium son opcionales.`
          : "Los cobros de plataforma están apagados en este entorno. En producción, publicar un anuncio cuesta el fee de listado vía Mercado Pago."}
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="text-sm font-bold text-gold-700">Publicar anuncio</p>
          <p className="mt-2 font-display text-4xl">{soles(PRICING.listing.soles)}</p>
          <p className="mt-2 text-sm text-ink-400">Una vez. El anuncio sale al catálogo al confirmar Mercado Pago.</p>
          <Link href="/items/nuevo" className="mt-4 inline-block text-sm font-semibold text-forest-800">
            Publicar un bien →
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="text-sm font-bold text-gold-700">Bump · 3 días</p>
          <p className="mt-2 font-display text-4xl">{soles(PRICING.bump.standard.soles)}</p>
          <p className="mt-2 text-sm text-ink-400">
            Destaca desde tu anuncio ya publicado. Top 3 distrito: {soles(PRICING.bump.premium.soles)}.
          </p>
          {charging ? (
            <Link href="/perfil" className="mt-4 inline-block text-sm font-semibold text-forest-800">
              Ir a mis anuncios →
            </Link>
          ) : (
            <p className="mt-4 text-sm font-semibold text-ink-400">Requiere cobros activos.</p>
          )}
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
          {charging ? (
            <PremiumSubscribeButton />
          ) : (
            <p className="mt-6 text-sm text-forest-100">Disponible cuando los cobros estén activos.</p>
          )}
        </div>
      </div>
      <p className="mt-6 text-sm text-ink-400">
        {phaseLabel()}
        {charging ? ` · Fee protocolo por intercambio cerrado: ${soles(PRICING.protocolFee.soles)}` : null}
      </p>
      {charging ? <p className="mt-2 text-xs text-ink-400">Fase activa: {PAYMENT_PHASE}</p> : null}
      <Link href="/" className="mt-8 inline-block font-semibold text-forest-800">
        Volver al marketplace →
      </Link>
    </div>
  );
}
