# Known Issues

## Open

- Owner password recovery is blocked until the hosted Supabase Auth Site URL and redirect allow-list are changed from localhost to the deployed SchoolFlow origin. The application and Netlify URL fixes are implemented and tested; a new recovery email must be issued only after the hosted Auth setting is verified.

- Local Git transport remains unauthenticated. GitHub publication and verification currently use the authenticated connector, whose remote commit SHAs differ from the equivalent local checkpoint SHAs.
- Docker is unavailable in the current execution environment. This does not block M0 because the development-project migration, access restrictions, advisors and application connectivity were verified remotely.
- Supabase security advisor reports intentional warnings for authenticated `SECURITY DEFINER` functions. Each has a fixed empty search path, explicit authenticated grant, revoked anonymous/public execution and caller/scope validation.
- Supabase performance advisor reports informational missing-index, unused-index and permissive-policy overlap findings. These should be revisited against measured workloads.
- Supabase Auth leaked-password protection is disabled. This is a non-blocking hardening recommendation for the development project and should be enabled before production launch.
- M2 adds one intentional caller-bound `SECURITY DEFINER` inspection RPC. It has a fixed empty search path, accepts no target-user identifier, validates the authenticated caller and requested tenant/school context, and is executable only by `authenticated`, `service_role` and `postgres`.
- M3 adds restricted caller-bound entitlement helpers and atomic academic RPCs. They have fixed empty search paths, derive the caller from `auth.uid()`, validate membership, school scope, permission, entitlement and feature state, and expose no target-user inspection surface. The security advisor therefore reports 12 intentional authenticated `SECURITY DEFINER` warnings in total.
- M3 performance advisor findings are informational missing/unused-index and permissive-policy-overlap recommendations. Operational indexes cover the primary school/session/level access paths; remaining indexes should be driven by measured workloads.

## Closed

- M3 Academic Structure & Setup passed the local quality/security gate, remote constraint/RLS/lock denial matrix, GitHub CI, Netlify production deployment and live authenticated academic setup journey. Disposable QA identity and academic records were removed.

- M2 Authorization & Entitlements passed the local quality/security gate, remote schema and denial matrix, GitHub CI, exact-revision Netlify deployment, and live allowed/denied authorization smoke tests. Disposable QA identity and tenant records were removed and baseline entitlements restored.
- M1 Identity & Tenancy passed the local quality gate, remote RLS/invitation checks, GitHub CI, Netlify deployment, and live authentication/onboarding/invitation smoke tests. Disposable QA identities and tenant records were removed.
- Trigger-only `private` schema functions no longer grant direct execution to API roles; their migration intentionally remains handled by PostgreSQL triggers.

- The canonical GitHub repository is populated with the deployable M0 source. Product specifications and agent instruction files were intentionally excluded because the repository is public.
- GitHub Actions run #1 found a clean-environment `LayoutProps` type failure. The root layout now uses an explicit `ReactNode` prop type.
- GitHub Actions run #2 passed the full M0 CI quality job on remote commit `09359d6`.
- GitHub Actions run #3 passed after the Supabase verification records and generated types were published to remote commit `fe7fe57`.
- The Supabase `SchoolFlow` development project is visible and healthy. The M0 migration is applied, private-schema access is denied to `public`, `anon`, and `authenticated`, generated types are synchronized, and database advisors report no findings.
- Netlify visitor SSO is limited to non-production deploys so the production SaaS URL remains public while previews stay protected.
- Netlify production deploy `6aa5a572b311610008ff633a` succeeded from GitHub commit `1087bd3`; `/` and `/api/health` returned HTTP 200 and health reported Supabase as connected.
