# SchoolFlow Implementation Status

Last updated: 1 October 2026

## Product Experience 2.0 — PX1 production closeout

PX1 Design System & Application Shell is **Completed — Deployed — Accepted
with Documented Limitations**. PR #91 merged at
`bf9d1c873c7db7abfb9f30fb1f8035aa9c094a93`; Netlify production deploy
`6ac895f191b4a60008569588` is Ready at that exact revision and its enhanced
secret scan inspected 373 files with zero matches.

The final read-only production smoke test verified secure login, session
persistence, logout, protected-route redirection, password-recovery navigation,
desktop workspace navigation, keyboard entry order, the Organization → School →
Session → Term Context Ribbon, permission-aware navigation, entitlement-aware
unavailable states, Student 360 and the available Admissions, Staff, Academic
Setup, Documents, Communication, Administration, Action Center and Audit
surfaces. Direct Attendance, Teaching, Finance and Assessment routes returned
their intended safe unavailable states under the active organization's disabled
features. `/api/health` returned `ok` with Supabase connected.

The accepted mobile implementation retains founder visual acceptance and
automated coverage at 320, 375 and 390 CSS pixels. The final production browser
smoke test did not independently repeat live mobile resizing because its cloud
browser exposed a fixed desktop viewport. Multi-school switching was also not
exercised because the authenticated acceptance context exposed one school. The
browser displayed `test@schoolflow.com`; the permanent founder-owner identity
was not independently established by that test. Direct Netlify runtime-log
querying was unavailable, although deployment/function state was healthy and no
SchoolFlow-origin browser warning or error was observed.

The approved residual-risk exception for development-only `braces@3.0.3`
(`GHSA-vfj7-8cjw-p6xm`) remains documented and visible. The package is absent
from the production dependency graph and the dependency audit is not
suppressed.

M13 Hardening & Pilot remains open for credentialed backup/storage evidence,
off-site retention, non-production restoration, representative human UAT and
multi-school context verification. PX1 closeout does not satisfy those gates.

## Product Experience 2.0 — PX2 prototype

Prototype Pack A is implemented on `feat/px2-public-saas-hub` in draft PR #93
and remains isolated from production pending founder visual review. The public
prototype covers the homepage, product, solutions, modules, non-binding plan
comparison, synthetic tour entry, security/trust, support placeholders and a
non-persistent onboarding walkthrough.

Platform Super Admin remains separate from Organization Owner. No platform
console, credentials, impersonation, live demo tenant, Supabase change,
entitlement change or operational-module migration is included. The local gate
passed formatting, zero-warning lint, strict TypeScript, 316 tests across 71
files and the optimized production build.

Netlify reports the PR preview Ready at the exact PR revision and protects all
non-production deploys with team SSO. GitHub CI retains one expected non-zero
audit result for the founder-approved, unsuppressed development-only `braces`
advisory (GHSA-vfj7-8cjw-p6xm). PX2 introduces no dependency change and does
not broaden that exception. PX2 must not merge, and PX3/Prototype Packs B–E
must not begin, before explicit founder approval.

Founder refinement is implemented on the same draft PR. The confirmed public
mobile-menu gap is replaced with an accessible viewport-height drawer with
independent scrolling, body scroll locking, focus containment/restoration,
Escape and backdrop dismissal, active-route indication and 44px controls.
Public copy, hero density, module explanations, guided-tour roles, plan cards
and the non-persistent onboarding walkthrough are refined for customer clarity
and small screens. The reported repeated authenticated navigation entries were
not reproduced: PX2 does not change the accepted PX1 drawer, its source renders
one navigation tree, and regression coverage asserts each authorized and
unavailable entry appears exactly once at a short mobile viewport. PR #93
remains draft and unmerged pending founder acceptance.

## Current milestone

M10 Assessment & Results — Completed — Deployed & Production-Verified. PRs #75 and #76 culminated in runtime revision `e5e2e46cfc774ebafcd534f43cef00dd79f871cd`; Netlify deploy `6abe8c384b3c27000714e977` is Ready. Synthetic lifecycle, denial controls, audit evidence and safe-state restoration passed. See `docs/testing/m10-assessment-results-matrix.md`.

