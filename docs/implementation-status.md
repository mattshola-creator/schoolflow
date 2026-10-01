# SchoolFlow Implementation Status

Last updated: 30 September 2026

## Current milestone

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
- The current local checkpoint passes zero-warning lint, strict TypeScript and
  247 tests across 54 files. Application publication, full production build,
  advisors and controlled synthetic production acceptance remain before M9
  can be closed.
