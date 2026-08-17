import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl">No encontramos eso</h1>
      <p className="mt-2 text-ink-400">El anuncio o el intercambio no existe o ya no está visible.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-forest-800 px-5 py-2 text-sm font-bold text-white">
        Volver al inicio
      </Link>
    </div>
  );
}
