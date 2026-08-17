"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_OTP } from "@/lib/peru";

export function VerifyPanel({
  dniMasked,
  phoneMasked,
  dniDone,
  phoneDone,
  telefono,
}: {
  dniMasked: string;
  phoneMasked: string;
  dniDone: boolean;
  phoneDone: boolean;
  telefono: string;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  async function sendOtp() {
    const res = await fetch("/api/auth/verify-phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono }),
    });
    const data = await res.json();
    setMsg(data.message ?? data.error ?? "");
    if (res.ok) setOtpSent(true);
  }

  async function verifyDni(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/verify-dni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: fd.get("dni"),
        dniConfirm: fd.get("dniConfirm"),
        last4: fd.get("last4"),
      }),
    });
    const data = await res.json();
    setMsg(data.error ?? "DNI verificado.");
    if (res.ok) router.refresh();
  }

  async function verifyPhone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/verify-phone", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono: fd.get("telefono"), otp: fd.get("otp") }),
    });
    const data = await res.json();
    setMsg(data.error ?? "Celular verificado.");
    if (res.ok) router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={verifyDni} className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-display text-2xl">1. DNI</h2>
        <p className="mt-1 text-sm text-ink-400">
          Registrado como {dniMasked}. Reingresa el número completo y los últimos 4 dígitos.
        </p>
        {dniDone ? (
          <p className="mt-4 font-semibold text-forest-700">DNI verificado.</p>
        ) : (
          <div className="mt-4 space-y-3">
            <input name="dni" placeholder="DNI 8 dígitos" maxLength={8} className="w-full rounded-xl border px-3 py-2" />
            <input name="dniConfirm" placeholder="Repite DNI" maxLength={8} className="w-full rounded-xl border px-3 py-2" />
            <input name="last4" placeholder="Últimos 4" maxLength={4} className="w-full rounded-xl border px-3 py-2" />
            <button className="rounded-full bg-forest-800 px-4 py-2 text-sm font-bold text-white">
              Validar DNI
            </button>
          </div>
        )}
      </form>
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-display text-2xl">2. Celular / SMS</h2>
        <p className="mt-1 text-sm text-ink-400">
          Celular {phoneMasked}. OTP por SMS (Twilio) o demo: {DEMO_OTP}.
        </p>
        {phoneDone ? (
          <p className="mt-4 font-semibold text-forest-700">Celular verificado.</p>
        ) : (
          <>
            <button
              type="button"
              onClick={sendOtp}
              className="mt-4 rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-ink-950"
            >
              {otpSent ? "Reenviar código" : "Enviar código SMS"}
            </button>
            <form onSubmit={verifyPhone} className="mt-4 space-y-3">
              <input name="telefono" defaultValue={telefono} readOnly className="w-full rounded-xl border bg-ink-50 px-3 py-2" />
              <input name="otp" placeholder="OTP 6 dígitos" maxLength={6} className="w-full rounded-xl border px-3 py-2" />
              <button className="rounded-full bg-forest-800 px-4 py-2 text-sm font-bold text-white">
                Validar celular
              </button>
            </form>
          </>
        )}
      </div>
      {msg ? <p className="lg:col-span-2 text-sm font-medium text-forest-800">{msg}</p> : null}
    </div>
  );
}
