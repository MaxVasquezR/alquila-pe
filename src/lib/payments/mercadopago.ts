import { MercadoPagoConfig, Preference } from "mercadopago";
import { PRICING, mercadoPagoConfigured, paymentsDemoMode, type PaymentProduct } from "./config";

let client: MercadoPagoConfig | null = null;

function getClient() {
  if (!mercadoPagoConfigured()) return null;
  if (!client) {
    client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });
  }
  return client;
}

export type CheckoutItem = {
  product: PaymentProduct;
  title: string;
  unitPrice: number;
  quantity: number;
  userId: string;
  itemId?: string;
  rentalId?: string;
  externalReference: string;
};

export async function createCheckoutPreference(input: CheckoutItem) {
  const mp = getClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!mp) {
    if (!paymentsDemoMode()) {
      throw new Error("Mercado Pago no está configurado.");
    }
    return {
      demo: true,
      initPoint: `${baseUrl}/pagos/demo?ref=${encodeURIComponent(input.externalReference)}&product=${input.product}`,
      preferenceId: `demo-${input.externalReference}`,
    };
  }

  const preference = new Preference(mp);
  const result = await preference.create({
    body: {
      items: [
        {
          id: input.product,
          title: input.title,
          quantity: input.quantity,
          unit_price: input.unitPrice,
          currency_id: "PEN",
        },
      ],
      payer: { email: "" },
      external_reference: input.externalReference,
      notification_url: `${baseUrl}/api/payments/webhook`,
      back_urls: {
        success: `${baseUrl}/pagos/exito?ref=${encodeURIComponent(input.externalReference)}`,
        failure: `${baseUrl}/pagos/error?ref=${encodeURIComponent(input.externalReference)}`,
        pending: `${baseUrl}/pagos/pendiente?ref=${encodeURIComponent(input.externalReference)}`,
      },
      auto_return: "approved",
      statement_descriptor: "ALQUILA",
    },
  });

  return {
    demo: false,
    initPoint: result.init_point ?? result.sandbox_init_point,
    preferenceId: result.id,
  };
}

export function productPricing(product: PaymentProduct): { soles: number; title: string } {
  switch (product) {
    case "LISTING_FEE":
      return { soles: PRICING.listing.soles, title: PRICING.listing.label };
    case "BUMP_STANDARD":
      return { soles: PRICING.bump.standard.soles, title: PRICING.bump.standard.label };
    case "BUMP_PREMIUM":
      return { soles: PRICING.bump.premium.soles, title: PRICING.bump.premium.label };
    case "PREMIUM_SUBSCRIPTION":
      return { soles: PRICING.premium.mensual.soles, title: PRICING.premium.mensual.label };
    case "PROTOCOL_FEE":
      return { soles: PRICING.protocolFee.soles, title: PRICING.protocolFee.label };
    case "ESCROW_GARANTIA":
      return { soles: 0, title: "Garantía retenida" };
    default:
      return { soles: 0, title: "Alquila" };
  }
}
