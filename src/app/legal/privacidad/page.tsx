import { LegalLayout } from "@/components/LegalLayout";

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de Privacidad">
      <p><strong>Ley N.° 29733 — Protección de Datos Personales (Perú)</strong></p>
      <h2 className="font-display text-2xl mt-6">Datos que tratamos</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Identidad: nombres, apellidos, DNI, correo, celular, distrito.</li>
        <li>Transaccional: solicitudes, actas, fotos de evidencia, reseñas.</li>
        <li>Técnicos: logs de auditoría, hash de IP en registro, cookies de sesión.</li>
        <li>Pagos: referencias Mercado Pago del fee de publicación y servicios opcionales (no almacenamos números completos de tarjeta).</li>
      </ul>
      <h2 className="font-display text-2xl mt-6">Finalidad</h2>
      <p>
        Verificar identidad declarada, facilitar alquileres P2P, prevenir estafas, cobrar el fee de
        publicación y cumplir obligaciones legales.
      </p>
      <h2 className="font-display text-2xl mt-6">No publicamos</h2>
      <p>
        DNI completo, celular completo ni dirección exacta en anuncios públicos. Solo datos
        enmascarados y ubicación aproximada (~500 m).
      </p>
      <h2 className="font-display text-2xl mt-6">Tus derechos ARCO</h2>
      <p>
        Puedes solicitar acceso, rectificación, cancelación u oposición escribiendo a{" "}
        <a href="mailto:privacidad@alquila.pe" className="text-forest-800 underline">
          privacidad@alquila.pe
        </a>
        .
      </p>
      <h2 className="font-display text-2xl mt-6">Conservación</h2>
      <p>
        Actas y auditoría se conservan mientras exista disputa o obligación legal. Puedes solicitar
        eliminación de cuenta sujeta a retención mínima legal.
      </p>
    </LegalLayout>
  );
}
