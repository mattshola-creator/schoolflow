# PX6 readiness and migration backlog proposal

**Status:** proposal only. PX6 has not started and requires explicit founder
authorization.

## Readiness principles

- Migrate existing routes incrementally; do not create competing business logic.
- Reuse accepted PX1–PX5 components and interaction contracts.
- Keep server services, RLS, permissions, entitlements, locks and audit as the
  source of truth.
- Require a focused PR, preview, acceptance matrix, rollback plan and exact
  production verification for each release unit.
- Make no database migration unless separately justified, rehearsed and
  approved.

## Proposed release units

| Order | Route group                                          | Accepted references | Critical regressions                                                 |
| ----- | ---------------------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| 1     | Shell, Home, Context Ribbon, My Day                  | PX1 + Pack B        | Context safety, navigation parity, responsive shell                  |
| 2     | Administration, users, roles and module explanations | Pack B              | Owner/platform boundary, effective access, entitlements              |
| 3     | Students, Staff and 360 views                        | Pack B              | Tenant/school scope, guardian links, documents                       |
| 4     | Admissions                                           | Pack B              | M7 state machine, conversion, evidence and idempotency               |
| 5     | Teaching and Attendance                              | Pack B              | Assignments, locks, corrections, tablet/mobile entry                 |
| 6     | Finance                                              | Pack B + Pack C     | Exact decimals, recorder/verifier, reversals, student policy gate    |
| 7     | Assessment and Results                               | Pack B + Pack C     | Computation, versioning, publication and published-only portal       |
| 8     | Communication and Families                           | Packs C + E         | Relationship/scope safety, notification targeting, private documents |
| 9     | Management and Reporting                             | Pack B              | Aggregate isolation, exports, search and academic locks              |
| 10    | Documents, Audit and shared states                   | PX1 + Pack E        | Private storage, audit integrity, errors and accessibility           |

## Entry gate

PX6 may begin only after explicit founder approval of PX5, selection of the
first release unit, confirmation of its rollback/feature-boundary strategy and
acknowledgement that the production student Finance policy remains a blocker
for the relevant Finance/portal work.

## Definition of done per release unit

Authorization and entitlement parity; focused and full regressions; formatting,
lint, strict TypeScript and build; production dependency and secret scans;
desktop/tablet/mobile and keyboard evidence; preview acceptance; controlled
merge; exact deployed revision; health verification; and reversible rollout.
