# PX4 implementation readiness — Prototype Packs C–E

## Authority and objective

PX4 is defined by the approved PX0 specification, prototype plan and migration
plan as **Prototype Packs C–E**. Its objective is to validate Families, SaaS
Platform and Experience System reference experiences. This document prepares
implementation only; it does not authorize or begin PX4 code.

## Pack C — Families

Reference experiences: Parent Home and For You, family overview and child
switching, child attendance, fees/payments, published results/report cards,
announcements, messages, documents, and Student Home. Mobile is primary, while
tablet and desktop remain complete.

Reuse PX1 tokens/shell primitives and M11 relationship/RLS contracts, M8 learner
attendance summaries, M9 learner Finance read models and M10 immutable published
snapshots. Synthetic fixtures must include a guardian linked to two learners,
an unrelated learner, published and draft result versions, learner-specific
attendance/Finance, targeted communication and protected attachments.

Acceptance requires guardian access only to explicitly linked learners, student
self-only access, exclusion of drafts/internal results and school-wide Finance,
plain family-facing language, and separate authoritative ledgers for siblings.

## Pack D — SaaS Platform

Reference experiences: Platform Dashboard, organization directory and Tenant
360, plans/modules catalog, entitlement editor, controlled feature rollout,
tenant status, support diagnostics, platform audit and announcements. Desktop
is primary; tablet supports review and mobile supports read-only triage rather
than every high-impact mutation.

Reuse PX1/PX3 directory, card, status, confirmation and audit patterns. Use only
fictional tenants with varied plans, rollout and status states. Organization
Owner must remain unable to enter the Platform Console. High-impact writes, if
interactive validation is later approved, require explicit platform-operator
authorization, impact preview, reason, confirmation and audit. No service
credential or privileged diagnostic may reach the client.

## Pack E — Experience System

Reference experiences: design-system and application-state reference, Branding
Studio draft/preview/publish/rollback concept, search/command center,
notifications, help/support, context switching and responsive shell states.
Cover loading, empty, error, permission, entitlement, disabled and setup states.

Reuse all PX1 primitives. Candidate additions are a command palette,
notification drawer, help panel, brand/device previews, state illustrations and
skeletons. Synthetic cases include accessible and invalid brand colors,
authorized and denied search results, responsibility-aware notifications,
offline/slow/failure states and multiple organization/school/period contexts.

Acceptance requires cross-pack consistency, independently authorized and
scope-safe search, contrast-safe tenant accents, and semantic keyboard and
screen-reader behavior for every state.

## Shared boundaries and navigation

- Use isolated prototype routes/components and controlled private previews.
- Do not replace the authoritative M11 portal, platform operator mechanisms or
  production operational routes.
- Synthetic data must not read from or mutate production tenants.
- UI visibility is not authorization; preserve RLS, centralized permissions,
  entitlements, relationship scope and tenant/school isolation.
- Platform Super Admin remains separate from Organization Owner.
- PX4 does not authorize PX6 migration, PX7 demo functionality or production
  activation of Platform/Branding controls.

## Responsive and accessibility requirements

Pack C is mobile-first at 360/390/412px. Pack D is desktop-first with tablet
review and safe mobile triage. Pack E covers all core breakpoints, high zoom,
keyboard-only use, reduced motion and screen-reader critical paths. All packs
require visible focus, semantic structure, minimum touch targets, contrast-safe
states and no page-level horizontal overflow.

## Proposed implementation phases

1. Reconcile contracts, routes, fixtures and shared prototype state.
2. Build Pack C family/student references and relationship-denial tests.
3. Build Pack D platform references after founder approval of operator roles and
   high-impact status/rollout boundaries.
4. Build Pack E branding/search/notification/help/state references.
5. Integrate cross-pack navigation, accessibility and responsive behavior.
6. Run security/regression checks, deploy controlled previews and prepare three
   acceptance matrices for founder review.

## Test and acceptance matrix

| Area                     | Required evidence                                                        |
| ------------------------ | ------------------------------------------------------------------------ |
| Family relationships     | Linked-child success; unrelated-child and cross-tenant denial            |
| Student access           | Self-only access; no guardian or peer data                               |
| Results and Finance      | Published/learner-scoped only; drafts and school ledgers denied          |
| Platform boundary        | Owner denied; explicitly authorized operator reference only              |
| Tenant rollout           | Partial rollout isolated; no cross-tenant leakage                        |
| Branding                 | Inheritance and contrast validation; security states never disguised     |
| Search/commands          | Scope-safe results and independent command authorization                 |
| Responsive/accessibility | Breakpoint, zoom, keyboard, reduced-motion and screen-reader checks      |
| Architecture             | Synthetic/nonpersistent data; no production mutation or authority change |

## Risks, dependencies and founder decisions

Dependencies are PX1–PX3 patterns, M8–M11 read/security contracts, explicit
platform-operator authorization design, branding inheritance, search
authorization and notification read models. Key risks are accidental conflation
of Organization Owner with Platform Super Admin, relationship leakage, unsafe
prototype rollout controls, branding contrast regression and search-result
scope leakage.

Founder decisions required before implementation are: the authorized platform
operator role model; which high-impact Platform controls remain static versus
interactive in the prototype; the tenant suspension/non-destructive status
language; branding inheritance and publication/rollback semantics; and whether
PX4 should use one integrated preview or three separately reviewable routes.

## Recommended next authorization

Authorize PX4 Prototype Packs C–E on a new feature branch after confirming the
five founder decisions above. Require isolated synthetic reference routes,
three acceptance matrices, controlled previews, security-boundary tests and a
mandatory stop for founder acceptance before PX5 or any operational migration.
