import { LegalLayout } from "@/components/LegalLayout";

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y Condiciones">
      <p><strong>Última actualización:</strong> agosto 2026</p>
      <h2 className="font-display text-2xl mt-6">1. Intermediación</h2>
      <p>
        Alquila S.A.C. (RUC pendiente de registro en producción) actúa como intermediario digital
        entre personas naturales que desean alquilar bienes muebles en Lima Metropolitana. Alquila
        no es arrendador, no es propietario del inventario publicado y, en Fase 1, no custodia el
        dinero del alquiler ni de la garantía entre las partes.
      </p>
      <h2 className="font-display text-2xl mt-6">2. Moneda</h2>
      <p>Todos los montos se expresan en Soles peruanos (S/.).</p>
      <h2 className="font-display text-2xl mt-6">3. Verificación de identidad</h2>
      <p>
        El usuario declara que su DNI y celular son verídicos. Publicar, solicitar alquileres o
        desbloquear WhatsApp requiere verificación. Alquila puede suspender cuentas con reportes
        graves o 3 strikes.
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
      <h2 className="font-display text-2xl mt-6">6. Pagos a la plataforma</h2>
      <p>
        Destacados, membresía Premium y fee de protocolo se cobran vía Mercado Pago. Los pagos del
        alquiler diario entre usuarios son responsabilidad de las partes (Yape/Plin/efectivo).
      </p>
      <h2 className="font-display text-2xl mt-6">6b. Custodia de garantía</h2>
      <p>
        Alquila retiene la garantía del arrendatario como intermediario en custodia (Fase 2+). No es
        arrendador del bien. La garantía se libera al arrendatario al cerrar la devolución con acta
        firmada por ambas partes, salvo disputa por daño grave resuelta conforme al protocolo.
      </p>
      <h2 className="font-display text-2xl mt-6">7. Limitación de responsabilidad</h2>
      <p>
        Alquila no garantiza la existencia, calidad o legalidad de los bienes. El usuario asume el
        riesgo del encuentro físico y debe verificar identidad en persona.
      </p>
    </LegalLayout>
  );
}
