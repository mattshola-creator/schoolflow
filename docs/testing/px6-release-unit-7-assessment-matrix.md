# PX6 Release Unit 7 — Assessment and Results preview matrix

**Status:** Draft founder preview  
**Branch:** `feat/px6-ru7-assessment-results`  
**Base:** verified `main` `04ce1b312870afdac19d7a64058d1d65feaca8d3`

## Scope

This preview migrates the existing M10 Assessment and Results workflow to a
more usable phone layout. It uses the existing school-scoped workspace and
score-sheet services. It does not add assessment behavior or synthetic records.

## Acceptance matrix

| Check                                                                                                                                                                 | Evidence                                                                                  | Status                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Assessment schemes, score sheets and report-card routes remain connected to existing M10 services                                                                     | Existing routes and M10 contract tests                                                    | PASS — source / automated                                |
| Score bounds, active enrollment, teacher assignment, academic locks, server-side computation and valid workflow transitions remain enforced by existing services/RPCs | Existing M10 schemas, service actions, migration-contract tests and full regression suite | PASS — inherited automated coverage; no behavior changes |
| Phone score entry presents one student at a time with labeled component score fields and readable computed result                                                     | `/assessments/[batchId]` mobile card layout and labeled inputs                            | PASS — source review; browser NOT TESTED                 |
| Result workflow has phone cards with context, status and only the existing permitted actions; desktop retains the table                                               | `/assessments` responsive breakpoint and unchanged `advanceResultBatch` server action     | PASS — source review; browser NOT TESTED                 |
| Empty roster and empty score-sheet states are readable on mobile                                                                                                      | Explicit mobile empty states                                                              | PASS — source review                                     |
| Production/shared student records were changed for the preview                                                                                                        | No data mutations performed                                                               | NONE                                                     |
| Authenticated populated mobile workflow and desktop review                                                                                                            | Requires protected preview plus authorized configured QA account                          | NOT TESTED                                               |

## Quality and security

Changes are presentation-only in the Assessment route components. No schema,
RLS, permission, entitlement, authentication, mutation, result-computation,
publication, snapshot, correction, promotion, or audit contract changed. The
underlying M10 acceptance record remains authoritative for those operational
invariants.

Local verification on this branch: frozen install, format, zero-warning lint,
strict TypeScript, **394 tests across 86 files**, and production build passed.
`pnpm audit --prod` found no known vulnerabilities. The full audit remains
non-green on one high development-only `braces@3.0.3` finding
(`GHSA-vfj7-8cjw-p6xm`) through
`eslint-config-next > @next/eslint-plugin-next > fast-glob > micromatch > braces`.
The CI-equivalent tracked-source scan found no privileged secret patterns.
Netlify enhanced secret scan and authenticated preview inspection remain
pending.
