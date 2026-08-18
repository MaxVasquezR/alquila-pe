import { prisma } from "@/lib/prisma";
import { canTransact, getSessionUser, isAdmin } from "@/lib/auth";
import { itemSchema, parseJsonArray } from "@/lib/validations";
import { obfuscateLocation } from "@/lib/peru";
import { consumeRateLimit, logAudit } from "@/lib/security";
import { suggestedDeposit } from "@/lib/utils";
import { expireBoostedItems, recordPendingPayment, syncPremiumExpiry } from "@/lib/payments/fulfillment";
import { createCheckoutPreference, productPricing } from "@/lib/payments/mercadopago";
import { paymentsEnabled } from "@/lib/payments/config";
import { assertOwnerCanPublish } from "@/lib/business-rules";
import { fromZod, jsonError } from "@/lib/http";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(req: Request) {
  await Promise.all([expireBoostedItems(), syncPremiumExpiry()]);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const categoria = searchParams.get("categoria") ?? "";
  const distrito = searchParams.get("distrito") ?? "";

  const items = await prisma.item.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { titulo: { contains: q } },
                { descripcion: { contains: q } },
                { zonaReferencial: { contains: q } },
              ],
            }
          : {},
        categoria ? { categoria } : {},
        distrito ? { distrito } : {},
        { publicado: true },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          dniVerificado: true,
          telefonoVerificado: true,
          reputacionScore: true,
          reputacionCount: true,
          alquileresCompletados: true,
          rol: true,
          distrito: true,
        },
      },
    },
    orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      fotos: parseJsonArray(item.fotos),
      accesorios: parseJsonArray(item.accesorios),
    })),
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Inicia sesión para publicar.", 401);
  if (!canTransact(user)) {
    return jsonError("Verifica DNI y celular antes de publicar un bien.", 403);
  }

  const rl = await consumeRateLimit(`item-create:${user.id}`, 8, 24 * 60 * 60 * 1000);
  if (!rl.ok) return jsonError("Límite diario de publicaciones alcanzado.", 429);

  try {
    const raw = await req.json();
    const body = itemSchema.parse({
      ...raw,
      precioDiaSoles: Number(raw.precioDiaSoles),
      valorEstimadoSoles: Number(raw.valorEstimadoSoles),
      garantiaSugeridaSoles: Number(raw.garantiaSugeridaSoles),
      minDias: Number(raw.minDias ?? 1),
      maxDias: Number(raw.maxDias ?? 14),
    });

    if (body.maxDias < body.minDias) {
      return jsonError("El máximo de días no puede ser menor al mínimo.");
    }
    if (body.garantiaSugeridaSoles > body.valorEstimadoSoles) {
      return jsonError("La garantía no puede superar el valor estimado del bien.");
    }
    if (body.precioDiaSoles > body.valorEstimadoSoles) {
      return jsonError("El precio diario no puede superar el valor estimado.");
    }

    const kyc = await assertOwnerCanPublish(user.id, body.valorEstimadoSoles);
    if (!kyc.ok) return jsonError(kyc.error, 403);

    const loc = obfuscateLocation(body.distrito);
    const garantia =
      body.garantiaSugeridaSoles > 0 ? body.garantiaSugeridaSoles : suggestedDeposit(body.valorEstimadoSoles);

    const chargeListing = paymentsEnabled() && !isAdmin(user);

    const item = await prisma.item.create({
      data: {
        titulo: body.titulo,
        descripcion: body.descripcion,
        categoria: body.categoria,
        precioDiaSoles: body.precioDiaSoles,
        valorEstimadoSoles: body.valorEstimadoSoles,
        garantiaSugeridaSoles: garantia,
        minDias: body.minDias,
        maxDias: body.maxDias,
        distrito: body.distrito,
        zonaReferencial: body.zonaReferencial,
        latAprox: loc.latAprox,
        lngAprox: loc.lngAprox,
        fotos: JSON.stringify(body.fotos),
        accesorios: JSON.stringify(body.accesorios),
        serialOIdentificador: body.serialOIdentificador || null,
        userId: user.id,
        publicado: !chargeListing,
      },
    });

    await logAudit({
      userId: user.id,
      action: "ITEM_CREATE",
      entidad: "Item",
      entidadId: item.id,
    });

    if (!chargeListing) {
      return NextResponse.json({ ok: true, id: item.id, publicado: true });
    }

    try {
      const { soles, title } = productPricing("LISTING_FEE");
      const payment = await recordPendingPayment({
        userId: user.id,
        tipo: "LISTING_FEE",
        montoSoles: soles,
        itemId: item.id,
      });
      const checkout = await createCheckoutPreference({
        product: "LISTING_FEE",
        title,
        unitPrice: soles,
        quantity: 1,
        userId: user.id,
        itemId: item.id,
        externalReference: payment.id,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { mpPreferenceId: checkout.preferenceId ?? undefined },
      });
      return NextResponse.json({
        ok: true,
        id: item.id,
        publicado: false,
        initPoint: checkout.initPoint,
        paymentId: payment.id,
      });
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "No se pudo iniciar el pago. El borrador quedó en tu perfil.",
        502,
      );
    }
  } catch (e) {
    if (e instanceof ZodError) return fromZod(e);
    return jsonError("No se pudo publicar el anuncio.", 500);
  }
}
