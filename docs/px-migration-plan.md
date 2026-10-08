# SchoolFlow Product Experience 2.0 migration plan

## Program rules

- This is a modernization of the existing application, not a clean rewrite and
  not M14.
- M0–M13 business/security architecture remains authoritative.
- Every phase has a bounded branch/checkpoint and rollback path.
- Founder visual acceptance gates broad operational migration.
- No production personal data is used for prototypes or demos.
- Design changes never replace server authorization, RLS, entitlements,
  feature gates, audit controls, Finance integrity or result integrity.

## PX0 — Experience Specification & Baseline

**Objective:** establish PX authority, inspect implementation, classify scope
and create durable plans.

**Scope:** specification; UX inventory; route/experience map; role map; design
baseline; prototype packs; demo design; platform/branding boundaries; migration
plan.

**Dependencies:** approved Product Experience 2.0 direction, current repository,
M0–M13 evidence.

**Code areas:** documentation only.

**Tests/checks:** documentation format, link/path consistency, clean diff
showing no application/schema change.

**Deployment:** no production deployment required for documentation-only work.

**Founder gate:** authorize PX1 and resolve listed commercial/platform choices.

**Rollback:** revert documentation commit.

**Evidence:** all PX0 files, inspected revision and closeout report.

## PX1 — Design System & Application Shell

**Objective:** create the reusable visual/interaction foundation before page
migration.

**Scope:** semantic tokens, type/spacing/elevation, core components, responsive
shell, Context Ribbon, navigation behavior, profile/help/notification/search
entry points, shared loading/empty/error/access states.

**Dependencies:** PX0, accessibility targets, founder direction on brand tone,
scope semantics for organization/school/session/term.

**Expected code areas:** `globals.css`, `src/components/ui`, shell/navigation,
new design-system tests and reference route isolated from operational pages.

**Tests:** component semantics, keyboard/focus, mobile drawer, access-state
mapping, high zoom, reduced motion, token contrast, visual regression baseline.

**Deployment:** preview deployment first; production only after regression and
explicit PX1 acceptance. Use feature-isolated reference where practical.

**Founder gate:** approve shell direction and Design System v2 reference.

**Rollback:** preserve current shell/component path until accepted; revert PX1
release without database rollback.

**Evidence:** token reference, Story/reference surface, screenshots across
breakpoints, tests, CI/deploy revision.

## PX2 — Prototype Pack A

**Objective:** deliver the public commercial reference experience.

**Scope:** homepage, product/modules/solutions, plan presentation, demo entry,
authentication and onboarding entry.

**Dependencies:** PX1, approved public content, commercial plan/pricing
decisions, synthetic previews.

**Expected code areas:** public App Router routes, marketing components, auth
presentation; existing auth actions retained.

**Tests:** navigation, forms/auth regression, metadata/SEO basics,
accessibility, responsive/performance, no private-data exposure.

**Deployment:** preview URL for founder review; bounded production release only
after approval.

**Founder gate:** Pack A visual/content acceptance.

**Rollback:** revert public presentation routes; Auth contracts unchanged.

**Evidence:** Pack A matrix, device captures, performance/accessibility results.

## PX3 — Prototype Pack B

**Objective:** validate the operational design language against SchoolFlow's
most complex staff workflows.

**Scope:** owner/school Home, My Day, Action Center, Administration, Students,
Student 360, Admissions, My Teaching, Attendance, Finance and Assessment.

**Dependencies:** PX1; deterministic synthetic prototype data; existing M3–M10
services; role matrix.

**Expected code areas:** shared register/360/workflow/KPI/filter patterns and a
bounded set of representative operational routes.

**Tests:** authorization/entitlement parity, workflow mutation regression,
mobile/tablet teaching and attendance, exact Finance, assessment server
authority, accessibility and visual regression.

**Deployment:** preview/controlled feature branch; avoid parallel production UI
maintenance beyond the approval window.

**Founder gate:** Pack B visual and workflow acceptance.

**Rollback:** route-level switch/revert to existing presentation; no business
schema changes unless separately justified and rehearsed.

**Evidence:** role walkthroughs, state coverage, regression and device results.

## PX4 — Prototype Packs C–E

**Objective:** validate family, platform and cross-system reference experiences.

**Scope:** Pack C parent/student; Pack D Platform Console/Tenant 360/catalog and
rollout; Pack E Branding Studio concept, command/search, notifications/help,
states and design-system reference.

**Dependencies:** PX1–PX3 patterns; explicit platform operator authorization
design; relationship-safe synthetic data; branding inheritance contract.

**Expected code areas:** isolated prototype routes/components and only the
minimum backend contracts approved for interactive validation.

**Tests:** guardian relationship/student self denial, platform-vs-owner denial,
tenant isolation, branding contrast/inheritance, search scope, responsive and
accessibility coverage.

**Deployment:** private/controlled previews; Platform and demo authority must
not be exposed in production by prototype convenience.

**Founder gate:** Pack C, D and E acceptance.

**Rollback:** remove isolated prototype routes/contracts; retain existing M11
portal and operator mechanisms.

**Evidence:** three pack matrices, threat-model/security tests, visual review.

## PX5 — Founder Visual Acceptance

**Objective:** freeze the approved experience direction before mass migration.

**Scope:** review all five packs, cross-pack consistency, responsive behavior,
accessibility, product/commercial coherence and bounded revisions.

**Dependencies:** completed prototype packs and evidence.

**Expected code areas:** corrections only; no broad migration.

**Tests:** focused regressions for accepted revisions plus final prototype
quality gate.

