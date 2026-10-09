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
- PX5 cross-pack visual acceptance is not started.
- PX6 operational migration and PX7 interactive demo remain separate.
- Production Platform Console roles, services and branding persistence are not
  implemented by PX4.
