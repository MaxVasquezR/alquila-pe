import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canTransact, displayName } from "@/lib/auth";
import { parseJsonArray, maskDni } from "@/lib/validations";
import { soles, solesShort } from "@/lib/utils";
import { riskForOwner, riskForRenter, SCAM_WARNINGS } from "@/lib/security";
import { requiresEscrowGarantia, WEDGE } from "@/lib/business-rules";
import { SecurityBadge } from "@/components/SecurityBadge";
import { VerifiedExchangeBadge } from "@/components/VerifiedExchangeBadge";
import { RequestRental } from "@/components/RequestRental";
import { CATEGORIAS, puntosSeguros } from "@/lib/peru";
import { MapPin, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { LocationMap } from "@/components/LocationMapClient";
import { BoostButton } from "@/components/PaymentButtons";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!item) notFound();
  const me = await getSessionUser();
  const fotos = parseJsonArray(item.fotos);
  const accesorios = parseJsonArray(item.accesorios);
  const cat = CATEGORIAS.find((c) => c.id === item.categoria)?.label ?? item.categoria;
  const flags = [
    ...riskForOwner(item.user, item),
    ...(me ? riskForRenter(me) : []),
  ];
  const isOwner = me?.id === item.userId;
  const canRequest = Boolean(me && canTransact(me) && !isOwner && item.disponible);
  let blockReason: string | undefined;
  if (!me) blockReason = "Inicia sesión y verifica tu DNI para solicitar.";
  else if (isOwner) blockReason = "Este es tu anuncio.";
  else if (!canTransact(me)) blockReason = "Verifica DNI y celular para solicitar.";
  else if (!item.disponible) blockReason = "Este bien está en un alquiler activo.";

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_0.8fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gold-700">{cat}</p>
        <h1 className="mt-1 font-display text-2xl sm:text-4xl">{item.titulo}</h1>
        <p className="mt-2 flex items-center gap-2 text-ink-400">
          <MapPin className="h-4 w-4" />
          {item.distrito} · {item.zonaReferencial} · radio ~500 m (ubicación ofuscada)
        </p>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {fotos.length > 0 ? (
            fotos.map((f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={f} src={f} alt={item.titulo} className="h-48 w-full rounded-2xl object-cover" />
            ))
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl bg-ink-100 text-sm text-ink-400">
              Sin fotos del bien
            </div>
          )}
        </div>
        <div className="mt-5">
          <LocationMap
            lat={item.latAprox}
            lng={item.lngAprox}
            distrito={item.distrito}
            zonaReferencial={item.zonaReferencial}
          />
        </div>
        <div className="mt-8 whitespace-pre-wrap text-[15px] leading-7 text-ink-700">
          {item.descripcion}
        </div>
        {accesorios.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-2xl">Accesorios incluidos</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-700">
              {accesorios.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-card">
          <h2 className="font-display text-2xl">Dueño</h2>
          <p className="mt-1 font-semibold">{displayName(item.user)}</p>
          <p className="text-sm text-ink-400">
            DNI {maskDni(item.user.dni)} · {item.user.distrito} · {item.user.alquileresCompletados}{" "}
            intercambios cerrados
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            <SecurityBadge
              dni={item.user.dniVerificado}
              phone={item.user.telefonoVerificado}
              premium={item.user.rol === "PREMIUM_OWNER"}
            />
            <VerifiedExchangeBadge
              alquileresCompletados={item.user.alquileresCompletados}
              devolucionesOk={item.user.devolucionesOk}
            />
          </div>
          <p className="mt-3 text-sm">
            Reputación {item.user.reputacionScore.toFixed(1)} / 5 ({item.user.reputacionCount} reseñas)
            · Devoluciones OK: {item.user.devolucionesOk}
          </p>
        </div>
        <div className="mt-6 rounded-2xl border border-gold-400/40 bg-gold-200/20 p-5">
          <p className="flex items-center gap-2 font-semibold text-gold-700">
            <AlertTriangle className="h-4 w-4" /> Antes de coordinar
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-ink-700">
            {SCAM_WARNINGS.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
        <div className="rounded-2xl bg-forest-900 p-5 text-white">
          <p className="text-xs uppercase tracking-wider text-gold-400">Desglose en Soles</p>
          <p className="mt-2 font-display text-4xl">{solesShort(item.precioDiaSoles)}/día</p>
          <ul className="mt-3 space-y-1 text-sm text-forest-100">
            <li>Valor estimado del bien: {soles(item.valorEstimadoSoles)}</li>
            <li>Garantía sugerida: {soles(item.garantiaSugeridaSoles)}</li>
            <li>{WEDGE.alquilerP2P}</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-forest-100 bg-forest-50 p-4 text-sm text-forest-900">
          <p className="font-bold">Contacto en este anuncio</p>
          <p className="mt-1 text-xs leading-5 text-ink-600">
            No hay WhatsApp aquí (anti-estafa). Envías solicitud → si el dueño acepta, el contacto se
            desbloquea <strong>dentro del intercambio</strong>.
            {requiresEscrowGarantia(item.valorEstimadoSoles)
              ? " Primero depositas la garantía en Alquila, luego WhatsApp auditado."
              : " WhatsApp disponible tras aceptación (modo demo sin escrow)."}
          </p>
        </div>
        {isOwner ? (
          <div className="space-y-3 rounded-2xl bg-white p-5 shadow-card">
            <Link href="/alquileres" className="block text-sm font-semibold">
              Ver solicitudes de este bien →
            </Link>
            <div className="flex flex-wrap gap-2">
              <BoostButton itemId={item.id} />
              <BoostButton itemId={item.id} premium />
            </div>
          </div>
        ) : (
          <RequestRental
            itemId={item.id}
            precioDia={item.precioDiaSoles}
            garantia={item.garantiaSugeridaSoles}
            valorEstimado={item.valorEstimadoSoles}
            minDias={item.minDias}
            maxDias={item.maxDias}
            canRequest={canRequest}
            blockReason={blockReason}
            flags={flags}
            puntosSeguros={puntosSeguros(item.distrito)}
          />
        )}
      </aside>
    </div>
  );
}
