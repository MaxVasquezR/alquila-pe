import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { solesShort } from "@/lib/utils";
import { SecurityBadge } from "./SecurityBadge";
import { VerifiedExchangeBadge } from "./VerifiedExchangeBadge";
import { CATEGORIAS } from "@/lib/peru";

export type ItemCardData = {
  id: string;
  titulo: string;
  categoria: string;
  precioDiaSoles: number;
  garantiaSugeridaSoles: number;
  distrito: string;
  zonaReferencial: string;
  fotos: string[];
  destacado: boolean;
  disponible: boolean;
  user: {
    nombre: string;
    dniVerificado: boolean;
    telefonoVerificado: boolean;
    reputacionScore: number;
    reputacionCount: number;
    rol: string;
    alquileresCompletados?: number;
    devolucionesOk?: number;
  };
};

export function ItemCard({ item }: { item: ItemCardData }) {
  const cat = CATEGORIAS.find((c) => c.id === item.categoria)?.label ?? item.categoria;
  const photo = item.fotos[0];
  return (
    <Link
      href={`/items/${item.id}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/70 transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={item.titulo}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-ink-100 text-xs text-ink-400">
            Sin foto
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {item.destacado ? (
            <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-bold text-ink-950">
              Destacado
            </span>
          ) : null}
          {!item.disponible ? (
            <span className="rounded-full bg-ink-950/80 px-2 py-0.5 text-[11px] font-bold text-white">
              En alquiler
            </span>
          ) : null}
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-sm font-bold text-forest-800">
          {solesShort(item.precioDiaSoles)}
          <span className="text-[11px] font-medium text-ink-400"> /día</span>
        </span>
      </div>
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-700">{cat}</p>
        <h3 className="font-display text-lg leading-tight text-ink-900">{item.titulo}</h3>
        <p className="flex items-center gap-1 text-sm text-ink-400">
          <MapPin className="h-3.5 w-3.5" />
          {item.distrito} · {item.zonaReferencial}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1">
            <SecurityBadge
              dni={item.user.dniVerificado}
              phone={item.user.telefonoVerificado}
              premium={item.user.rol === "PREMIUM_OWNER"}
              compact
            />
            {item.user.alquileresCompletados != null && item.user.devolucionesOk != null ? (
              <VerifiedExchangeBadge
                alquileresCompletados={item.user.alquileresCompletados}
                devolucionesOk={item.user.devolucionesOk}
                compact
              />
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700">
            <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
            {item.user.reputacionScore.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