**Deployment:** stable review deployments with exact revisions.

**Founder gate:** explicit written approval of each pack and permission to begin
PX6.

**Rollback:** keep last accepted pack versions; reject/unpublish unapproved
revisions.

**Evidence:** approval record, accepted revision list, deferred-item register.

## PX6 — Full Operational Migration

**Objective:** propagate approved patterns across the authenticated product.

**Scope order:** shell/Home; Administration; Students/Staff; Admissions;
Teaching/Attendance; Finance; Assessment/Results; Communication/families;
Management/Reporting; Documents/Audit/shared services.

**Dependencies:** PX5 approval, reusable components, route-by-route acceptance
matrices.

**Expected code areas:** existing application routes/components; domain
services/RPCs remain authoritative.

**Tests:** each module's existing regression suite plus navigation, responsive,
accessibility, visual and authorization tests.

**Deployment:** bounded release units with PR, CI, preview, production revision
verification and checkpoint. Avoid one all-product cutover.

**Founder gate:** meaningful module-group acceptance, especially Finance,
Assessment and administration.

**Rollback:** release-unit revert; additive migrations only if unavoidable;
never rely on destructive production rollback.

**Evidence:** per-group matrix, tests, deployments, screenshots and UAT notes.

## PX7 — Demo & Training Environment

**Objective:** implement the isolated coherent synthetic organization, personas
and reset capability.

**Scope:** deterministic seed, demo deployment/tenant, persona entry, safe
Switch Perspective, bounded interactions, reset and guided checklist.

**Dependencies:** accepted packs, demo design, isolated infrastructure decision,
threat model.

**Expected code areas:** seed/fixture tooling, demo orchestrator, demo banner,
reset automation, dedicated deployment configuration.

**Tests:** authorization parity, isolation, dangerous-action restrictions,
idempotent reset/checksums, load, privacy and cross-tenant denial.

**Deployment:** dedicated non-production demo environment preferred; never seed
the real pilot tenant.

**Founder gate:** persona/data realism and public demo safety acceptance.

**Rollback:** disable demo entry and tear down/reseed only isolated demo assets.

**Evidence:** fixture manifest, reset rehearsal, safety tests, persona tours.

## PX8 — Platform & Branding Administration

**Objective:** complete safe SaaS operator and controlled tenant-branding
administration.

**Scope:** Platform Console, Tenant 360, plans/modules/entitlements, feature
rollout, tenant status/diagnostics/audit, Branding Studio and inheritance.

**Dependencies:** approved Pack D/E; explicit platform operator model; audited
server contracts; branding policy and entitlements.

**Expected code areas:** platform guards/functions/routes, audit events,
branding config/version/assets and admin UI. Any schema is additive and
rehearsed.

**Tests:** platform-vs-owner denial, high-impact confirmations/audits, partial
rollout isolation, branding inheritance/contrast/rollback, no privileged
credential exposure.

**Deployment:** separate focused PRs for security foundation and UI; migration
rehearsal; controlled operator verification.

**Founder gate:** platform authority model and branding commercial boundaries.

**Rollback:** disable new platform/branding features; additive data retained;
restore last published brand version.

**Evidence:** security review, migration/advisor output, audit records and
operator acceptance.

## PX9 — Regression, Accessibility & Performance

**Objective:** prove the migrated experience preserves correctness and is
operationally suitable.

**Scope:** full functional/security regression, accessibility, responsive,
visual, browser, performance/connectivity and error-state testing.

**Dependencies:** PX6–PX8 complete.

**Expected code areas:** defect fixes and test infrastructure only; feature
freeze.

**Tests:** full suite, representative roles, cross-tenant/relationship denial,
Finance/results integrity, WCAG-oriented journeys, device/browser matrix,
bounded load and bundle/query analysis.

**Deployment:** release candidates followed by exact production verification.

**Founder gate:** accept residual risk register and authorize PX10 UAT.

**Rollback:** revert blocking release units; preserve evidence and validated
business data.

**Evidence:** consolidated quality/security/accessibility/performance report.

## PX10 — Human UAT & Pilot Readiness

**Objective:** complete representative end-to-end validation and readiness
decision.

**Scope:** owner, principal, teacher, bursar, admissions, assessment, parent,
student and platform operator scenarios; defect remediation; signoff.

**Dependencies:** PX9 pass; M13 backup/restore evidence; named representatives;
safe pilot configuration.

**Expected code areas:** bounded defect fixes only.

**Tests:** rerun affected automation and final quality gate after every release.

**Deployment:** controlled production candidates with health, exact revision,
feature-state and session cleanup verification.

**Founder gate:** final pilot-readiness decision.

**Rollback:** established deployment/incident/recovery runbooks; stop pilot for
security/data-integrity blockers.

**Evidence:** signed UAT, backup/restore evidence, final acceptance matrix, risk
register, production checkpoint and readiness classification.

## M13 continuity

PX0 does not close M13. The outstanding operator-executed backup/export,
encrypted off-site transfer, disposable restore and verification remain
mandatory, as does representative human UAT. PX documentation must not be used
as substitute evidence for either gate.

## Credit-efficient working model

- Read durable checkpoints first; do not rediscover settled architecture.
- Build shared primitives and representative screens before repeated migration.
- Reuse deterministic fixtures and acceptance matrices.
- Run focused tests during implementation and full gates at pack/release
  boundaries.
- Group coherent work into bounded PRs rather than micro-PRs or giant cutovers.
- Record every founder decision, exact revision and next task.
