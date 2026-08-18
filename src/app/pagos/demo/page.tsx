import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { DemoPayButton } from "@/components/DemoPayButton";
import { paymentsDemoMode } from "@/lib/payments/config";

export default async function DemoPayPage({
  searchParams,
}: {
  searchParams: { ref?: string; product?: string };
}) {
  if (!paymentsDemoMode()) redirect("/");

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!searchParams.ref) redirect("/");

  const payment = await prisma.payment.findUnique({ where: { id: searchParams.ref } });
  if (!payment || payment.userId !== user.id) redirect("/");

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-3xl">Pago demo</h1>
      <p className="mt-3 text-ink-400">
        Mercado Pago no está configurado. Simula el pago de{" "}
        <strong>{searchParams.product ?? payment.tipo}</strong> por S/ {payment.montoSoles.toFixed(2)}.
      </p>
      <DemoPayButton paymentId={payment.id} />
    </div>
  );
}
