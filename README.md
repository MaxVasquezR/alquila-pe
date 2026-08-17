# Alquila — Deploy producción

## Requisitos

- Node 20+
- PostgreSQL 16 (`docker compose up -d`)
- Variables en `.env` (copiar desde `.env.example`)

## Setup local (SQLite — sin Docker)

```bash
cp .env.example .env
# DATABASE_URL="file:./dev.db"  (default)
npm install
npx prisma db push
npm run db:seed
npm run dev
```

## Producción (PostgreSQL)

Cambia `provider` en `prisma/schema.prisma` a `postgresql` y usa Neon/Supabase:

```bash
DATABASE_URL="postgresql://user:pass@host/alquila?schema=public"
```

O con Docker local: `npm run docker:up`

## Producción (Vercel + Neon/Supabase)

1. `DATABASE_URL` → Postgres managed
2. `SESSION_SECRET` → 64+ chars aleatorios
3. `MP_ACCESS_TOKEN` → Mercado Pago Perú
4. `CRON_SECRET` → para `/api/cron/expire-boosts`
5. `TWILIO_*` → OTP SMS real (opcional)
6. `S3_*` → Cloudflare R2 / AWS S3 fotos
7. `ADMIN_EMAIL` → acceso panel `/admin`
8. `ALQUILA_PAYMENT_PHASE` → `1` | `2` | `3`

## Fases de pago

| Fase | Env | Funcionalidad |
|------|-----|---------------|
| 1 | `ALQUILA_PAYMENT_PHASE=1` | Bumps, Premium, fee protocolo |
| 2 | `2` | + Escrow garantía Mercado Pago |
| 3 | `3` | + Comisión GMV (roadmap) |

Sin `MP_ACCESS_TOKEN` → modo demo en `/pagos/demo`.

## Legal (Perú)

- `/legal/terminos`
- `/legal/privacidad` (Ley 29733)
- `/legal/reclamaciones`

Constituir SAC/RUC y facturación SUNAT antes de cobrar en producción real.

## Demo

- Admin: `admin@alquila.pe` / `Demo2026!`
- Luis arrendatario: `luis.vargas@alquila.pe` / `Demo2026!`
