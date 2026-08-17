import { prisma } from "@/lib/prisma";
import { PRICING } from "./config";
import type { PaymentProduct } from "./config";

export async function recordPendingPayment(input: {
  userId: string;
  tipo: PaymentProduct;
  montoSoles: number;
  itemId?: string;
  rentalId?: string;
  mpPreferenceId?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.payment.create({
    data: {
      userId: input.userId,
      tipo: input.tipo,
      montoSoles: input.montoSoles,
      itemId: input.itemId,
      rentalId: input.rentalId,
      mpPreferenceId: input.mpPreferenceId,
      status: "PENDING",
      metadata: JSON.stringify(input.metadata ?? {}),
    },
  });
}

export async function fulfillPayment(paymentId: string, mpPaymentId?: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status === "APPROVED") return payment;

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "APPROVED",
      mpPaymentId: mpPaymentId ?? payment.mpPaymentId,
      mpStatus: "approved",
    },
  });

  switch (payment.tipo as PaymentProduct) {
    case "BUMP_STANDARD":
    case "BUMP_PREMIUM": {
      if (!payment.itemId) break;
      const dias =
        payment.tipo === "BUMP_PREMIUM"
          ? PRICING.bump.premium.dias
          : PRICING.bump.standard.dias;
      const hasta = new Date();
      hasta.setDate(hasta.getDate() + dias);
      await prisma.item.update({
        where: { id: payment.itemId },
        data: { destacado: true, destacadoHasta: hasta },
      });
      break;
    }
    case "PREMIUM_SUBSCRIPTION": {
      const hasta = new Date();
      hasta.setMonth(hasta.getMonth() + 1);
      await prisma.user.update({
        where: { id: payment.userId },
        data: { rol: "PREMIUM_OWNER", premiumHasta: hasta },
      });
      break;
    }
    case "PROTOCOL_FEE": {
      if (payment.rentalId) {
        await prisma.rental.update({
          where: { id: payment.rentalId },
          data: { protocolFeePaid: true },
        });
      }
      break;
    }
    case "ESCROW_GARANTIA": {
      if (payment.rentalId) {
        await prisma.escrowHold.updateMany({
          where: { rentalId: payment.rentalId, status: "PENDING" },
          data: { status: "HELD", heldAt: new Date(), mpPaymentId: mpPaymentId ?? undefined },
        });
        await prisma.rental.update({
          where: { id: payment.rentalId },
          data: { escrowStatus: "HELD" },
        });
        const rental = await prisma.rental.findUnique({
          where: { id: payment.rentalId },
          include: { owner: true, renter: true, item: true },
        });
        if (rental) {
          const { notifyUser } = await import("@/lib/notifications");
          const link = `/alquileres/${rental.id}`;
          for (const u of [
            { userId: rental.ownerId, titulo: "Garantía retenida", cuerpo: `El arrendatario depositó la garantía de ${rental.item.titulo}. Ya pueden coordinar por WhatsApp auditado.` },
            { userId: rental.renterId, titulo: "WhatsApp desbloqueado", cuerpo: `Garantía retenida. Coordina el encuentro en zona pública por WhatsApp.` },
          ]) {
            await notifyUser({ ...u, tipo: "ESCROW_HELD", link });
          }
        }
      }
      break;
    }
  }

  return prisma.payment.findUnique({ where: { id: paymentId } });
}

export async function expireBoostedItems() {
  const now = new Date();
  const expired = await prisma.item.updateMany({
    where: { destacado: true, destacadoHasta: { lt: now } },
    data: { destacado: false },
  });
  return expired.count;
}

export async function syncPremiumExpiry() {
  const now = new Date();
  const expired = await prisma.user.updateMany({
    where: { rol: "PREMIUM_OWNER", premiumHasta: { lt: now } },
    data: { rol: "USER" },
  });
  return expired.count;
}
