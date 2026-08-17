import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser, displayName, toPublicUser } from "@/lib/auth";
import { maskDni, maskPhone } from "@/lib/validations";
import { SecurityBadge } from "@/components/SecurityBadge";
import { VerifiedExchangeBadge } from "@/components/VerifiedExchangeBadge";
import { KycRequestForm } from "@/components/KycRequestForm";
import { parseJsonArray } from "@/lib/validations";
import { ItemCard } from "@/components/ItemCard";
import {
  ownerNeedsKyc,
  ownerHasPendingKyc,
  ownerHasKycApproved,
  KYC_INVENTORY_THRESHOLD_SOLES,
} from "@/lib/business-rules";
import { formatDatePE } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const pub = toPublicUser(user);

  const [items, recentClosed, kycPending] = await Promise.all([
    prisma.item.findMany({
      where: { userId: user.id },
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
    }),
    prisma.rental.findMany({
      where: {
        status: "COMPLETED",
        OR: [{ ownerId: user.id }, { renterId: user.id }],
      },
      include: { item: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    ownerHasPendingKyc(user.id),
  ]);

  const inventoryHigh = await ownerNeedsKyc(user.id, 0);
  const kycApproved = await ownerHasKycApproved(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl">{displayName(user)}</h1>
      <p className="mt-1 text-ink-400">
        {user.distrito} · DNI {maskDni(user.dni)} · Cel {maskPhone(user.telefono)}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        <SecurityBadge
          dni={user.dniVerificado}
          phone={user.telefonoVerificado}
          premium={user.rol === "PREMIUM_OWNER"}
        />
        <VerifiedExchangeBadge
          alquileresCompletados={user.alquileresCompletados}
          devolucionesOk={user.devolucionesOk}
        />
        {kycApproved ? (
          <span className="rounded-full bg-gold-200/60 px-2 py-0.5 text-[11px] font-semibold text-gold-800">
            KYC alto valor
          </span>
        ) : null}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Reputación", pub.reputacionScore.toFixed(1)],
          ["Intercambios", String(pub.alquileresCompletados)],
          ["Devoluciones OK", String(pub.devolucionesOk)],
          ["Rol", user.rol === "PREMIUM_OWNER" ? "Premium" : "Usuario"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 shadow-card">
            <p className="text-xs uppercase text-ink-400">{k}</p>
            <p className="font-display text-2xl">{v}</p>
          </div>
        ))}
      </div>
      {!user.dniVerificado || !user.telefonoVerificado ? (
        <Link
          href="/verificar"
          className="mt-6 inline-block rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-ink-950"
        >
          Completar verificación
        </Link>
      ) : null}

      {inventoryHigh && !kycApproved ? (
        <div className="mt-8">
          <KycRequestForm pending={kycPending} />
        </div>
      ) : null}

      {recentClosed.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-3xl">Historial de intercambios cerrados</h2>
          <p className="text-sm text-ink-400">
            Reputación no portable — construida con actas en Alquila.
          </p>
          <ul className="mt-4 space-y-2">
            {recentClosed.map((r) => (
              <li key={r.id} className="rounded-xl bg-white p-3 text-sm shadow-card">
                <Link href={`/alquileres/${r.id}`} className="font-semibold text-forest-800">
                  {r.codigo}
                </Link>
                {" · "}
                {r.item.titulo} · {formatDatePE(r.fechaFin)}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-10 font-display text-3xl">Tus anuncios</h2>
      {inventoryHigh && !kycApproved && !kycPending && (
        <p className="mt-2 text-sm text-gold-700">
          Inventario &gt; S/ {KYC_INVENTORY_THRESHOLD_SOLES.toLocaleString("es-PE")}: completa KYC para
          publicar más bienes de alto valor.
        </p>
      )}
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={{ ...item, fotos: parseJsonArray(item.fotos) }}
          />
        ))}
      </div>
    </div>
  );
}
