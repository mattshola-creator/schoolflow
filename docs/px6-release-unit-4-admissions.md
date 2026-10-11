# PX6 Release Unit 4 — Admissions

## Scope reconciliation

The authoritative PX6 migration backlog defines Release Unit 4 as Admissions.
RU4 migrates the existing M7 operational experience to the accepted PX1/PX3
patterns while retaining the deployed lifecycle and database contracts.

Included:

- school-scoped Admissions register with exact filtered counts;
- applicant-name or application-number search;
- stage and source filtering, deterministic sorting and filter-preserving
  pagination;
- mobile applicant cards and semantic desktop table;
- Applicant 360 identity, guardian, evidence, assessment, decision, offer,
  readiness and enrollment history;
- permission-aware management controls and responsive loading, empty and error
  states;
- existing document-policy and private-evidence workflows.

Excluded:

- schema, RLS, permission, entitlement, authentication or feature changes;
- new lifecycle states, mutation contracts or direct browser writes;
- bulk import, destructive deletion or a parallel student master;
- Finance, Teaching, Assessment, Communication or later PX6 release units.

## Contracts preserved

- `requireCapability` and authoritative active-school matching run before
  Admissions queries.
- Supabase RLS remains authoritative for every record.
- Existing M7 RPCs own creation, transitions, assessment, decisions, offers,
  checklist evidence, offer response and atomic enrollment conversion.
- Conversion still requires an accepted, ready application plus
  `admissions.enroll` and `students.manage`; it reuses the applicant Person and
  remains idempotent.
- Applicant and guardian identities do not become students before conversion.

## Responsive experience

Narrow viewports receive applicant cards with stage, application number, class
and session. Medium and larger viewports receive the semantic pipeline table.
Filters use labelled controls and 44-pixel minimum actions. Applicant 360 adds
an accessible stage rail and retains responsive, permission-aware workflow
forms.

## Rollback

RU4 is application-only. Revert the RU4 merge and redeploy the preceding
verified `main` revision. No database rollback is required because the release
contains no schema, RLS or data migration.

## Founder acceptance boundary

RU4 remains unmerged until founder review of the protected preview. Preview
records are real authorized operational records; no synthetic fixtures are
substituted. Independent authenticated browser evidence is recorded as NOT
TESTED when Netlify Team Protection or application authentication prevents it.
