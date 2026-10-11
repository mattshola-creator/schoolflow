# PX6 Release Unit 1 plan — Shell, Home, Context Ribbon and My Day

**Status:** implementation authorized 10 October 2026; founder release acceptance required before merge.

## Objective

Migrate the accepted PX1 shell and PX3 responsibility-aware Home/My Day
patterns into the existing authenticated application without replacing its
authorization, tenancy or operational services. The release unit must make the
active organization, school and academic period continuously clear and give an
authorized user a useful, scoped entry point into daily work.

## Authoritative boundaries

- Supabase authentication, RLS and existing tenant membership remain unchanged.
- `loadEffectiveAuthorization`, `buildWorkspaceAccess`, server guards,
  permissions, entitlements and feature gates remain the source of truth.
- `loadTenantContext`, `switchContext` and `loadAcademicContext` remain the only
  authoritative context mechanisms.
- Action Center tasks and approvals continue through the existing M6 service
  and server actions; no second task or approval implementation is permitted.
- Perspective/responsibility presentation may prioritize authorized work but
  must never grant permissions or expose unavailable modules.
- No production Platform Console, demo impersonation or synthetic fixture data
  is introduced.

## Included scope

### 1. Authenticated shell hardening

- Retain the accepted responsive desktop sidebar and mobile drawer.
- Consolidate page-title/action placement and active-navigation behavior.
- Preserve search, notifications, help, profile and sign-out controls.
- Keep unavailable-module explanations distinct from permission denial.
- Retain focus trapping/restoration, Escape/backdrop dismissal, scroll locking,
  44px touch targets and reduced-motion behavior.

### 2. Context Ribbon migration

- Continue to display Organization → School → Session → Term using
  server-validated context only.
- Preserve organization-wide scope and explicit setup fallbacks.
- Keep long-name disclosure and compact mobile presentation.
- Remove the duplicated dashboard-level context selector only after verifying
  the shell ribbon supplies the same authorized switching capability.
- Never infer a school, session or term that the server did not return.

### 3. Home

- Replace the current organization/module directory presentation with the
  accepted operational Home hierarchy while retaining onboarding and portal
  redirects.
- Provide scope-aware headings, module entry points, priority summaries and
  safe operational indicators derived from existing authorized read models.
- Show organization-wide information only when that scope is authorized.
- Use honest loading, empty, setup-required, permission, entitlement and error
  states; omit metrics that cannot be derived reliably in this release unit.
- Retain clear available/unavailable module discovery.

### 4. My Day

- Add a responsibility-aware read presentation over existing Action Center
  tasks, approvals and permitted operational links.
- Prioritize urgent/overdue work, deduplicate repeated references and identify
  the responsibility/category that produced each item.
- Support multi-responsibility users without a role selector that changes
  authority.
- Link to existing authorized workflows; mutations remain in their current
  services and forms.

### 5. Action Center integration

- Preserve `/action-center` and all current task/approval behavior.
- Share presentation components where useful, but do not relocate or rewrite
  server actions during this release unit.
- Home/My Day summaries must not reveal task or approval information beyond the
  active tenant/school and current caller's established access.

## Explicitly excluded

- Migration of Administration, Students, Staff, Admissions, Teaching,
  Attendance, Finance, Assessment, Communication, Management or portal pages.
- New database tables, migrations, RLS policies, permissions, entitlements or
  feature flags.
- Production student Finance policy decisions.
- Platform Operator implementation, branding persistence, subscriptions,
  commercial pricing, PX7 demo behavior or synthetic persona switching.
- Changes to domain workflow state machines or mutation semantics.

## Proposed code impact

| Area                 | Expected files                                                                           | Planned treatment                                                |
| -------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Authenticated layout | `src/app/(app)/layout.tsx`                                                               | Compose accepted shell/context; preserve server loaders          |
| Home                 | `src/app/(app)/dashboard/page.tsx`                                                       | Scope-aware operational hierarchy using authorized reads         |
| My Day               | New bounded authenticated route/components, or a clearly separated dashboard section     | Read-only prioritized view over existing services                |
| Action Center        | `src/app/(app)/action-center/page.tsx` and shared presentation only                      | Preserve actions and service contracts                           |
| Shell/navigation     | `src/components/application-shell.tsx`, `workspace-navigation.tsx`                       | Minimal migration refinements; no parallel access model          |
| Context              | `src/components/context-ribbon.tsx`                                                      | Preserve authoritative contract and accepted responsive behavior |
| Authorization        | Existing evaluator/navigation modules                                                    | Reuse without broadening access                                  |
| Tests                | Existing shell/context/navigation/dashboard/shared-services tests plus focused RU1 tests | Extend; do not remove valid coverage                             |

Exact files must be reconfirmed at implementation preflight because main may
advance after this plan.

## Delivery sequence

1. **RU1-A — Reconcile and baseline:** inventory routes, read models,
   permissions, entitlement rules, performance and existing browser behavior.
