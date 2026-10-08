# SchoolFlow Product Experience 2.0 prototype-pack plan

**Phase authority:** planning only in PX0. No pack is implemented by this file.

## Shared prototype rules

- Use synthetic, coherent, non-production identities and records.
- Preserve production authorization, RLS, entitlements and server business
  services in every interactive prototype.
- Cover desktop, tablet and mobile intentionally; screenshots alone are not
  acceptance.
- Use production-quality shared tokens/components rather than isolated mockups.
- Every pack includes loading, empty, validation, access-denied, not-entitled,
  disabled, setup-required and failure states relevant to its screens.
- Founder visual acceptance in PX5 gates mass migration.

## Pack A — Public Product

### Representative screens

- Homepage with value proposition and real product preview framing.
- Product/solutions and module discovery.
- Plan comparison with modular inclusions and clear undecided pricing states.
- Demo entry and persona explanation.
- Sign in, signup, recovery, invitation and onboarding entry.
- Security/trust summary and support/resource entry.

### Synthetic content

- Fictional school-group examples and anonymized product screenshots/data.
- Stable plan/module examples clearly labeled as prototype packaging.
- Demo personas and schools from the demo design, without live demo credentials
  until PX7.

### Coverage

- Desktop: 1440 and 1280 widths.
- Tablet: 768–1024 widths.
- Mobile: 360 and 390/412 widths.

### Reusable patterns

Marketing header/footer, product hero, module card, plan comparison, trust
panel, testimonial/evidence placeholder, authentication card, form states,
responsive product-preview frame and CTA group.

### Dependencies

PX1 tokens/primitives, approved commercial language, module catalog projection,
founder decisions on plan labels/pricing visibility, demo safety framing.

### Acceptance criteria

- Prospect understands product, school types, modules, next step and trust
  model without signing in.
- No technical health endpoint is presented as the main secondary CTA.
- Signup/sign-in/recovery remain functional and accessible.
- No production or private data appears.
- Lighthouse/accessibility/performance targets are proposed in PX1 and met at
  the agreed prototype gate.

## Pack B — School Operations

### Representative screens

- Organization Owner cross-school Home.
- School Home and Context Ribbon.
- My Day and Action Center.
- Administration Center/effective access.
- Student register and Student 360.
- Admissions pipeline and Applicant 360.
- Teacher My Teaching/class-subject workspace.
- Fast attendance register.
- Finance overview and Collections workflow.
- Assessment workflow and score-entry sheet.

### Synthetic data

Two authorized schools plus one inaccessible school; current session/term;
staff with mixed responsibilities; students/guardians; admissions stages;
attendance exceptions; lessons; exact-decimal Finance cases; assessment drafts,
blockers and one published snapshot.

### Coverage

- Desktop for administration, Finance, registers and reporting density.
- Tablet for teaching, attendance and score entry.
- Mobile for My Day, attendance, student lookup and essential Finance actions.

### Reusable patterns

Application shell, Context Ribbon, navigation, KPI card, exception card,
register, filter bar, 360 profile, tabs, workflow rail, task list, approval
panel, confirmation dialog, form sections, sticky action area and access state.

### Dependencies

PX1 shell/design system; current authorization snapshot; existing M3–M10
services; synthetic fixture plan; exact role/responsibility test matrix.

### Acceptance criteria

- Context and authorization scope are continuously clear.
- Each representative can reach principal workflows without hidden URLs.
- Teacher/attendance flows are practical on tablet/mobile.
- Finance and publication actions retain confirmations, segregation, exact
  computation and server authority.
- Unavailable/setup states explain the next safe action.

## Pack C — Families

### Representative screens

- Parent Home and For You.
- All Children/family overview and learner switcher.
- Child attendance, fees/payments, published results/report card.
- Announcements, messages and documents.
- Student Home, attendance, published results and communication.

### Synthetic data

