# Rent Management App

Private rent management web app for Rajan and family.

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- SQLite for fast v1 deployment

## Local setup

```bash
cp .env.example .env
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

Default local seeded admin:
- email: from `BOOTSTRAP_ADMIN_EMAIL`
- password: from `BOOTSTRAP_ADMIN_PASSWORD`

Set `SEED_DEMO_DATA=true` before `pnpm db:seed` if you want demo property data.

## Production

Required env:
- `DATABASE_URL`
- `AUTH_SECRET`
- `BOOTSTRAP_ADMIN_NAME`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`

For Coolify:
- build from `Dockerfile`
- set a persistent volume mounted so the SQLite DB path persists if using SQLite
- recommended `DATABASE_URL=file:/app/data/rent.db`

Start command inside container is already handled by the Dockerfile:
- `pnpm prisma db push && pnpm start`
