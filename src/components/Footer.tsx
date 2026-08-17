import Link from "next/link";
import { WEDGE } from "@/lib/business-rules";

const soporteEmail = process.env.SOPORTE_EMAIL ?? "soporte@alquila.pe";
const soporteWa = process.env.SOPORTE_WHATSAPP?.trim();

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-forest-900 text-ink-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl">Alquila</p>
          <p className="mt-2 max-w-sm text-sm text-forest-100">
            Protocolo de alquiler P2P en Lima. No somos vitrina: cerramos intercambios con acta y{" "}
            {WEDGE.garantiaAlquila.toLowerCase()}
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-gold-400">Contacto y soporte</p>
          <ul className="mt-3 space-y-2 text-forest-100">
            <li>
              <a href={`mailto:${soporteEmail}`} className="hover:text-gold-200">
                {soporteEmail}
              </a>
            </li>
            {soporteWa ? (
              <li>
                <a
                  href={`https://wa.me/${soporteWa}?text=${encodeURIComponent("Hola, necesito soporte Alquila (no es un intercambio P2P).")}`}
                  className="hover:text-gold-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp soporte Alquila
                </a>
              </li>
            ) : null}
            <li className="text-xs text-forest-200/80">
              El celular del dueño <strong>nunca</strong> aparece aquí. Solo WhatsApp auditado dentro
              de un intercambio aceptado, tras depositar la garantía en Alquila.
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-gold-400">Operación segura</p>
          <ul className="mt-3 space-y-2 text-forest-100">
            <li>DNI y celular verificados</li>
            <li>Ubicación ofuscada · ~500 m</li>
            <li>Garantía en custodia Alquila · WhatsApp tras depósito</li>
            <li>Acta entrega y devolución · liberación automática</li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-gold-400">Producto</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/protocolo" className="hover:text-gold-200">
                Protocolo de intercambio
              </Link>
            </li>
            <li>
              <Link href="/premium" className="hover:text-gold-200">
                Destacados y Premium
              </Link>
            </li>
            <li>
              <Link href="/para-duenos" className="hover:text-gold-200">
                Programa dueños Lima
              </Link>
            </li>
            <li>
              <Link href="/legal/terminos" className="hover:text-gold-200">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link href="/legal/privacidad" className="hover:text-gold-200">
                Privacidad (Ley 29733)
              </Link>
            </li>
            <li>
              <Link href="/legal/reclamaciones" className="hover:text-gold-200">
                Libro de reclamaciones
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-forest-100">
        Soles (S/.) · Lima Metropolitana ·{" "}
        <Link href="/legal/reclamaciones" className="underline">
          Libro de reclamaciones
        </Link>
      </p>
    </footer>
  );
}
