# PX6 RU4 Admissions acceptance matrix

| Area                             | Required evidence                                                                   | Result                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Baseline                         | Branch from verified RU3 closeout `d12655525dded8ad3ede411b45fe376c04be2c92`        | PASS                                                                                          |
| Authorization                    | `admissions.view`, module/feature evaluation, school context and RLS                | PASS implementation/focused tests                                                             |
| Context mismatch                 | Active organization/school must equal authorization snapshot                        | PASS focused test                                                                             |
| Organization-wide context        | Admissions requires an explicit school                                              | PASS focused test                                                                             |
| Direct Applicant 360             | Application must belong to active organization and school                           | PASS focused test                                                                             |
| Exact count                      | Exact filtered count independent of the 20-record page                              | PASS implementation                                                                           |
| Search                           | Applicant name or application number                                                | PASS implementation/schema tests                                                              |
| Filters/sort                     | Stage, source, newest/oldest and filter-preserving pagination                       | PASS page/schema tests                                                                        |
| Responsive register              | Mobile cards and semantic desktop pipeline table                                    | PASS automated/source review; manual pending                                                  |
| Applicant 360                    | Identity, guardian, lifecycle, evidence, assessment, decision, offer and enrollment | PASS existing workflow plus stage rail                                                        |
| State machine                    | Existing M7 transition allow-list and RPC retained                                  | PASS existing regression                                                                      |
| Conversion                       | Existing atomic, permission-gated, idempotent conversion retained                   | PASS existing regression                                                                      |
| Mutation visibility              | Permission-aware actions; no new browser mutation contract                          | PASS implementation                                                                           |
| Loading/empty/error              | PX1 shared state patterns                                                           | PASS implementation                                                                           |
| Schema/RLS/data                  | No migration, policy, entitlement or production-data change                         | PASS changed-file review                                                                      |
| Focused tests                    | RU4 page, schema, context and school-boundary coverage                              | PASS — includes exact-count and deterministic-order assertions                                |
| Full regression                  | Entire repository suite                                                             | PASS — 387 tests across 85 files                                                              |
| Formatting/lint/TypeScript/build | Established quality gates                                                           | PASS local                                                                                    |
| Production dependency audit      | Runtime dependencies                                                                | PASS — no known vulnerabilities                                                               |
| Full dependency audit            | Development-only `braces@3.0.3`, `GHSA-vfj7-8cjw-p6xm`                              | EXPECTED NON-GREEN — unsuppressed                                                             |
| Tracked secret scan              | Zero privileged-secret matches                                                      | PASS local                                                                                    |
| Netlify secret scan              | Regular and enhanced scan                                                           | PASS — 456 files, zero regular/enhanced matches                                               |
| Protected preview                | Exact branch revision and Ready deployment                                          | PASS — deploy `6acbd4d2b681f00008ef0ff3`, Ready at `8c10cdd6fc2d79e227eb933c477a6e424a3416f1` |
| Independent browser              | Authenticated Admissions register and Applicant 360                                 | NOT TESTED — SSO login redirect                                                               |
| Founder acceptance               | Visual and workflow inspection                                                      | PENDING                                                                                       |

## Founder inspection checklist

- Switch between authorized schools and confirm the Context Ribbon, heading,
  count and records agree.
- Search by applicant name and application number; apply stage/source filters;
  paginate and clear filters.
- Compare mobile applicant cards with the desktop pipeline table.
- Open Applicant 360 and inspect guardian, stage rail, document readiness,
  assessment, decision, offer and enrollment information.
- Confirm view-only users do not receive mutation controls.
- Confirm direct records from another school fail closed.
