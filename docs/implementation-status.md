# SchoolFlow Implementation Status

Last updated: 13 September 2026

## Current milestone

M2 Authorization & Entitlements — Implemented; publication and deployment verification pending

## Implemented

- Verified M0 Next.js, Supabase, CI and Netlify foundation
- Supabase Auth signup, login, logout, email confirmation callback and password recovery/update routes
- Person/profile model, organization tenant boundary, management groups, reusable locations and schools
- Organization/school memberships, configurable roles, permissions and scoped assignments
- Atomic organization/first-school onboarding and token-hash invitation acceptance
- Operation-specific RLS, permission helpers and cross-tenant foreign-key constraints
- Protected application shell, membership-backed dashboard and server-validated active tenant/school context
- Restricted trigger-only functions and fixed-search-path privileged RPCs
- Caller-bound effective-permission and product-availability evaluator
- Secure `/api/authorization` inspection endpoint and reusable server capability guard
- Platform module/feature catalog, configurable plans, tenant plan state and operational feature flags
- Permission- and entitlement-aware authenticated navigation with distinct denied/unavailable states

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
- M2 local `pnpm check` passed formatting, zero-warning lint, strict TypeScript, 22 tests across 8 files and production build
- M2 production dependency audit returned no known vulnerabilities
- Remote M2 authorization transaction passed allowed scoped access, non-member/cross-tenant/invalid-school denial, self-role-escalation denial, plan/flag mutation denial, non-entitled module, disabled feature and suspended-membership cases; all fixtures rolled back
- All six M2 configuration tables have RLS, explicit deny policies and no `anon` or `authenticated` table privileges

## Migrations

- `20260912000100_bootstrap_private_schema.sql` — remote `20260912173038` / `bootstrap_private_schema`
- `20260912000200_identity_tenancy.sql` — remote `20260912202428` / `identity_tenancy`
- `20260912000300_tenant_onboarding.sql` — remote `20260912202856` / `tenant_onboarding`
- `20260912000400_fix_tenant_onboarding.sql` — remote `20260912203053` / `fix_tenant_onboarding`
- `20260912000500_restrict_private_trigger_functions.sql` — remote `20260912220010` / `restrict_private_trigger_functions`
- `20260913052337_authorization_entitlements.sql` — remote `20260913052820` / `authorization_entitlements`
- `20260913052955_harden_entitlement_catalog.sql` — remote `20260913053032` / `harden_entitlement_catalog`

## Blockers

- M2 GitHub CI, Netlify production deployment and live authorization smoke testing remain required before completion.

## Deployment state

Deployed and verified at `https://schoolflow-app.netlify.app`. The canonical repository is `mattshola-creator/schoolflow`; GitHub CI, Netlify production build, live Auth/application journeys and Supabase connectivity passed on the M1 revision.

The public GitHub repository intentionally excludes `docs/product/*`, `AGENTS.md` and `CLAUDE.md`. These private specification and agent-instruction files are not disclosed.

## M3 readiness

Not ready until the M2 revision passes GitHub CI, Netlify deployment and live authorization/entitlement verification.
