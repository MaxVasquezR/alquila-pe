import Link from "next/link";

export function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Alquila S.A.C. · Perú</p>
      <h1 className="mt-2 font-display text-4xl">{title}</h1>
      <div className="prose prose-sm mt-8 max-w-none text-ink-700">{children}</div>
      <div className="mt-10 flex flex-wrap gap-4 text-sm font-semibold text-forest-800">
        <Link href="/legal/terminos">Términos</Link>
        <Link href="/legal/privacidad">Privacidad</Link>
        <Link href="/legal/reclamaciones">Libro de reclamaciones</Link>
      </div>
    </div>
  );
}
