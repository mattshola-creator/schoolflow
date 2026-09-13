# SchoolFlow

SchoolFlow is a secure, modular operating platform for one school or a multi-school organization. The repository contains the verified bootstrap plus M1 identity and tenant foundations; operational school modules are not yet implemented.

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

Replace the example values with those printed by Supabase. Keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local development. Open `http://localhost:3000`; health is at `/api/health`. The endpoint returns `200` only when the application can reach the configured Supabase Auth service, otherwise it returns `503` with a safe degraded status.

Authentication routes are `/sign-up`, `/login`, `/forgot-password` and `/update-password`. Authenticated users without a membership are directed through `/onboarding`; tenant context is resolved only from memberships visible through RLS.

## Quality and database commands

```bash
pnpm check
pnpm db:reset
pnpm db:lint
pnpm types:database
```

Every tenant-owned table must include an organization boundary, constraints, indexes and tested RLS. Never use privileged secrets in browser code.

Academic setup is available at `/academic-setup` for an active school context with the `academics.setup.view` permission, academics entitlement and `academics.academic_setup` feature enabled. Management permissions are split across sessions, periods, class structure, subjects and locks.

## Deployment

The intended flow is GitHub pull request, CI, Netlify preview, verification and controlled production promotion. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SITE_URL=https://schoolflow-app.netlify.app` in the appropriate Netlify contexts. Do not commit secrets.

The hosted Supabase Auth URL configuration must use `https://schoolflow-app.netlify.app` as its Site URL and explicitly allow `https://schoolflow-app.netlify.app/auth/callback` and `https://schoolflow-app.netlify.app/update-password`. Keep exact localhost callbacks for development; use the documented Netlify preview pattern only for preview deployments. Recovery templates that construct their own link must use Supabase's `RedirectTo` value rather than replacing it with the Site URL.

M0 is deployed and verified at [schoolflow-app.netlify.app](https://schoolflow-app.netlify.app). Runtime health is available at [`/api/health`](https://schoolflow-app.netlify.app/api/health).

Project sources and status records are under `docs/`.