M7 Admissions — Completed — Deployed & Verified

M7.5 UI/UX — Completed — Deployed & Verified

M8 Attendance & Teaching — M8-E6 Standalone Homework Workflow In Progress

## Completed milestones

- M0 Bootstrap — Completed — Deployed & Verified
- M1 Identity & Tenancy — Completed — Deployed & Verified
- M2 Authorization & Entitlements — Completed — Deployed & Verified
- M3 Academic Structure & Setup — Completed — Deployed & Verified
- M4 Student & Guardian Core — Completed — Deployed & Verified
- M5 Staff Foundation — Completed — Deployed & Verified
- M6 Shared Services — Completed — Deployed & Verified
- M7 Admissions — Completed — Deployed & Verified
- M7.5 UI/UX — Completed — Deployed & Verified
- M8 Attendance & Teaching — Completed — Deployed & Production-Verified
- M9 Finance — Completed — Deployed & Production-Verified
- M10 Assessment & Results — Completed — Deployed & Production-Verified

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

None for the accepted M7 or M7.5 scope.

M8 student attendance now includes the protected school policy, atomic complete
register submission, read-only submitted state and controlled immutable
corrections. One authorized production QA register with two entries and one
Present-to-Late correction passed persisted-state and audit verification. The
temporary QA feature override was disabled afterward and the QA account was
signed out. Timetable, curriculum, lesson delivery and homework have not
started. M8-B1 added the disabled-by-default staff clock event, daily summary
and immutable correction foundation. M8-B2 added the protected working-hours
setup and responsive clock experience. One authorized production QA cycle
created one working-hours policy, one staff attendance day and two clock events
with zero corrections; school-scoped audit records were verified. The
temporary `attendance.staff_clock` override was disabled again, the QA session
was signed out and the synthetic evidence remains preserved. M8-B3's
separately authorized correction view and form are deployed through PR #58,
revision `7ea3ff3a85705272abcc52e17d001445f569a6d8`, with the feature still
disabled. M8-B4 now adds the disabled-by-default Staff/HR leave and permission
foundation, caller-bound submission and shared approval linkage. The follow-up
workspace reuses the school's location-level IANA timezone, validates timezone
changes, converts local civil times inside Postgres and adds protected leave,
permission and leave-type forms. PR #60 is deployed at revision
`45ea3bb1ac574058936a0609c077e5f39103de1c`; no leave type or request has been
created and the feature remains disabled.

M8-B5 integrates approved Staff/HR time-off into the caller-bound staff clock
workspace without copying or mutating business records. Full scheduled-policy
coverage in the school's configured timezone is treated as excused and
suppresses clock actions; partial permissions remain visible without excusing
the whole day. Both production features remain disabled and no production
request or attendance activity is created by this slice.

M8-B6 adds a caller-bound daily summary and explicit, idempotent generation of
missing-clock Action Center tasks after the effective working day ends.
Approved full-day time off and non-teaching calendar dates suppress false
exceptions. Later valid evidence resolves the exception and completes its
still-open task while preserving audit history. Summary access and task
generation remain separately permissioned, and the production feature remains
disabled.

M8-E1 exposes the existing effective-dated teaching-assignment foundation
through a protected responsive workspace. Class-teacher and subject-teacher
responsibilities remain distinct, assignment lifecycle is non-destructive, and
all queries and writes retain exact active-school scope. Timetable, curriculum,
lesson delivery and homework remain separate later slices; the production
teaching feature remains disabled.

M8-E2 adds protected manual timetable allocation with conflict review. M8-E3
adds ordered curriculum coverage. M8-E4 establishes separate lesson-plan and
lesson-delivery records, while M8-E5 exposes their protected responsive
workspace. M8-E6 adds standalone homework assignments with explicit draft,
publish, close and cancel lifecycle, optional curriculum and lesson-delivery
links, and server-derived teaching scope. Learner/guardian access, submission,
grading and messaging are not introduced. The production teaching feature
remains disabled and all curriculum, lesson and homework tables remain empty.

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
- Phase C1 remediates the Admissions detail and Student 360 mobile surfaces:
  detail grids stack at narrow widths, checklist and offer controls reflow,
  and long application, student, evidence and record identifiers wrap without
  requiring page-level horizontal scrolling. Workflow behavior is unchanged.
