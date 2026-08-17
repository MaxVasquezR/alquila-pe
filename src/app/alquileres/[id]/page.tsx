import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser, displayName } from "@/lib/auth";
import { parseJsonArray, maskDni, maskPhone } from "@/lib/validations";
import { STATUS_LABEL } from "@/lib/rental-machine";
import { formatDatePE, formatDateTimePE, soles } from "@/lib/utils";
import { ActaForm } from "@/components/ActaForm";
import { RentalActions } from "@/components/RentalActions";
import { ReviewForm } from "@/components/ReviewForm";
import { SecurityBadge } from "@/components/SecurityBadge";
import { CONDITION_LABEL, GARANTIA_LABEL, type ConditionGrade, type GarantiaEstado, type RentalStatus } from "@/lib/types";
import { puntosSeguros } from "@/lib/peru";
import { isPhaseEnabled } from "@/lib/payments/config";
import { EscrowPayButton } from "@/components/EscrowPayButton";
import { ProtocolFeeButton } from "@/components/PaymentButtons";
import { ExchangeTimeline } from "@/components/ExchangeTimeline";
import {
  canProceedToHandover,
  canUnlockWhatsApp,
  mustHoldEscrow,
  WEDGE,
} from "@/lib/business-rules";

export const dynamic = "force-dynamic";

const STEPS: RentalStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "HANDOVER_PENDING",
  "ACTIVE",
  "RETURN_PENDING",
  "COMPLETED",
];

