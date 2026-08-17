"use client";

import { useRouter } from "next/navigation";

export function DemoPayButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();

  async function pay() {
    await fetch("/api/payments/demo-fulfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
    router.push("/pagos/exito?ref=" + paymentId);
  }

  return (
    <button
      type="button"
      onClick={pay}
      className="mt-8 rounded-full bg-gold-500 px-6 py-3 font-bold text-ink-950"
    >
      Simular pago aprobado
    </button>
  );
}
