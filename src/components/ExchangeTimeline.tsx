import { Lock, Check, Circle } from "lucide-react";
import { WEDGE } from "@/lib/business-rules";
import type { RentalStatus } from "@/lib/types";

type StepState = "done" | "current" | "locked" | "skipped";

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") return <Check className="h-4 w-4 text-white" />;
  if (state === "locked") return <Lock className="h-4 w-4 text-ink-400" />;
  if (state === "current") return <Circle className="h-3 w-3 fill-gold-500 text-gold-500" />;
  return <Circle className="h-3 w-3 text-ink-300" />;
}

export function ExchangeTimeline({
  status,
  telefonoDesbloqueado,
  escrowStatus,
  entregaFirmada,
  devolucionFirmada,
  escrowRequired,
}: {
  status: RentalStatus;
  telefonoDesbloqueado: boolean;
  escrowStatus: string;
  entregaFirmada: boolean;
  devolucionFirmada: boolean;
  escrowRequired: boolean;
}) {
  const accepted = !["REQUESTED", "REJECTED", "CANCELLED"].includes(status);
  const escrowDone = escrowStatus === "HELD" || escrowStatus === "RELEASED" || !escrowRequired;
  const escrowReleased = escrowStatus === "RELEASED";
  const handoverDone = entregaFirmada || ["ACTIVE", "RETURN_PENDING", "COMPLETED", "DISPUTED"].includes(status);
  const completed = status === "COMPLETED";

  const waOk = accepted && escrowDone && telefonoDesbloqueado;

  const steps: Array<{ label: string; detail: string; state: StepState }> = [
    {
      label: "Solicitud enviada",
      detail: "Sin contacto directo — anti-estafa.",
      state: "done",
    },
    {
      label: "Dueño aceptó",
      detail: accepted ? "Solicitud confirmada." : "Esperando respuesta del dueño.",
      state: accepted ? "done" : status === "REQUESTED" ? "current" : "locked",
    },
  ];

  if (escrowRequired) {
    steps.push({
      label: "Garantía en custodia Alquila",
      detail: escrowDone
        ? escrowReleased
          ? "Garantía liberada al arrendatario."
          : "Depositada en cuenta Alquila."
        : "Arrendatario debe depositar antes de WhatsApp y entrega.",
      state: !accepted ? "locked" : escrowDone ? "done" : "current",
    });
  }

  steps.push(
    {
      label: "WhatsApp auditado",
      detail: waOk
        ? "Coordinación con mensaje y código ALQ."
        : escrowRequired
          ? "Disponible después de depositar la garantía."
          : "Disponible cuando el dueño acepta la solicitud.",
      state: !accepted ? "locked" : waOk ? "done" : escrowDone ? "current" : "locked",
    },
    {
      label: "Acta de entrega",
      detail: handoverDone ? "Bien en alquiler." : "Fotos, checklist y firma DNI en zona pública.",
      state: !waOk ? "locked" : handoverDone ? "done" : accepted ? "current" : "locked",
    },
    {
      label: "Devolución cerrada",
      detail: completed ? "Intercambio verificado." : WEDGE.garantiaAlquila,
      state: completed ? "done" : devolucionFirmada ? "current" : handoverDone ? "current" : "locked",
    },
  );

  return (
    <section className="rounded-2xl bg-white p-4 sm:p-5 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Protocolo del intercambio</p>
      <p className="mt-1 text-sm text-ink-400">
        {escrowRequired
          ? "Garantía en Alquila → WhatsApp → encuentro → acta."
          : "Aceptación → WhatsApp → encuentro público → acta de entrega y devolución."}
      </p>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                s.state === "done"
                  ? "bg-forest-800"
                  : s.state === "current"
                    ? "bg-gold-200 ring-2 ring-gold-500"
                    : "bg-ink-50"
              }`}
            >
              <StepIcon state={s.state} />
            </span>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  s.state === "current" ? "text-forest-800" : "text-ink-900"
                }`}
              >
                {s.label}
              </p>
              <p className="text-xs leading-relaxed text-ink-400">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