- Phase C2 remediates the Student and Staff registers with responsive header
  actions and search controls, safe long-identifier wrapping and mobile-safe
  record and pagination rows. Directory query behavior is unchanged.
- Phase C3 remediates Staff 360 with mobile-safe profile details, employment
  and assignment history rows, long contact/qualification text and accessible
  administrative form actions. Staff workflow behavior is unchanged.
- Phase C4 remediates Staff setup and creation with responsive shared headers,
  cards and buttons, overflow-safe form controls and setup rows, and a larger
  accessible teaching-position checkbox target. Staff mutations are unchanged.
- Phase C5 remediates Student creation and import preview with responsive shared
  headers and actions, overflow-safe form controls and checkbox targets, and a
  mobile card presentation for preview rows. Student and import behavior is
  unchanged.
- The approved C5 follow-up requires a Female/Male gender selection and a
  complete primary guardian when staff create a student directly. The form,
  server schema and atomic creation RPC enforce the same rule; financial
  responsibility remains optional.
- Phase C6 remediates Admissions application creation and document-policy
  setup with responsive shared headers and actions, overflow-safe fieldsets and
  labels, and larger policy checkbox targets. Admissions workflows and policy
  versioning were unchanged by that presentation-only phase. Real-phone
  verification passed both surfaces.
- The approved C6 follow-up aligns Admissions application intake with direct
  student creation: gender is a required Female/Male selection and a primary
  guardian's first name, last name and relationship are mandatory. The form,
  server schema and atomic application-creation RPC enforce the same rule;
  existing applications are unchanged.
- Phase C7 remediates Academic Setup with the shared page header and button
  primitives, mobile-stacking date and code controls, wrapping setup rows,
  larger checkbox/deactivation targets and responsive lock actions. Academic
  permissions, validation and mutation behavior are unchanged.
- Phase C8 remediates the shared Action Center, Documents and Audit surfaces:
  operational controls stack safely on phones, long task/document content
  wraps, file controls remain within the viewport, and Audit uses mobile cards
  while retaining its desktop table. Shared-service actions, authorization,
  private Storage and append-only audit behavior are unchanged.
- Phase C9 aligns Onboarding, Accept Invitation and module Capability states
  with the shared page-header and button system, responsive panel spacing,
  mobile-width actions and safe long-message wrapping. Atomic onboarding,
  email-bound invitation validation and server-side capability evaluation are
  unchanged.
- Phase C10 adds keyboard skip navigation, correct shared landmarks, accessible
  names for focused shared-service controls, screen-reader announcement
  semantics and a reduced-motion fallback while retaining the mobile drawer's
  focus trap, Escape handling and focus return. PR #47 merged as revision
  `a8aa342f301bca9800d64e001f178c09b73e0d0b`; GitHub Actions run #107 passed
  131 tests and the production build; Netlify deploy
  `6aba3972b32a3e0008c97a3d` is Ready with zero secret-scan matches.
- C1 through C10 passed real-phone or keyboard acceptance. The full evidence is
  recorded in `docs/testing/m75-ui-ux-matrix.md`.

## M7.5 completion

M7.5 UI/UX is formally accepted as Completed — Deployed & Verified. The
accepted milestone covers the responsive authenticated shell, shared visual
foundation, focused operational module layouts, mobile-safe forms and records,
and cross-cutting accessibility interactions. It preserves the established
tenancy, authorization, entitlement, Storage, audit and mutation boundaries.

The floating Netlify status badge is hosting-platform UI outside the
SchoolFlow source. Approved tenant branding or Experience Studio work and M8
remain separate milestones and were not started during M7.5.

## M9 progress

- M8 is closed at production revision `d8419ec90ae125eed5bb89ae5141adfe2612747d`;
  its accepted evidence and disabled feature state remain untouched.
