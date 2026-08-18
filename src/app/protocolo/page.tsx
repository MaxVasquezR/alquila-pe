import Link from "next/link";
import { FileCheck, ShieldCheck, Smartphone, RotateCcw, Lock, MapPinned } from "lucide-react";
import { WEDGE } from "@/lib/business-rules";

export default function ProtocoloPage() {
  const steps = [
    {
      n: "01",
      t: "Identidad declarada",
      d: "DNI de 8 dígitos y celular 9 dígitos. Sin ambos, la cuenta solo puede mirar anuncios. No es consulta RENIEC: declaras y confirmas tus datos.",
      icon: ShieldCheck,
    },
    {
      n: "02",
      t: "Solicitud, no chat frío",
      d: "El interesado pide fechas. El sistema bloquea solapes. No hay WhatsApp en el anuncio.",
      icon: Smartphone,
    },
    {
      n: "03",
      t: "Dueño acepta",
      d: "Se acuerda punto de encuentro en zona pública. Recién entonces se desbloquea WhatsApp auditado.",
      icon: FileCheck,
    },
    {
      n: "04",
      t: "WhatsApp auditado",
      d: "Mensaje con código ALQ y montos. Coordinan encuentro. Alquiler y garantía: Yape/Plin entre ustedes, en persona.",
      icon: Lock,
    },
    {
      n: "05",
      t: "Encuentro público",
      d: "Plaza, mall o paradero — nunca domicilio exacto en el anuncio. Comparan DNI físico con el perfil.",
      icon: MapPinned,
    },
    {
      n: "06",
      t: "Acta de entrega y devolución",
      d: "Fotos, checklist y firma con últimos 4 del DNI. El éxito es devolver el bien, no pelear por chat.",
      icon: RotateCcw,
    },
  ];

  const matrix = [
    ["Navegando anuncios", "Ver fotos y mapa ~500 m", "Pedir celular / pagar adelantado"],
    ["Solicitud enviada", "Esperar aceptación", "WhatsApp al dueño"],
    ["Aceptado", "WhatsApp auditado · acordar plaza pública", "Dirección exacta por chat"],
    ["Entrega", "Acta + fotos + DNI · garantía en el encuentro", "Entregar sin acta / Yape adelantado"],
    ["Devolución OK", "Cerrar acta de devolución", "Acordar todo solo por WhatsApp"],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Beta Lima · el producto no es el anuncio</p>
      <h1 className="mt-2 font-display text-3xl leading-tight sm:text-5xl">
        El éxito de Alquila es un intercambio que se entrega y se devuelve.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-ink-400 sm:text-lg">
        En Lima el miedo no es “encontrar un taladro”. Es que te estafen, te ubiquen la casa o no te
        devuelvan el bien. El contacto (WhatsApp) llega en el momento correcto — no antes.
      </p>
      <div className="mt-10 space-y-4 sm:mt-12">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4 rounded-2xl bg-white p-4 sm:gap-5 sm:p-6 shadow-card">
            <p className="font-display text-2xl text-gold-500 sm:text-3xl">{s.n}</p>
            <div>
              <s.icon className="h-5 w-5 text-forest-700" />
              <h2 className="mt-1 font-display text-xl sm:text-2xl">{s.t}</h2>
              <p className="mt-1 text-sm text-ink-400 sm:text-base">{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl bg-white p-4 sm:mt-10 sm:p-6 shadow-card">
        <h2 className="font-display text-xl sm:text-2xl">Qué puedes hacer en cada momento</h2>
        <table className="mt-4 w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase text-ink-400">
              <th className="py-2 pr-4">Momento</th>
              <th className="py-2 pr-4">Sí</th>
              <th className="py-2">No</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row[0]} className="border-b border-ink-50">
                <td className="py-3 pr-4 font-semibold">{row[0]}</td>
                <td className="py-3 pr-4 text-forest-800">{row[1]}</td>
                <td className="py-3 text-danger-600">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-2xl bg-forest-900 p-6 text-white sm:mt-10 sm:p-8">
        <h2 className="font-display text-2xl sm:text-3xl">Qué no hacemos a propósito</h2>
        <ul className="mt-4 list-disc pl-5 text-sm text-forest-100 sm:text-base">
          <li>No mostramos celular en el anuncio (solo WhatsApp auditado en el intercambio).</li>
          <li>No mostramos dirección exacta (anti-extorsión / reglaje).</li>
          <li>No custodiamos el alquiler diario ni la garantía en esta beta — Yape/Plin entre partes.</li>
          <li>No consultamos RENIEC: la identidad es declarada y confirmada por el usuario.</li>
        </ul>
        <p className="mt-4 text-sm text-forest-200">{WEDGE.garantiaAlquila}</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-ink-950">
          Ver bienes en Lima
        </Link>
      </div>
    </div>
  );
}