2. **RU1-B — Shell and Context Ribbon:** integrate accepted presentation,
   remove verified duplication and run authorization/context regressions.
3. **RU1-C — Home:** implement scoped, honest summaries and module discovery.
4. **RU1-D — My Day:** compose authorized existing tasks/approvals and workflow
   links with multi-responsibility prioritization.
5. **RU1-E — Responsive/accessibility QA:** complete device, keyboard, zoom,
   reduced-motion and screen-reader critical-path checks.
6. **RU1-F — Preview/founder gate:** protected preview, screenshots, matrix,
   rollback rehearsal and explicit founder release decision.

Each checkpoint must leave a durable record and a green functional gate before
the next checkpoint.

## Acceptance criteria

| Gate                  | Required result                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| Identity and tenancy  | Login/session behavior unchanged; non-members denied                                                    |
| Context safety        | Ribbon, Home and My Day agree on server-validated organization/school/session/term                      |
| Authorization         | Navigation and content match existing effective permissions                                             |
| Entitlements          | Unavailable modules remain unavailable with the correct explanation                                     |
| Organization scope    | Cross-school summaries appear only to authorized organization-scope callers                             |
| School scope          | No other-school records, counts or aggregate leakage                                                    |
| Home usefulness       | Active scope, priority work, available modules and safe next actions are discoverable                   |
| Multi-responsibility  | Combined work is prioritized and deduplicated without granting authority                                |
| Action Center         | Existing task/approval create, update and decision behavior remains correct                             |
| Mobile/tablet/desktop | 320, 375, 390, 768, 1024 and 1440px have no page-level overflow or clipped controls                     |
| Accessibility         | Keyboard-only operation, visible focus, semantics, 44px targets, 200%/400% zoom and reduced motion pass |
| Performance           | No material regression in shell/Home server work or client bundle; measured before/after                |
| Production isolation  | No schema, RLS, permission, entitlement or production-data mutation outside existing workflows          |

## Verification approach

- Frozen-lockfile install, formatting, zero-warning lint, strict TypeScript,
  full tests and production build.
- Focused tests for shell controls, unique navigation, context fallbacks,
  organization/school switching, access-state distinctions and My Day
  prioritization/deduplication.
- Representative automated identities: owner, organization administrator,
  school administrator, management, teacher, staff and unauthorized actor.
- Direct cross-tenant, wrong-school, invalid-context and entitlement-denial
  regressions using established fixtures.
- Existing Action Center service/action and audit tests.
- Desktop/tablet/mobile browser matrix; keyboard, screen-reader critical path,
  high zoom, touch, reduced-motion and long identity/context strings.
- Production dependency audit reported separately from the full audit; retain
  the unsuppressed development-only `braces@3.0.3` exception.
- Tracked-secret and Netlify enhanced-secret scans.
- Protected preview with exact-revision verification and founder screenshots.

## Rollout and rollback

Implementation must use a dedicated RU1 feature branch and focused PR. A
protected preview and founder acceptance precede production merge. If safe
feature isolation is practical, retain the existing Home presentation until
acceptance; otherwise keep the PR revertable as one release unit.

Rollback is a Git revert of the RU1 merge followed by exact Netlify revision
verification. Because RU1 must not introduce a migration or persistent data
contract, database rollback is not expected. Existing Action Center records and
audit history are retained. If an unavoidable schema/configuration need is
discovered, stop and request separate authorization before implementation.

## Founder implementation gate

The founder authorized this release unit on 10 October 2026. Implementation is
isolated on `feat/px6-ru1-shell-home-my-day`; its pull request and protected
preview remain subject to founder acceptance before merge. The authorization
does not cover later PX6 release units, PX7, PX8, M13 closeout or any deferred
Finance/commercial/platform decision.

## Implementation checkpoint

- The accepted PX1 shell, mobile drawer, account controls and Context Ribbon
  remain the production foundation; no parallel shell or authorization model
  was introduced.
- The duplicated dashboard context selector was removed. The authoritative
  ribbon remains the only context switcher.
- Existing `all_schools` membership state now exposes an explicit
  organization-wide option. Restricted memberships receive only their
  RLS-visible school options, and the existing school remains the safe default.
- Restricted zero-school memberships receive no fallback context. Stored
  organization-wide, school, stale and cross-organization selections are
  resolved against exact server-built options before context cookies are set.
- Home presents scope-aware headings, real authorized task/approval/notice
  counts, permission-derived work areas, and capability-evaluated shortcuts.
- Operational totals use exact RLS-filtered counts independently of bounded
  20-item/type work lists. Home/My Day also require the active tenant option and
  authorization snapshot to identify the same organization and school.
- `/my-day` is a read-only prioritized view over existing Action Center records;
  mutations remain at `/action-center` and use its established services.
- No dependency, schema, migration, RLS, permission, entitlement, feature,
  authentication or production-data change is included.
- Rollback remains a single Git revert and Netlify redeploy; there is no
  database rollback step.
