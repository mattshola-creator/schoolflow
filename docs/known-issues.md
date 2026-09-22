# Known Issues

## Open

- A historical Auth identity named `M1 Live QA` remains in the development project even though the M1 record says disposable identities were removed. It was not part of the authorized M6 cleanup and has no identified M6 tenant access. Confirm its ownership before any later deletion.
- Local Git transport remains unauthenticated. GitHub publication and verification currently use the authenticated connector, whose remote commit SHAs differ from the equivalent local checkpoint SHAs.
- Docker is unavailable in the current execution environment. This does not block M0 because the development-project migration, access restrictions, advisors and application connectivity were verified remotely.
- Supabase security advisor reports intentional warnings for authenticated `SECURITY DEFINER` functions. Each has a fixed empty search path, explicit authenticated grant, revoked anonymous/public execution and caller/scope validation.
- Supabase performance advisor reports informational missing-index, unused-index and permissive-policy overlap findings. These should be revisited against measured workloads.
- Supabase Auth leaked-password protection is disabled. This is a non-blocking hardening recommendation for the development project and should be enabled before production launch.
- M2 adds one intentional caller-bound `SECURITY DEFINER` inspection RPC. It has a fixed empty search path, accepts no target-user identifier, validates the authenticated caller and requested tenant/school context, and is executable only by `authenticated`, `service_role` and `postgres`.
- M3 adds restricted caller-bound entitlement helpers and atomic academic RPCs. They have fixed empty search paths, derive the caller from `auth.uid()`, validate membership, school scope, permission, entitlement and feature state, and expose no target-user inspection surface. The security advisor therefore reports 12 intentional authenticated `SECURITY DEFINER` warnings in total.
- M3 performance advisor findings are informational missing/unused-index and permissive-policy-overlap recommendations. Operational indexes cover the primary school/session/level access paths; remaining indexes should be driven by measured workloads.
- M4 adds four intentional caller-bound `SECURITY DEFINER` functions for student capability evaluation, row visibility, atomic record creation and atomic import preview. They use fixed empty search paths, derive identity from `auth.uid()`, validate school scope through M1/M2 controls, and revoke anonymous/public execution.
- M4 performance advisor findings remain informational foreign-key/index and permissive-policy observations. Operational indexes cover student register, student history, guardian history and import preview access paths; further indexes require measured workloads.
- M5 adds five intentional caller-bound `SECURITY DEFINER` functions for staff capability/visibility, atomic creation, privacy-limited access candidates, transfer and exit. They use fixed empty search paths, derive identity from `auth.uid()`, validate both source and destination scope where applicable, and revoke anonymous/public execution.
- M5 performance advisor findings are informational missing/unused-index recommendations. Register, employment-status and assignment-history access paths have operational indexes; further indexing should follow measured workloads.
- M6 adds four intentional caller-bound `SECURITY DEFINER` functions for shared capability evaluation, atomic approval policy/request creation and role-scoped decisions. They have fixed empty search paths, derive the caller from `auth.uid()`, validate membership, school scope, permission, entitlement and feature state, and revoke anonymous/public execution.
- M6 performance advisor findings are informational index/policy observations. The M6 init-plan findings were corrected and operational audit, document, task, approval and notification indexes are present; further optimization should follow measured workloads.

## Closed

- M6 Shared Services passed its complete production gate. GitHub Actions run #45 passed, Netlify deploy `6ab193383c4c3e0008593f7c` published revision `5a91fdf75ea27459b75e169d0728238d29407196`, `/api/health` reported Supabase connected, and authenticated Action Center, approvals, notifications, private document upload/download and audit-history checks passed. Cross-tenant/direct-ID/privilege denial remained verified, all M6 QA data and Storage objects were removed, and the permanent owner account remained intact.

- Production verification exposed three transport/validation defects that were corrected without weakening controls: minute-precision task deadlines, an omitted optional task assignee, and multipart document upload through a Next.js Server Action on Netlify. The final upload uses a same-origin route and retains the established server authorization, RLS, private Storage, validation and audit controls.

- The Netlify extension-fetch 403 and later build-credit skip no longer block M6. Subsequent production deploys completed successfully on the existing site.

- Final M5 live verification found that staff-profile RLS did not also disclose the linked shared Person row. `people_select_staff` now delegates to the caller-bound `can_view_staff` evaluator; the staff register and Staff 360 render for authorized users while an outsider remains denied.

- M5 verification found and removed broad project-default API table privileges. Staff tables now explicitly grant only required SELECT/INSERT and column-level UPDATE operations; `anon` has no access and historical DELETE/TRUNCATE is unavailable.

- M4 Student & Guardian Core passed its authenticated production journey: confirmed QA login, active tenant/school context, student register, atomic student/guardian/enrollment/placement creation, Student 360, search, duplicate-aware import preview, logout and cross-tenant direct-ID denial. All disposable Auth and tenant records were removed; the permanent owner was untouched.

- The permanent owner password-recovery flow no longer falls back to localhost. Hosted Supabase Auth uses the production Site URL and approved callback, Netlify has an explicit production site URL, expired links return a useful recovery state, and the owner verified password setup, login, dashboard and academic access, logout, and repeat login without sharing the password.

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
