# SchoolFlow Implementation Status

Last updated: 13 September 2026

## Current milestone

M1 Identity & Tenancy — Completed — Deployed & Verified

## Implemented

- Verified M0 Next.js, Supabase, CI and Netlify foundation
- Supabase Auth signup, login, logout, email confirmation callback and password recovery/update routes
- Person/profile model, organization tenant boundary, management groups, reusable locations and schools
- Organization/school memberships, configurable roles, permissions and scoped assignments
- Atomic organization/first-school onboarding and token-hash invitation acceptance
- Operation-specific RLS, permission helpers and cross-tenant foreign-key constraints
- Protected application shell, membership-backed dashboard and server-validated active tenant/school context
- Restricted trigger-only functions and fixed-search-path privileged RPCs

## Verified

- Final `pnpm check`: formatting, zero-warning ESLint, strict TypeScript, 14 tests across 6 files and Next.js production build passed
- Production dependency audit returned no known vulnerabilities
- Secrets review found no committed service-role, secret key, private key or environment credential
- RLS tests passed for tenant-scoped SELECT, INSERT, UPDATE and DELETE plus cross-tenant privilege-escalation denial
- Invitation integration assertions passed for email binding, membership/role assignment and single-use token enforcement
- GitHub Actions run `34722031763` passed on M1 commit `4dd8760`
- Netlify production deploy `6aa5cdf898e72100082cc73f` succeeded from the same M1 commit using Node.js 24
- Live homepage, login, signup, recovery and password-update pages returned HTTP 200
- Live unauthenticated `/dashboard` and `/accept-invitation` redirected to login
- Live valid login redirected to `/dashboard`; invalid login returned a generic safe error
- Live authenticated dashboard showed the no-membership state
- Live onboarding atomically created an organization, location and school and rendered the active organization/school context
- Live invitation acceptance rendered the invited context; token reuse was rejected
- Live logout succeeded and the subsequent dashboard request was redirected to login
- Live password-recovery initiation returned the non-enumerating confirmation response
- Live `/api/health` returned HTTP 200 with Supabase `connected`
- All disposable live QA users and tenant data were removed and absence verified

## Migrations

- `20260912000100_bootstrap_private_schema.sql` — remote `20260912173038` / `bootstrap_private_schema`
- `20260912000200_identity_tenancy.sql` — remote `20260912202428` / `identity_tenancy`
- `20260912000300_tenant_onboarding.sql` — remote `20260912202856` / `tenant_onboarding`
- `20260912000400_fix_tenant_onboarding.sql` — remote `20260912203053` / `fix_tenant_onboarding`
- `20260912000500_restrict_private_trigger_functions.sql` — remote `20260912220010` / `restrict_private_trigger_functions`

## Blockers

- None for M1 completion or M2 commencement.

## Deployment state

Deployed and verified at `https://schoolflow-app.netlify.app`. The canonical repository is `mattshola-creator/schoolflow`; GitHub CI, Netlify production build, live Auth/application journeys and Supabase connectivity passed on the M1 revision.

The public GitHub repository intentionally excludes `docs/product/*`, `AGENTS.md` and `CLAUDE.md`. These private specification and agent-instruction files are not disclosed.

## M2 readiness

Ready. M2 is Authorization & Entitlements: complete the effective-permission evaluator and inspection endpoint, module entitlement/feature-flag model, and integration of permission/entitlement checks with navigation and server operations. The foundational role, permission and scoped-assignment tables were brought forward into M1 by the latest approved instruction and must be extended rather than rebuilt.
