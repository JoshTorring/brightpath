# BrightPath — ADHD Support Web App (Monorepo)

**Stack**: pnpm + Turborepo • TypeScript • Next.js (web) • NestJS (API) • Prisma (PostgreSQL) • Tailwind
**Goal**: Family-friendly ADHD support with PROMs, practitioner dashboards, and Learn Hub.

## Quickstart

```bash
# 1) Install tools
corepack enable
corepack prepare pnpm@latest --activate

# 2) Install deps
pnpm i

# 3) Setup environment
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# 4) Start database (dev). Using Docker Compose:
docker compose up -d

# 5) Run Prisma and seed
pnpm db:migrate
pnpm db:seed

# 6) Dev servers (web + api)
pnpm dev
```

## Scripts
- `pnpm dev` — run web and api concurrently via turbo
- `pnpm build` — build all apps/packages
- `pnpm lint` — lint all workspaces
- `pnpm test` — run tests
- `pnpm db:migrate` — prisma migrate dev
- `pnpm db:seed` — seed data

See `/packages/prom` for the PROM engine and `/packages/ui` for shared UI components.
