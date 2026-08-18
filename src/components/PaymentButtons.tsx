"use client";

import { useState } from "react";
import { PRICING, paymentsDemoMode } from "@/lib/payments/config";

export function ListingPayButton({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "LISTING_FEE", itemId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error ?? "Error");
      return;
    }
    if (data.initPoint) window.location.href = data.initPoint;
  }

  return (
    <button
      onClick={pay}
      disabled={loading}
      className="rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-ink-950 disabled:opacity-60"
    >
      {loading ? "Procesando…" : `Pagar para publicar S/ ${PRICING.listing.soles.toFixed(2)}`}
    </button>
  );
}

export function BoostButton({ itemId, premium }: { itemId: string; premium?: boolean }) {
  const [loading, setLoading] = useState(false);
  const product = premium ? "BUMP_PREMIUM" : "BUMP_STANDARD";
  const price = premium ? PRICING.bump.premium.soles : PRICING.bump.standard.soles;

  async function pay() {
    setLoading(true);
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, itemId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error ?? "Error");
      return;
    }
    if (data.initPoint) window.location.href = data.initPoint;
  }

  return (
    <button
      onClick={pay}
      disabled={loading}
      className="rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-ink-950 disabled:opacity-60"
    >
      {loading ? "Procesando…" : `${premium ? "Top 3" : "Destacar"} S/ ${price.toFixed(2)}`}
      {paymentsDemoMode() ? " (demo)" : ""}
    </button>
  );
}

export function PremiumSubscribeButton() {
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "PREMIUM_SUBSCRIPTION" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error ?? "Error");
      return;
    }
    if (data.initPoint) window.location.href = data.initPoint;
  }

  return (
    <button
      onClick={pay}
      disabled={loading}
      className="mt-6 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-ink-950"
    >
      {loading ? "Procesando…" : `Suscribirse S/ ${PRICING.premium.mensual.soles}/mes`}
    </button>
  );
}

export function ProtocolFeeButton({ rentalId }: { rentalId: string }) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "PROTOCOL_FEE", rentalId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error ?? "Error");
      return;
    }
    if (data.initPoint) window.location.href = data.initPoint;
  }

  return (
    <button
      onClick={pay}
      disabled={loading}
      className="rounded-full bg-forest-800 px-4 py-2 text-sm font-bold text-white"
    >
      {loading ? "Procesando…" : `Pagar fee protocolo S/ ${PRICING.protocolFee.soles}`}
    </button>
  );
}