- M9-A Finance Foundation is implemented in branch
  `feat/m9-finance-foundation`: six feature gates, granular Finance
  permissions, school settings, fee and student categories, effective-dated
  fee structures/items, exact `numeric(14,2)` money, audit triggers, RLS and a
  responsive `/finance` setup workspace.
- Supabase migrations `m9_finance` and `m9_fee_structure_rpc` are applied.
  The latter keeps structure-plus-first-item creation atomic and supplies the
  controlled activation boundary.
- RLS is enabled on all five M9-A tables with scoped policies. Advisors show
  the established intentional caller-bound `SECURITY DEFINER` warning class
  and unused-new-index observations; no missing-RLS or new critical finding.
- PR #71 merged M9-A as revision
  `734f52706bebfb2f778c1379be06abc79bad3c51`; GitHub Actions run #161 passed
  and Netlify production deploy `6abd30cb945a2192b09f3236` is Ready.
- M9-B through M9-H are implemented locally: idempotent student billing and
  immutable charge snapshots; manual payment recording and independent
  verification; transactional allocation and derived balances; immutable
  receipts; controlled payment reversals; expense approval, evidence-backed
  payout and completion; cashier close and cash handover; manual
  reconciliation; other-income capture; and school-scoped Finance reports.
- Supabase migrations `m9_student_billing`,
  `m9_payments_allocations_receipts`, `m9_expenses_cashier_reporting`,
  `m9_finance_hardening` and `m9_finance_corrections_completion` are applied.
  The completion migration was first rehearsed inside a rollback-only
  transaction and then applied successfully.
- PR #72 passed GitHub Actions run #163 and merged as revision
  `7caead2fe9b7da1404bee1924a0526509c01dd51`. Netlify production deploy
  `6abe3fff67649b00084a8d8d` is Ready for that exact revision with no secret
  scan matches.
- Controlled production acceptance used a dedicated synthetic Finance tenant,
  school, learner and two QA actors. Billing idempotency, verification
  segregation, allocation, receipt, reversal/balance restoration, full
  settlement, expense completion with evidence, cashier close/handover,
  reconciliation, other income, reports, audit evidence and cross-tenant
  denial passed.
- Production acceptance found PostgreSQL CASE enum coercion in payment,
  expense and reconciliation transitions. Additive migration
  `m9_finance_enum_status_fixes` was rollback-rehearsed and applied; the full
  acceptance lifecycle then passed. All six temporary Finance feature flags
  are disabled again. No authenticated browser QA session was created, and the
  permanent owner plus M7/M8 evidence remain untouched.
- PR #73 passed GitHub Actions run #165 and merged the enum correction and
  final acceptance evidence as revision
  `665f668e8da8a48ab0a24b5f7b2805a7a93a384a`. Netlify production deploy
  `6abe43bdde3f2d000866171c` is Ready for that exact revision with no secret
  scan matches.
- The final gate passes formatting, zero-warning lint, strict TypeScript, 248
  tests across 55 files, production build, dependency audit and secret scan.
  M9 Finance is Completed — Deployed & Production-Verified. M10 has not
  started and requires separate authorization.

# M11 — Parent / Student / Communication (completed)

M11-A through M11-J are Completed — Deployed — Production-Verified. The
milestone delivers relationship/self-scoped portal identities, guardian and
student experiences, immutable published-result consumption, learner-scoped
attendance and Finance summaries, targeted notices, controlled participant
messaging, idempotent in-app notifications, private document-link protection,
preferences, five feature gates, granular permissions, audit evidence and RLS.

PRs #78–#82 delivered the implementation and four additive production
corrections found by controlled QA: notification enum coercion, one-learner
result projection, caller-bound notice/thread policy predicates and notice
read-state authorization. All five migrations are applied after rollback
rehearsal. The final gate passes 266 tests across 59 files, formatting,
zero-warning lint, strict TypeScript, production build, dependency audit and
secret scan. Synthetic evidence remains preserved, all five M11 overrides are
disabled, synthetic sessions are zero, the owner and M7–M10 evidence are
untouched, and M12 has not started. See
`docs/testing/m11-parent-student-communication-matrix.md`.