export default async function RentalDetailPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: { item: true, owner: true, renter: true, actas: true, reviews: true },
  });
  if (!rental) notFound();
  if (rental.ownerId !== user.id && rental.renterId !== user.id) redirect("/alquileres");

  const role = rental.ownerId === user.id ? "OWNER" : "RENTER";
  const other = role === "OWNER" ? rental.renter : rental.owner;
  const status = rental.status as RentalStatus;
  const entrega = rental.actas.find((a) => a.tipo === "ENTREGA");
  const devolucion = rental.actas.find((a) => a.tipo === "DEVOLUCION");
  const iSignedEntrega = role === "OWNER" ? Boolean(entrega?.ownerFirmadoEn) : Boolean(entrega?.renterFirmadoEn);
  const iSignedDev = role === "OWNER" ? Boolean(devolucion?.ownerFirmadoEn) : Boolean(devolucion?.renterFirmadoEn);
  const myReviewTipo = role === "RENTER" ? "RENTER_TO_OWNER" : "OWNER_TO_RENTER";
  const alreadyReviewed = rental.reviews.some((r) => r.tipo === myReviewTipo);
  const meetingPoints = puntosSeguros(rental.item.distrito);
  const escrowEnabled = isPhaseEnabled(2);
  const escrowRequired = mustHoldEscrow();
  const wa = canUnlockWhatsApp(
    {
      status: rental.status,
      telefonoDesbloqueado: rental.telefonoDesbloqueado,
      escrowStatus: rental.escrowStatus,
    },
    rental.item.valorEstimadoSoles,
  );
  const handover = canProceedToHandover(rental.escrowStatus, rental.item.valorEstimadoSoles);
  const entregaBoth = Boolean(entrega?.ownerFirmadoEn && entrega?.renterFirmadoEn);
  const devolucionBoth = Boolean(devolucion?.ownerFirmadoEn && devolucion?.renterFirmadoEn);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <p className="font-mono text-xs font-bold text-gold-700">{rental.codigo}</p>
      <h1 className="mt-1 font-display text-2xl sm:text-4xl">{rental.item.titulo}</h1>
      <p className="mt-2 text-sm text-ink-400 sm:text-base">
        {STATUS_LABEL[status]} · {formatDatePE(rental.fechaInicio)} → {formatDatePE(rental.fechaFin)} ·{" "}
        {rental.dias} día(s)
      </p>

      <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {STEPS.map((s, i) => {
          const currentIdx = STEPS.indexOf(status === "DISPUTED" ? "RETURN_PENDING" : status === "REJECTED" || status === "CANCELLED" ? "REQUESTED" : status);
          const done = i <= currentIdx && !["REJECTED", "CANCELLED"].includes(status);
          return (
            <li
              key={s}
              className={`rounded-xl px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide ${
                done ? "bg-forest-800 text-white" : "bg-white text-ink-400"
              }`}
            >
              {STATUS_LABEL[s].split("·")[0]}
            </li>
          );
        })}
      </ol>

      {status === "DISPUTED" && (
        <div className="mt-6 rounded-2xl bg-danger-50 p-4 text-sm text-danger-600">
          Disputa: {rental.disputaMotivo}. La garantía permanece en custodia Alquila hasta resolución.
        </div>
      )}

      <div className="mt-6">
        <ExchangeTimeline
          status={status}
          telefonoDesbloqueado={rental.telefonoDesbloqueado}
          escrowStatus={rental.escrowStatus}
          entregaFirmada={entregaBoth}
          devolucionFirmada={devolucionBoth}
          escrowRequired={escrowRequired}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-card">
          <p className="text-xs font-bold uppercase text-gold-700">Contraparte</p>
          <p className="mt-1 font-semibold">{displayName(other)}</p>
          <p className="text-sm text-ink-400">
            DNI {maskDni(other.dni)} · {maskPhone(other.telefono)}
          </p>
          <SecurityBadge dni={other.dniVerificado} phone={other.telefonoVerificado} />
          <p className="mt-2 text-sm">
            Tú eres el {role === "OWNER" ? "dueño" : "arrendatario"}. {WEDGE.whatsappAfterEscrow}
          </p>
        </div>
        <div className="rounded-2xl bg-forest-900 p-4 sm:p-5 text-white">
          <p className="text-xs uppercase tracking-wider text-gold-400">Montos en Soles</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>Precio/día: {soles(rental.precioDiaSoles)}</li>
            <li>Total alquiler: {soles(rental.totalSoles)}</li>
            <li>Garantía: {soles(rental.garantiaSoles)}</li>
          </ul>
          <p className="mt-3 text-xs text-forest-100">
            {WEDGE.garantiaAlquila} {WEDGE.alquilerP2P}
          </p>
        </div>
      </div>

      {rental.mensajeRenter && (
        <p className="mt-4 rounded-2xl bg-white p-4 text-sm italic text-ink-700">
          “{rental.mensajeRenter}”
        </p>
      )}

      {escrowEnabled &&
        escrowRequired &&
        role === "RENTER" &&
        rental.status === "ACCEPTED" &&
        rental.escrowStatus === "NONE" && (
          <div className="mt-4 rounded-2xl border-2 border-gold-400/60 bg-gold-200/20 p-4 shadow-card">
            <p className="text-sm font-bold text-forest-900">Paso obligatorio: depositar garantía</p>
            <p className="mt-1 text-xs text-ink-600">
              Deposita la garantía en cuenta Alquila antes de WhatsApp y entrega física. No pagues garantía directo al dueño.
            </p>
            <div className="mt-3">
              <EscrowPayButton rentalId={rental.id} monto={rental.garantiaSoles} enabled />
            </div>
          </div>
        )}

      {escrowEnabled && rental.escrowStatus === "HELD" && (
        <p className="mt-4 rounded-xl bg-forest-50 px-3 py-2 text-sm font-semibold text-forest-800">
          Garantía en custodia Alquila · WhatsApp disponible para coordinar encuentro
        </p>
      )}

      {rental.escrowStatus === "RELEASED" && (
        <p className="mt-4 rounded-xl bg-forest-50 px-3 py-2 text-sm font-semibold text-forest-800">
          Garantía liberada al arrendatario tras devolución exitosa
        </p>
      )}

      <div className="mt-6">
        <RentalActions
          rentalId={rental.id}
          status={status}
          role={role}
          puntosSeguros={meetingPoints}
          puntoEncuentro={rental.puntoEncuentro}
          whatsappAllowed={wa.ok}
          whatsappBlockReason={wa.reason}
          escrowRequired={escrowRequired}
          escrowHeld={rental.escrowStatus === "HELD"}
          canStartHandover={handover.ok}
          handoverBlockReason={handover.reason}
        />
      </div>

      {status === "COMPLETED" && !rental.protocolFeePaid && role === "RENTER" && (
        <div className="mt-4 rounded-2xl bg-gold-200/30 p-4">
          <p className="text-sm">Fee de protocolo pendiente por este intercambio cerrado.</p>
          <div className="mt-2">
            <ProtocolFeeButton rentalId={rental.id} />
          </div>
        </div>
      )}

      {status === "HANDOVER_PENDING" && !iSignedEntrega && (
        <div className="mt-6">
          <ActaForm rentalId={rental.id} tipo="ENTREGA" />
        </div>
      )}
      {status === "HANDOVER_PENDING" && iSignedEntrega && (
        <p className="mt-6 rounded-2xl bg-forest-50 p-4 text-sm text-forest-800">
          Ya firmaste el acta de entrega. Esperando la firma de la contraparte.
        </p>
      )}
      {(status === "RETURN_PENDING" || status === "DISPUTED") && !iSignedDev && (
        <div className="mt-6">
          <ActaForm rentalId={rental.id} tipo="DEVOLUCION" />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {rental.actas.map((a) => (
          <div key={a.id} className="rounded-2xl bg-white p-4 sm:p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-xl sm:text-2xl">
                Acta de {a.tipo === "ENTREGA" ? "entrega" : "devolución"}
              </h3>
              <Link
                href={`/alquileres/${rental.id}/acta?tipo=${a.tipo}`}
                className="text-sm font-semibold text-forest-700"
              >
                Imprimir / PDF
              </Link>
            </div>
            <p className="text-sm text-ink-400">
              Estado: {CONDITION_LABEL[a.conditionGrade as ConditionGrade]} · Garantía:{" "}
              {GARANTIA_LABEL[a.garantiaEstado as GarantiaEstado]}
            </p>
            <p className="mt-2 text-sm">
              Dueño {a.ownerFirmadoEn ? `firmó ${formatDateTimePE(a.ownerFirmadoEn)}` : "pendiente"} ·
              Arrendatario {a.renterFirmadoEn ? `firmó ${formatDateTimePE(a.renterFirmadoEn)}` : "pendiente"}
            </p>
            {a.notas ? <p className="mt-2 text-sm">{a.notas}</p> : null}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {parseJsonArray(a.fotosEvidencia).map((f) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={f} src={f} alt="" className="h-16 rounded object-cover" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {status === "COMPLETED" && !alreadyReviewed && (
        <div className="mt-8 rounded-2xl bg-white p-4 sm:p-5 shadow-card">
          <h3 className="font-display text-xl sm:text-2xl">Califica el intercambio</h3>
          <ReviewForm rentalId={rental.id} />
        </div>
      )}
    </div>
  );
}
