# PX4 Prototype Packs C–E implementation record

PX4 implements three isolated, synthetic reference routes:

- `/px4-families` — Pack C Families
- `/px4-platform` — Pack D SaaS Platform
- `/px4-experience` — Pack E Experience System

All routes reuse the PX1 application shell, design tokens, focus treatment,
responsive navigation and shared state semantics. Shared PX4 navigation connects
the packs while each pack retains isolated persona and context state.

## Security contract

- Fixtures are local, fictional and nonpersistent.
- No Supabase query, schema, migration, RLS, authentication, membership,
  entitlement or production-data change is included.
- Persona selectors change presentation only.
- Organization Owner remains separate from Platform Operator personas.
- Platform lifecycle, entitlement, rollout, announcement, publish and rollback
  mutations are disabled.
- Family data is learner-specific; the unrelated/cross-tenant learner is denied.
- Search visibility is separate from command authorization.
- Every route states that production records and permissions remain unchanged.

## Approved founder decisions

The prototype uses Platform Super Admin, Platform Operations Admin and Platform
Support Viewer reference personas; static/read-only high-impact controls; Active,
Restricted, Suspended and Reactivated lifecycle language; Platform defaults →
Organization → School branding inheritance; and three separately reviewable
routes with shared navigation.

## Founder correction pass

- **Pack C:** Ada is explicitly identified as guardian of both linked learners.
  Learner switching continues to replace school, class, attendance, Finance,
  results, notices, messages and documents as one coherent record set.
- **Pack C Finance:** the guardian retains the full learner-specific ledger.
  The student presentation is summary-only, omits receipt/payment history and
  states that visibility does not transfer payment responsibility.
- **Pack D:** Support Viewer now receives a distinct support dashboard and
  limited Tenant support view. Lifecycle, plan, entitlement, rollout and
  privileged-audit navigation and controls are absent rather than merely
  accompanied by warning text.
- **Pack E:** notifications are explicitly classified as school-specific,
  organization-wide or platform. The school notification matches the active
  Cedarbridge Academy context; organization notifications identify their
  originating school when relevant.
- **Shared:** mobile workspace tabs include a swipe cue and edge treatment;
  active tabs scroll into view, arrow-key focus works, and reduced-motion is
  honored.
- **C3 Finance fixture clarity:** Amara's fictional bill of NGN 485,000.00 and
  payment of NGN 360,000.00 reconcile to NGN 125,000.00 outstanding. Musa's
  fictional bill of NGN 625,000.00 and payment of NGN 472,500.00 reconcile to
  NGN 152,500.00 outstanding. Switching learners replaces the entire ledger,
  receipt and related learner context together.
- **D2 Support dashboard:** Support Viewer receives authorized-case,
  escalation, safe-service-health and pending-support-action metrics instead
  of organization, lifecycle and module-adoption administration metrics.
- **D3 Support-safe Tenant 360:** Support Viewer sees support-safe module
  availability, safe service diagnostics, authorized cases and support activity
  history. Plan/entitlement detail, privileged audit, lifecycle and rollout
  controls remain absent. Platform administrator presentations are unchanged.
- **E2 responsive register:** the register detects actual contained overflow
  before showing “Swipe to view more columns,” supports left/right keyboard
  scrolling and respects reduced motion. The cue is omitted when all columns
  fit.

### Student Finance policy decision (deferred)

The production policy still requires founder approval. The three documented
options are:

1. **No student Finance access** — all fee information remains guardian/staff
   only.
2. **Student summary-only access** — show a balance/status summary without
   receipts, allocation details or payment actions. **PX4 demonstrates this
   conservative option only.**
3. **Authorized student detailed access** — permit detailed ledger visibility
   only under an explicit future policy and the established server-side
   authorization architecture.

PX4 does not create a setting, permission or persisted policy for any option.

## Synthetic fixtures

Pack C contains guardian Ada with linked learners Amara Okafor and Musa Ibrahim,
plus one unrelated cross-tenant learner. Attendance, fees, receipts, published
results, notices and documents change together when the linked learner changes.

Pack D contains four fictional tenants covering every approved lifecycle state,
varied plans, module adoption, rollout and safe support diagnostics. No record is
loaded from the production tenant directory.

Pack E contains three brand layers, authorized and restricted search results,
role/school-aware notifications, and shared loading, empty, error, permission,
entitlement, disabled, setup, offline/connection and invalid-context patterns.

## Rollback

The change is route-isolated. Reverting the PX4 commit removes the prototypes
without database rollback or changes to existing operational routes.

## Deferred by design

- Founder acceptance remains pending.
- The final production policy for student Finance visibility remains pending.
- PX5 cross-pack visual acceptance is not started.
- PX6 operational migration and PX7 interactive demo remain separate.
- Production Platform Console roles, services and branding persistence are not
  implemented by PX4.

## Verification checkpoint

- Draft PR: #97
- Targeted-correction implementation revision:
  `9f36c57c980f41bf77217ba2a22b38e6180c870b`
- Netlify preview: `6ac9f807e46b8000086f6503`, Ready, exact correction
  implementation revision
- Next.js plugin: success
- Netlify enhanced secret scan: 410 files, zero matches
- Automated tests: 342 passing across 73 files
- Formatting, zero-warning lint, strict TypeScript and production build: pass
- Production dependency audit: zero vulnerabilities
- Full dependency audit: non-green only for the accepted, unsuppressed
  development-only `braces@3.0.3` advisory (`GHSA-vfj7-8cjw-p6xm`)
- Local tracked-secret scan: pass
- GitHub Actions run #236 passed frozen installation, formatting, zero-warning
  lint, strict TypeScript, all 342 tests and the production build. Its overall
  result is non-green solely because the unsuppressed full-audit step detects
  the accepted development-only `braces` advisory. The subsequent CI secret
  scan was skipped after that failure and is not represented as passing.

The final protected preview is subject to Netlify team SSO. Work-browser
inspection stalled at that access boundary and was aborted, so desktop, tablet,
mobile, high-zoom and screen-reader visual acceptance remain **NOT TESTED by
Work / PENDING FOUNDER ACCEPTANCE**. No unrelated screenshot is substituted as
evidence.