# M12 — Management & Reporting (completed)

M12-A through M12-J are Completed — Deployed — Production-Verified. The
milestone composes existing M3–M11 sources through caller-bound, per-school
authorized aggregates; it introduces no shadow operational store. It includes
the management dashboard, safe multi-school scope, standard student,
admissions, attendance, staff, teaching, exact-decimal Finance,
published-result, promotion, communication and operational summaries,
permission-aware global search, server-reauthorized CSV/browser print, and
audited academic close/rollover.

Migration `m12_management_reporting` passed rollback rehearsal and is applied
to production as version `20261001231631`. PR #84 passed GitHub Actions run
#190 and merged as `9bb9fdf59d3ebb6094b23438363ec0c9941b882b`.
Netlify deploy `6abf3f247b0ea90008aead07` is Ready on that exact revision.

Controlled production acceptance verified single- and authorized multi-school
scope, zero School C aggregate leakage, cross-tenant/unauthorized denial,
deterministic known-fixture KPIs, exact decimal Finance values, published-only
result aggregation, scoped search/export auditing, academic locks and
idempotent session rollover. The production A+B aggregate completed in 83.198
ms from cache without disk reads. All five M12 overrides are disabled again;
M9–M11 overrides remain disabled; the synthetic actor has zero sessions; the
permanent owner and M7–M11 evidence remain untouched.

The final gate passes formatting, zero-warning lint, strict TypeScript, 276
tests across 62 files, production build, dependency audit and secret scan.
Supabase advisors show established intentional caller-bound SECURITY DEFINER,
policy-performance and unused-index warnings, with no new M12-blocking
critical/error finding. See `docs/testing/m12-management-reporting-matrix.md`.

# M13 — Hardening & Pilot (in progress)

M13 technical hardening is implemented under feature freeze. The production
catalog review found no exposed API table without RLS, and all 119
SECURITY DEFINER functions have fixed search paths with zero anonymous/PUBLIC
execution. The private document bucket, feature gates, audit metadata, major
domain integrity checks and zero-QA-session safety state pass review.

Two moderate development-only dependency advisories were eliminated; the
audit now reports zero known vulnerabilities. CI now enforces high/critical
dependency and tracked-secret checks, and production headers add HSTS, COOP
and DNS-prefetch controls. The quality gate passes 280 tests across 63 files,
formatting, zero-warning lint, strict TypeScript and the production build.

Two verified M8 lesson migrations were present in production schema but absent
from migration bookkeeping. After confirming tables, RLS, policies, triggers,
functions and 30 indexes, M13 repaired only those ledger entries; no schema or
business data was reapplied.

PRs #86–#88 passed GitHub Actions through run #198 and merged the technical
hardening, live header correction, and credential-safe Free-tier backup
tooling. Netlify deploy `6abf77fe42116100084276fa` is Ready for exact merge
revision `520e5ed92c54cdbfc14f485262cc2ff813a385ac`; its secret scan checked 342
files with zero matches. Production health is `ok` with Supabase connected.

The owner approved remaining on Supabase Free for the controlled pilot. The
repository now provides separate logical database and private Storage export
commands, while the protected recovery runbook specifies encrypted off-site
storage, 14 daily/8 weekly/12 monthly retention, checksum verification, a
disposable-target restore drill, and clear Free-plan/PITR limitations. The role
UAT package is prepared and approved for scheduling.

M13 cannot yet be marked complete or pilot-ready: the first credentialed
production export and non-production restore rehearsal must be executed and
recorded by an authorized operator, and representative humans must complete
and sign the UAT package. No human signoff or recovery evidence has been
fabricated. See the M13 matrix, risk register and protected runbooks.

## M13 owner access and navigation verification

A read-only production review confirmed the permanent owner's organization has
an active organization-wide owner role, all-school scope, 116 effective
permissions, a trialing Starter plan and all nine modules entitled. Finance,
Teaching, Attendance, Assessment and Management were missing because their
controlled-rollout feature defaults are disabled and the organization has no
overrides—not because of a missing owner permission or paid-plan denial.

