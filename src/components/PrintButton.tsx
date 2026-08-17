"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print mb-6 rounded-full bg-forest-800 px-4 py-2 text-sm font-bold text-white"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
