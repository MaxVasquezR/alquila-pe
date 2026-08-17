import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/validations";
import { expireBoostedItems, syncPremiumExpiry } from "@/lib/payments/fulfillment";
import { Filters } from "@/components/Filters";
import { ItemCard, type ItemCardData } from "@/components/ItemCard";
import { ShieldCheck, FileCheck, MapPinned, ArrowRight, Lock } from "lucide-react";
import { WEDGE } from "@/lib/business-rules";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string; distrito?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const categoria = searchParams.categoria ?? "";
  const distrito = searchParams.distrito ?? "";

  await Promise.all([expireBoostedItems(), syncPremiumExpiry()]);

  const items = await prisma.item.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { titulo: { contains: q } },
                { descripcion: { contains: q } },
              ],
            }
          : {},
        categoria ? { categoria } : {},
        distrito ? { distrito } : {},
      ],
    },
    include: {
      user: {
        select: {
          nombre: true,
          dniVerificado: true,
          telefonoVerificado: true,
          reputacionScore: true,
          reputacionCount: true,
          rol: true,
          alquileresCompletados: true,
          devolucionesOk: true,
        },
      },
    },
    orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
  });

  const cards: ItemCardData[] = items.map((item) => ({
    ...item,
    fotos: parseJsonArray(item.fotos),
  }));

  return (
    <div>
      <section className="relative overflow-hidden border-b border-ink-100 bg-forest-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-400">
              Lima primero · Soles (S/.)
            </p>
            <h1 className="mt-3 font-display text-3xl leading-[1.05] sm:text-6xl">
              {WEDGE.headline}
            </h1>
            <p className="mt-5 max-w-xl text-base text-forest-100 sm:text-lg">{WEDGE.subline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-ink-950"
              >
                Empezar verificado <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/protocolo"
                className="inline-flex items-center rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold"
              >
                Ver el protocolo
              </Link>
            </div>
          </div>
          <div className="grid gap-3 self-center">
            {[
              {
                icon: ShieldCheck,
                t: "Identidad peruana",
                d: "DNI de 8 dígitos + celular 9xxxxxxx. Sin verificación no hay trato.",
              },
              {
                icon: MapPinned,
                t: "Anti-reglaje",
                d: "Solo distrito y zona referencial. Coordenadas con radio de 500 m.",
              },
              {
                icon: FileCheck,
                t: "Éxito = devolución",
                d: "Termina con acta firmada por ambas partes — no con pleito en WhatsApp.",
              },
              {
                icon: Lock,
                t: "WhatsApp en el momento correcto",
                d: "No hay celular en el anuncio. Tras aceptación: deposita garantía en Alquila, luego WhatsApp auditado.",
              },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <x.icon className="h-5 w-5 text-gold-400" />
                <p className="mt-2 font-semibold">{x.t}</p>
                <p className="text-sm text-forest-100">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <Suspense>
          <Filters />
        </Suspense>
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl">Bienes cerca de ti</h2>
            <p className="text-sm text-ink-400">{cards.length} anuncios · precios en Soles</p>
          </div>
        </div>
        {cards.length === 0 ? (
          <p className="mt-10 rounded-2xl bg-white p-8 text-center text-ink-400">
            No hay resultados con esos filtros. Prueba otro distrito o categoría.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
