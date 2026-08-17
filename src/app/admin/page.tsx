import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminDisputesPanel } from "@/components/AdminDisputesPanel";
import { AdminKycPanel } from "@/components/AdminKycPanel";
import { phaseLabel, PAYMENT_PHASE } from "@/lib/payments/config";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Operaciones</p>
      <h1 className="font-display text-4xl">Panel Admin Alquila</h1>
      <p className="mt-2 text-ink-400">
        {phaseLabel()} · Fase {PAYMENT_PHASE} · Sesión: {admin.email}
      </p>
      <div className="mt-8">
        <AdminDashboard />
        <AdminDisputesPanel />
        <AdminKycPanel />
      </div>
    </div>
  );
}
