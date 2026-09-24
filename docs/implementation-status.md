# SchoolFlow Implementation Status

Last updated: 24 September 2026

## Current milestone

M7 Admissions — Completed — Deployed & Verified

M7.5 UI/UX — In Progress

## Completed milestones

- M0 Bootstrap — Completed — Deployed & Verified
- M1 Identity & Tenancy — Completed — Deployed & Verified
- M2 Authorization & Entitlements — Completed — Deployed & Verified
- M3 Academic Structure & Setup — Completed — Deployed & Verified
- M4 Student & Guardian Core — Completed — Deployed & Verified
- M5 Staff Foundation — Completed — Deployed & Verified
- M6 Shared Services — Completed — Deployed & Verified
- M7 Admissions — Completed — Deployed & Verified

## Implemented

- Production Next.js, Supabase, GitHub CI and Netlify foundation
- Supabase Auth, protected application shell and recovery flows
- Multi-organization and multi-school tenancy with server-validated active context
- Configurable roles, permissions, scoped assignments, plans, entitlements and feature flags
- Academic sessions, periods, class structure, subjects, setup readiness and academic locks
- Student, guardian, enrollment, placement, Student 360 and import-preview foundation
- Staff identity, employment, departments, positions, multi-school assignments and Staff 360
- Atomic staff creation, transfer and employment-exit workflows
- Optional staff-to-existing-user and school-role linkage through the established identity model
- Operation-specific RLS, cross-tenant constraints and least-privilege API grants

## M5 verification

- Formatting, zero-warning lint, strict TypeScript, 40 tests and production build passed
- Production dependency audit reported no known vulnerabilities
- Staff migrations are applied to the connected Supabase development project
- Authorized creation, transfer, exit and staff-linked Person visibility passed
- Non-member, cross-tenant, direct-ID, privilege-escalation and historical-delete denial passed
- The deployed staff register, search, setup and Staff 360 journey passed
- GitHub Actions passed and the final revision was deployed through GitHub to Netlify
- Homepage, login, protected-route behavior and `/api/health` passed after deployment
- Disposable QA Auth and tenant/staff fixtures were removed and their absence verified
- The permanent owner account remained present and was not modified

## M5 migrations

- `staff_foundation`
- `staff_access_and_transfer`
- `harden_staff_privileges`
- `allow_staff_person_visibility`

## Deployment state

The canonical repository is `mattshola-creator/schoolflow`. The production application is deployed at `https://schoolflow-app.netlify.app` from the final M5 main-branch revision. Supabase connectivity is healthy.

The public repository intentionally excludes private product specifications and agent-instruction files.

## Blockers

None for the accepted M7 scope. M7.5 has not started.

## M6 completion evidence

- Shared audit, private documents, Action Center tasks, reusable approvals and in-app notification foundations are implemented.
- `shared_services`, `harden_shared_services` and `optimize_shared_policies` are applied to the Supabase development project.
- The rollback-only database authorization matrix passed for allowed operations, audit immutability, cross-tenant reads and unauthorized inserts.
- Generated database types are synchronized.
- The final local quality gate passed formatting, zero-warning lint, strict TypeScript, 48 tests across 15 files and the production build.
- The production dependency audit reported no known vulnerabilities and the secrets review found no privileged credentials.
- Pull request #12 merged M6 to `main`; GitHub Actions run #37 passed on the exact M6 head revision.
- Netlify deploy preview `6aaefafd7fe898000856a4e8` succeeded for the exact M6 head revision.
- Corrective pull requests #14 and #15 fixed production task deadline precision and optional assignee handling. Their GitHub Actions runs passed and the fixes were deployed before the final shared-services verification.
- Pull request #16 replaced the production-failing multipart Server Action transport with a same-origin upload route while preserving the existing permission, entitlement, RLS, private Storage, validation and audit controls. GitHub Actions run #45 passed.
- Netlify production deploy `6ab193383c4c3e0008593f7c` succeeded from merge revision `5a91fdf75ea27459b75e169d0728238d29407196`; its enhanced secret scan reported zero matches.
- `/api/health` returned `ok` with Supabase connected after the final deployment.
- Authenticated production verification passed login, protected dashboard, active organization/school context, task creation/assignment fields/deadline/status, approval policy/request/decision, recipient notification, document upload/download and protected audit history.
- The private `schoolflow-documents` bucket remained non-public, enforced the 10 MiB/MIME allowlist and retained permission-scoped SELECT/INSERT/DELETE policies.
- The remote authorization matrix passed authorized operations, audit immutability, outsider and cross-tenant denial, direct-ID denial and entitlement/feature restrictions.
- Both uploaded QA objects produced document insert/finalization audit events, and the authorized signed-download path worked in production.
- Disposable QA Auth identity, organization, school, records and Storage objects were deleted; follow-up checks returned zero for every QA target. The permanent owner Auth identity remained present and unchanged.

