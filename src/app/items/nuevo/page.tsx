import { redirect } from "next/navigation";
import { getSessionUser, canTransact } from "@/lib/auth";
import { PublishForm } from "@/components/PublishForm";
import Link from "next/link";

export default async function NuevoItemPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!canTransact(user)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Verificación requerida</h1>
        <p className="mt-3 text-ink-400">
          No publicamos bienes de cuentas sin DNI y celular validados. Es la primera barrera anti-estafa.
        </p>
        <Link href="/verificar" className="mt-6 inline-block rounded-full bg-forest-800 px-5 py-2 text-sm font-bold text-white">
          Verificar ahora
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl">Publicar un bien</h1>
      <p className="mt-2 text-ink-400">
        Fee de publicación vía Mercado Pago. La dirección exacta no se guarda: solo distrito, zona
        referencial y un punto aproximado a 500 m.
      </p>
      <div className="mt-6">
        <PublishForm defaultDistrito={user.distrito} />
      </div>
    </div>
  );
}
