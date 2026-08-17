import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, displayName } from "@/lib/auth";
import { maskDni } from "@/lib/validations";
import { formatDateTimePE, soles } from "@/lib/utils";
import { PrintButton } from "@/components/PrintButton";
import { CONDITION_LABEL, type ConditionGrade } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ActaPrintPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tipo?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const tipo = searchParams.tipo === "DEVOLUCION" ? "DEVOLUCION" : "ENTREGA";
  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: { item: true, owner: true, renter: true, actas: true },
  });
  if (!rental) notFound();
  if (rental.ownerId !== user.id && rental.renterId !== user.id) redirect("/alquileres");
  const acta = rental.actas.find((a) => a.tipo === tipo);
  if (!acta) notFound();

  return (
    <div className="acta-paper mx-auto max-w-3xl px-6 py-10">
      <PrintButton />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Alquila · Lima, Perú</p>
      <h1 className="mt-2 font-display text-4xl">
        Acta de {tipo === "ENTREGA" ? "entrega" : "devolución"} de bien mueble
      </h1>
      <p className="mt-1 font-mono text-sm">{rental.codigo}</p>
      <p className="mt-6 text-sm leading-6">
        Las partes, identificadas con DNI, dejan constancia del estado del bien y de la garantía en
        Soles. Alquila actúa como facilitador digital y no asume custodia del inventario ni del
        dinero.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
        <div className="rounded-xl border p-4">
          <p className="font-bold">Dueño / arrendador</p>
          <p>{displayName(rental.owner)}</p>
          <p>DNI {maskDni(rental.owner.dni)} (últimos 4 firmados: {acta.ownerDniUltimos4 ?? "—" })</p>
          <p>{rental.owner.distrito}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="font-bold">Arrendatario</p>
          <p>{displayName(rental.renter)}</p>
          <p>DNI {maskDni(rental.renter.dni)} (últimos 4 firmados: {acta.renterDniUltimos4 ?? "—" })</p>
          <p>{rental.renter.distrito}</p>
        </div>
      </div>
      <div className="mt-6 text-sm">
        <p>
          <strong>Bien:</strong> {rental.item.titulo}
        </p>
        <p>
          <strong>Periodo:</strong> {rental.fechaInicio.toISOString().slice(0, 10)} al{" "}
          {rental.fechaFin.toISOString().slice(0, 10)}
        </p>
        <p>
          <strong>Precio:</strong> {soles(rental.precioDiaSoles)}/día · Total {soles(rental.totalSoles)}
        </p>
        <p>
          <strong>Garantía:</strong> {soles(rental.garantiaSoles)} ({acta.garantiaEstado}
          {acta.garantiaMontoRetenido ? ` · retenido ${soles(acta.garantiaMontoRetenido)}` : ""})
        </p>
        <p>
          <strong>Estado declarado:</strong> {CONDITION_LABEL[acta.conditionGrade as ConditionGrade]}
        </p>
        {rental.item.serialOIdentificador ? (
          <p>
            <strong>Identificador:</strong> {rental.item.serialOIdentificador}
          </p>
        ) : null}
      </div>
      {acta.notas ? (
        <p className="mt-4 text-sm">
          <strong>Notas:</strong> {acta.notas}
        </p>
      ) : null}
      <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
        <p>
          Firma dueño
          <br />
          {acta.ownerFirmadoEn ? formatDateTimePE(acta.ownerFirmadoEn) : "Pendiente"}
        </p>
        <p>
          Firma arrendatario
          <br />
          {acta.renterFirmadoEn ? formatDateTimePE(acta.renterFirmadoEn) : "Pendiente"}
        </p>
      </div>
      <p className="mt-10 text-xs text-ink-400">
        Documento generado por Alquila. Conservar junto a las fotos de evidencia. En caso de
        disputa, este acta y el historial de firmas constituyen el expediente del intercambio.
      </p>
    </div>
  );
}
