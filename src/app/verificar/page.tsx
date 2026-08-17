import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { maskDni, maskPhone } from "@/lib/validations";
import { VerifyPanel } from "@/components/VerifyPanel";

export default async function VerificarPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl">Verificación de identidad</h1>
      <p className="mt-2 max-w-2xl text-ink-400">
        Alquila no es un tablón anónimo. Publicar, solicitar y desbloquear WhatsApp exige DNI y
        celular validados. El número completo nunca se muestra en el anuncio.
      </p>
      <div className="mt-8">
        <VerifyPanel
          dniMasked={maskDni(user.dni)}
          phoneMasked={maskPhone(user.telefono)}
          dniDone={user.dniVerificado}
          phoneDone={user.telefonoVerificado}
          telefono={user.telefono}
        />
      </div>
    </div>
  );
}