## M6 migrations

- `shared_services`
- `harden_shared_services`
- `optimize_shared_policies`

## M7 readiness

Yes. M6 has no unresolved Critical or High blocker and is formally recorded as Completed — Deployed & Verified.

## M7 progress

- The approved M7 scope is applications, manual entrance assessments and retakes, decisions, offers and controlled enrollment conversion.
- The admissions schema, caller-bound mutation functions, school-scoped RLS, authorization/entitlement integration, generated types and application UI are implemented.
- `admissions`, `fix_admission_assessment_transition`, `fix_admission_offer_response` and `optimize_admissions_indexes` are applied to the Supabase development project.
- A rollback-only remote lifecycle and denial matrix passed, including two assessment attempts, Person reuse during conversion, outsider invisibility and API deletion denial.
- The local combined gate passed formatting, zero-warning lint, strict TypeScript, 52 tests across 16 files and the production build. The production dependency audit found no known vulnerabilities and the credential-shaped secret scan found no matches.
- Pull request #18 passed GitHub Actions run #49 and merged as application revision `d49335dac20a31a435aad6538f301026f5cdc6ef`.
- Netlify production deploy `6ab20bc11ce6210008c0ac41` is ready for that exact revision; enhanced secret scanning reported zero matches.
- Live `/api/health` returned `ok` with Supabase connected, and unauthenticated `/admissions` redirected safely to login.
- Subsequent focused pull requests corrected the admissions detail relationship load, offer-response transport, checklist transport, document-review workflow, conversion transport/proxy-origin handling and protected conversion diagnostics without weakening the approved business rules.
- Authenticated production verification passed application creation and retrieval, decision and offer acceptance, evidence-gated checklist completion, two-document private evidence review, final placement and controlled conversion.
- Two QA applications converted successfully. Each retained exactly one student profile, active enrollment, class membership and guardian relationship, reused the applicant Person, and preserved its offer, document and checklist history.
- The second conversion submitted once through the production form and the browser reached the correct new Student 360 route. Focused route tests independently assert the successful HTTP 303 response and destination.
- Authorization, cross-tenant denial, origin enforcement, duplicate protection, atomicity, audit history and private Storage restrictions remain verified through the remote matrix, focused tests and production evidence.
- PR #32 merged as revision `5d1160b61fdf169fa55895a68162a31d3a973048`; GitHub Actions run #77 passed 97 tests across 23 files and the production build.
- Netlify production deploy `6ab4ff7754d09810470c17a8` is Ready and the temporary conversion-context diagnostic probe is disabled.
- Desktop and real-phone production smoke tests found the M7 journey functional with no workflow dead ends. Horizontal overflow, clipped navigation/text, typography/contrast and dense mobile stacking are explicitly deferred to M7.5.
- The authorized QA account was signed out. Both converted QA fixtures are preserved for separately approved cleanup, and the permanent owner account remains untouched.

## M7 completion

M7 Admissions is formally accepted as Completed — Deployed & Verified. The
accepted milestone covers applications, manual entrance assessments and
retakes, decisions, offers, enrollment-readiness evidence and controlled
applicant-to-student conversion. Parent self-service intake and controlled
application imports described in the broader PRD are not represented as M7
deliverables by ADR-0008 or the approved M7 implementation matrix.

## M7.5 progress

- Phase A replaced the clipped mobile module strip with an accessible drawer
  while retaining a permission-filtered desktop sidebar. PR #34 merged as
  revision `a0092e3c78aa40b95564b87cd37787d0ba3c9948`, GitHub Actions run #81
  passed, and Netlify deploy `6ab574a671d9b50008854c35` is Ready. Authenticated
  desktop checks and real-phone verification passed.
- Phase B establishes semantic design tokens, stronger secondary typography,
  consistent focus behavior and the first shared button, page-header and
  status primitives. Adoption is intentionally limited to representative
  public, dashboard and admissions-register surfaces in this focused phase.
- Remaining work includes module-page overflow and long-text handling, dense
  checklist/document stacking, broader component adoption, accessibility and
  responsive regression coverage, and prevention of floating status badges
  obscuring actionable content.