Guardian with two linked learners in authorized schools; unrelated learner;
published and draft result versions; learner-specific attendance/Finance;
targeted notices/messages; protected attachments.

### Coverage

Mobile is primary (360/390/412); tablet and desktop remain complete.

### Reusable patterns

Consumer shell, child switcher, For You card, balance/result/attendance summary,
timeline, notice/message item, protected attachment, relationship/access state.

### Dependencies

M11 relationship/RLS contracts, M9 learner Finance read model, M10 immutable
published snapshots, M8 attendance summaries, PX1 tokens.

### Acceptance criteria

- Guardian sees only explicitly linked learners; student sees self only.
- Draft/internal results and school-wide Finance remain inaccessible.
- Common parent tasks are understandable on a phone without staff terminology.
- Multiple children do not merge authoritative student ledgers.

## Pack D — SaaS Platform

### Representative screens

- Platform Dashboard.
- Organization directory and Tenant 360.
- Plans/modules catalog.
- Entitlement editor.
- Controlled feature rollout.
- Tenant status, support diagnostics, platform audit and announcements.

### Synthetic data

Fictional tenants on varied plan/rollout/status states, including an explicit
partial rollout and suspended/non-destructive status scenario. No real tenant
details in prototypes.

### Coverage

Desktop primary for complex administration; tablet review; mobile read-only
triage rather than every high-impact mutation.

### Reusable patterns

Platform shell, tenant directory, Tenant 360, configuration diff, rollout
scope selector, impact preview, reason/confirmation, audit timeline and safe
diagnostic summary.

### Dependencies

Explicit platform-operator authorization design, protected server functions,
audit requirements, catalog/entitlement read models, founder decisions on
platform roles and destructive/status operations.

### Acceptance criteria

- Organization Owner cannot enter the Platform Console.
- Every high-impact write is caller-authorized, confirmed, reasoned and audited.
- Partial rollout cannot leak across tenants.
- No service credential or privileged diagnostic is exposed client-side.

## Pack E — Experience System

### Representative screens

- Design-system reference and application states.
- Branding Studio draft/preview/publish/rollback concept.
- Search/command center.
- Notifications and help/support.
- Context switching and responsive shell states.
- Loading, empty, error, permission, entitlement, disabled and setup states.

### Synthetic data

Approved brand examples with accessible/invalid colors; authorized and denied
search results; notifications for varied responsibilities; offline/slow/failure
states; multiple organizations/schools/periods.

### Coverage

All core breakpoints, high zoom, keyboard-only, reduced motion and screen-reader
critical paths.

### Reusable patterns

All PX1 primitives plus command palette, notification drawer, help panel,
brand preview, device preview, state illustrations/placeholders and skeletons.

### Dependencies

Token architecture, contextual accent constraints, search authorization,
notification read models, branding inheritance proposal and accessibility test
plan.

### Acceptance criteria

- Patterns are coherent across all four preceding packs.
- Search results and commands are scope-safe and independently authorized.
- Tenant accent never reduces contrast or disguises security-critical states.
- All states have semantic, keyboard and screen-reader behavior.

## Review sequence and gates

1. **PX1 foundation review:** tokens, primitives, shell behavior and state
   semantics.
2. **Pack A:** commercial/public reference.
3. **Pack B:** highest-complexity school operations reference.
4. **Pack C:** mobile-first family reference.
5. **Pack D:** platform boundary/reference.
6. **Pack E:** system-wide consistency and state reference.
7. **PX5 founder visual acceptance:** approve, request bounded revisions or
   reject. PX6 must not begin without explicit approval.

## Credit-efficient execution

- Build one canonical instance of each pattern, then reuse it.
- Use known deterministic synthetic fixtures across packs.
- Run focused component/route tests continuously and the full quality gate at
  pack/release boundaries.
- Record decisions in durable docs rather than rediscovering them.
- Keep visual review packs bounded; do not migrate every operational page before
  approval.
