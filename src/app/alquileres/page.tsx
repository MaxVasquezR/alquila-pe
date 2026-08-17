import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { STATUS_LABEL } from "@/lib/rental-machine";
import { formatDatePE, soles } from "@/lib/utils";
import type { RentalStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AlquileresPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const rentals = await prisma.rental.findMany({
    where: { OR: [{ ownerId: user.id }, { renterId: user.id }] },
    include: { item: true, owner: true, renter: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl">Intercambios</h1>
      <p className="mt-2 text-ink-400">
        Aquí vive el producto: solicitudes, actas de entrega, alquileres activos y devoluciones.
      </p>
      <div className="mt-8 space-y-3">
        {rentals.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-ink-400">
            Aún no tienes intercambios. Explora un bien y envía una solicitud.
          </p>
        ) : (
          rentals.map((r) => {
            const role = r.ownerId === user.id ? "Dueño" : "Arrendatario";
            return (
              <Link
                key={r.id}
                href={`/alquileres/${r.id}`}
                className="block rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink-100/70"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs font-bold text-gold-700">{r.codigo}</p>
                  <span className="rounded-full bg-forest-50 px-2 py-0.5 text-xs font-semibold text-forest-800">
                    {STATUS_LABEL[r.status as RentalStatus]}
                  </span>
                </div>
                <p className="mt-2 font-display text-xl">{r.item.titulo}</p>
                <p className="text-sm text-ink-400">
                  {role} · {formatDatePE(r.fechaInicio)} → {formatDatePE(r.fechaFin)} ·{" "}
                  {soles(r.totalSoles)} + garantía {soles(r.garantiaSoles)}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
