# SchoolFlow

SchoolFlow is a secure, modular operating platform for one school or a multi-school organization. This repository currently contains the M0 production foundation; business modules are not yet implemented.

## Stack

- Next.js App Router, React, strict TypeScript and Tailwind CSS
- Supabase PostgreSQL, Auth, Storage and RLS
- Zod, Vitest, GitHub Actions and Netlify

## Requirements and setup

- Node.js 24 and pnpm 11.19.0
- Docker-compatible runtime for local Supabase

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm supabase:start
pnpm dev
```

Replace the example values with those printed by Supabase. Open `http://localhost:3000`; health is at `/api/health`. The endpoint returns `200` only when the application can reach the configured Supabase Auth service, otherwise it returns `503` with a safe degraded status.

## Quality and database commands

```bash
pnpm check
pnpm db:reset
pnpm db:lint
pnpm types:database
```

Every tenant-owned table must include an organization boundary, constraints, indexes and tested RLS. Never use privileged secrets in browser code.

## Deployment

The intended flow is GitHub pull request, CI, Netlify preview, verification and controlled production promotion. Configure public Supabase values in the appropriate Netlify contexts. Do not commit secrets.

Project sources and status records are under `docs/`.
