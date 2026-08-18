# Alquila — Lima

Marketplace P2P de alquiler de bienes. El dueño paga **S/ 9.90** por publicar (Mercado Pago). El alquiler diario y la garantía se pagan entre las partes (Yape/Plin). Hosting previsto: **Railway**, no Vercel.

## Requisitos

- Node 20+
- PostgreSQL
- Variables en `.env` (copiar desde `.env.example`)

## Setup local

```bash
cp .env.example .env
# DATABASE_URL Postgres + SESSION_SECRET de 32+ chars
npm install
npx prisma db push
npm run db:seed          # solo local
npm run dev
```

`npm run db:seed` **no** se usa en producción.

## Producción (Railway)

1. Crea un proyecto en [Railway](https://railway.app) y conecta este repo.
2. Añade el plugin **PostgreSQL**. Railway inyecta `DATABASE_URL`.
3. Variables (ver [`.env.example`](.env.example)):
   - `SESSION_SECRET` — 64+ chars
   - `NEXT_PUBLIC_APP_URL` — URL pública (`https://….up.railway.app` o tu dominio)
   - `ALQUILA_PAYMENTS_ENABLED=1`
   - `MP_ACCESS_TOKEN` — Mercado Pago (sin esto no se cobra ni se publican anuncios de usuarios)
   - `CRON_SECRET`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   - `S3_*` + `S3_PUBLIC_URL` (R2/S3)
   - Twilio **o** `RESEND_API_KEY` + `EMAIL_FROM`
   - `SOPORTE_EMAIL` y `SOPORTE_WHATSAPP` (`51XXXXXXXXX`)
4. Deploy usa el [`Dockerfile`](Dockerfile): `prisma db push` + `next start -p $PORT`.
5. Crea el admin **una vez**, en tu PC, con la `DATABASE_URL` de Railway:

```bash
# .env apuntando a Postgres de Railway
npm run db:admin
```

6. **Cron de Railway** (diario, p. ej. 05:00 UTC): `GET https://TU-URL/api/cron/expire-boosts` con header `Authorization: Bearer $CRON_SECRET`.
7. Publica 5–10 bienes con la cuenta admin (sale al catálogo **sin** fee). Recién entonces comparte el link en redes.
8. Dominio propio: Settings → Networking → Custom domain.

## Cómo ganas dinero

| Producto | Monto | Cuándo |
|----------|--------|--------|
| Publicar anuncio (`LISTING_FEE`) | S/ 9.90 | Obligatorio. El anuncio no es público hasta pagar. |
| Destacado / Premium | opcional | Con cobros activos |
| Alquiler diario / garantía | entre usuarios | Alquila no lo retiene |

## Legal

- `/legal/terminos` — intermediario; fee de publicación; no custodia de fondos del alquiler
- `/legal/privacidad` (Ley 29733)
- `/legal/reclamaciones`

RUC y facturación SUNAT recomendados para cobrar en serio. Ver [LEGAL.md](LEGAL.md).