PR #89 corrected the pilot-blocking discoverability defect without enabling a
feature or weakening authorization. Desktop/mobile navigation is now grouped,
feature-gated modules are shown as unavailable with a reason, the dashboard
provides authorized module entry points, and `/administration` provides a
read-only active-context/access overview. CI run #200 passed 283 tests across
64 files. Merge `ec025f147fefd04da82f05413fd57e2df285fa98` is deployed as
Netlify `6abfbfaa6659fa0009936803`, Ready, with zero secret-scan matches and
healthy Supabase connectivity.

No permanent-owner authentication state changed. The owner approved the full
controlled-pilot set, and 19 organization-scoped feature overrides were
enabled for Alpha and Omega only. This activates Attendance, Teaching,
Finance, Assessment & Results, and Management & Reporting without changing the
Starter plan, module entitlements, roles, permissions, RLS, or another
organization's configuration. Representative human UAT may proceed after the
owner refreshes production and confirms the corrected navigation. M13 remains
open pending the credentialed backup/restore drill and signed human UAT.
Complete role/membership/organization/management-group/platform
administration mutation screens remain documented UI gaps; entitlement and
feature writes intentionally remain unavailable to ordinary authenticated
users.

## Product Experience 2.0 — PX0 baseline

Product Experience 2.0 is an approved modernization program separate from the
M0–M13 roadmap; it is not M14 and does not replace the validated domain,
tenancy, authorization, RLS, entitlement, audit or business architecture.

PX0 inspected the application at local durable revision
`b4e8b942397e4f8449e942533b9b06d3013be7cd`. The inspection covered public and
authenticated routes, shell/navigation, design tokens/components, every major
operational module, family access, reporting, operator boundaries and branding.
It produced the authoritative Product Experience 2.0 specification, current UX
inventory, route map, five-pack prototype plan, synthetic demo/training design
and PX0–PX10 migration plan. No application code, production schema, feature
state, account, credential, fixture or business data changed.

PX0 confirms that existing server services and security contracts should be
reused while page composition, role focus, administration coverage, family
experience, public commercial presentation and platform operations require
substantial presentation work. PX1 is not authorized by PX0 and must not begin
without explicit founder approval.

## Product Experience 2.0 — PX1 reference implementation

PX1 was subsequently authorized as a bounded Design System and Application
Shell reference. Branch `feat/px1-design-system-shell` introduces semantic
tokens, shared primitives, the work-oriented navigation hierarchy, a
collapsible desktop sidebar, accessible mobile drawer, shell utilities, and a
server-derived Organization → School → Session → Term Context Ribbon. The
existing authorization evaluator, tenant context switch, routes and domain
services remain authoritative.

`/px1-reference` provides a synthetic-only visual review surface, while
`/experience-preview` exercises the same patterns inside the authenticated
shell. No migration, production data, account, permission, entitlement or
feature flag changes are part of PX1. The implementation must remain unmerged
until founder visual acceptance; PX2 is not started.

The founder formally accepted PX1 revision
`6eac996685104784cca8e18df26c3ea7ecc5d41f`, including the compact Context
Ribbon, responsive learner presentation and final viewport-height mobile
navigation correction. The accepted application revision remains in PR #91's
history; subsequent PX1 changes are limited to this acceptance record. PR #91
remains draft and unmerged while the independent M13 dependency security gate
is resolved. PX2 has not started.

The release assessment identified patchable production-path advisories in
Next.js 16.3.6, Sharp 0.35.4 and source-map-js 1.2.1, plus one development-only
`braces` 3.0.3 advisory for which no patched npm release is published. Focused
M13 PR #92 upgrades/pins the patchable dependencies and leaves the residual
finding visible. PR #91 must not merge until PR #92 is resolved first, PX1 is
updated onto hardened `main`, and its full gate is rerun.

M13 remains open. The credentialed production database/Storage backup,
encrypted off-site copy, disposable non-production restore verification and
representative human UAT/signoff remain mandatory and are not replaced by PX0.
