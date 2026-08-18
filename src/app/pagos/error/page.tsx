import Link from "next/link";

export default function PagoErrorPage({ searchParams }: { searchParams: { ref?: string } }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-3xl text-danger-600">Pago no completado</h1>
      <p className="mt-3 text-ink-400">
        Mercado Pago no confirmó el cobro. El anuncio sigue como borrador en tu perfil. Puedes
        intentar de nuevo.
      </p>
      <Link href="/perfil" className="mt-8 inline-block rounded-full bg-forest-800 px-5 py-2 text-sm font-bold text-white">
        Ir a mi perfil
      </Link>
      {searchParams.ref ? (
        <p className="mt-4 text-xs text-ink-400">Ref: {searchParams.ref.slice(0, 8)}</p>
      ) : null}
    </div>
  );
}
