import { LegalLayout } from "@/components/LegalLayout";

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y Condiciones">
      <p><strong>Última actualización:</strong> agosto 2026</p>
      <p>
        <strong>Beta pública.</strong> Alquila es una plataforma digital en prueba operada en Lima
        Metropolitana. No es una sociedad anónima constituida ni emite comprobantes SUNAT en esta
        etapa. Al usar el servicio aceptas estos términos.
      </p>
      <h2 className="font-display text-2xl mt-6">1. Intermediación</h2>
      <p>
        Alquila actúa como intermediario digital entre personas naturales que desean alquilar bienes
        muebles. No es arrendador ni propietario del inventario. No custodia el dinero del alquiler
        diario ni de la garantía entre las partes. Cobramos un <strong>fee de publicación</strong>{" "}
        por cada anuncio que sale al catálogo, vía Mercado Pago.
      </p>
      <h2 className="font-display text-2xl mt-6">2. Moneda</h2>
      <p>Todos los montos se expresan en Soles peruanos (S/.).</p>
      <h2 className="font-display text-2xl mt-6">3. Verificación de identidad</h2>
      <p>
        El usuario declara que su DNI y celular son verídicos. La verificación es declarativa
        (confirmación de los datos registrados y código al celular o correo): no es consulta a
        RENIEC. Publicar, solicitar alquileres o desbloquear WhatsApp requiere esa confirmación.
        Alquila puede suspender cuentas con reportes graves o 3 strikes.
      </p>
      <h2 className="font-display text-2xl mt-6">4. Ubicación</h2>
      <p>
        Alquila no almacena ni muestra la dirección exacta del domicilio en los anuncios. Las partes
        acuerdan un punto de encuentro en zona pública. Alquila no valida la seguridad física del
        lugar elegido.
      </p>
      <h2 className="font-display text-2xl mt-6">5. Actas de entrega y devolución</h2>
      <p>
        Las actas digitales constituyen constancia del estado del bien y de las firmas con últimos 4
        dígitos del DNI. No sustituyen asesoría legal ni contratos notariales cuando el valor lo
        requiera.
      </p>
      <h2 className="font-display text-2xl mt-6">6. Pagos</h2>
      <p>
        Publicar un anuncio en el catálogo cuesta el fee vigente (hoy S/ 9.90) pagado por el dueño
        vía Mercado Pago. El anuncio no es público hasta que el pago esté aprobado. Destacados y
        membresía Premium son opcionales. Los pagos del alquiler diario y de la garantía entre
        usuarios son responsabilidad exclusiva de las partes (Yape/Plin/efectivo) y se registran en
        el acta. Alquila no retiene esos fondos.
      </p>
      <h2 className="font-display text-2xl mt-6">7. Limitación de responsabilidad</h2>
      <p>
        Alquila no garantiza la existencia, calidad o legalidad de los bienes. El usuario asume el
        riesgo del encuentro físico y debe verificar identidad en persona.
      </p>
    </LegalLayout>
  );
}
