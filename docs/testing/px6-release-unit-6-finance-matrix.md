# PX6 Release Unit 6 — Finance acceptance matrix

**Status:** Draft for founder review  
**Branch:** `feat/px6-ru6-finance`  
**Base:** Final RU5 main `04ce1b312870afdac19d7a64058d1d65feaca8d3`

RU6 migrates the existing M9 school Finance workspaces to the accepted PX1
responsive experience. The PX6 backlog names Pack B + Pack C and identifies
exact decimals, recorder/verifier separation, reversals and the student Finance
policy gate as critical regressions. Pack C student Finance remains limited by
the existing conservative policy; this release does not expand student
visibility or payment responsibility.

## Scope and preserved contracts

| Capability               | Existing M9 contract retained                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Fee setup and billing    | Effective-dated fee structures, exact decimal inputs, atomic structure creation, billing preview and idempotent billing RPCs          |
| Collections              | Caller-bound recording, separate verification, transactional allocation, immutable receipt snapshots, reversals that preserve history |
| Expenses and advances    | Existing submission, approval, evidence-backed payment, completion and append-only audit events                                       |
| Cashier controls         | Existing close, handover and reconciliation RPCs, locks and variance evidence                                                         |
| Reports and other income | Existing school-scoped summaries, security-invoker views and idempotency rules                                                        |
| Access and isolation     | Existing organization/school validation, Finance entitlements and permissions, RLS, server services, RPCs and audit records           |

No schema, migration, RLS policy, permission, entitlement, authentication
flow, service contract or production record is changed by this UI migration.
Student Finance policy remains a gate for any future student-facing ledger or
portal work. Payroll, general ledger, procurement, bank integrations, automated
reconciliation, tax, budgeting, multi-currency settlement and external
accounting remain excluded by ADR-0023.

## Acceptance matrix

| Check                                                                                                                                                        | Evidence                                                                                                           | Status                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Finance section navigation uses the current authorization snapshot and hides destinations with missing module, feature or permission access                  | `FinanceWorkspaceNav` focused tests                                                                                | PASS — automated                           |
| Unauthorized, unentitled, disabled, invalid-context and technical load states remain distinct and fail closed                                                | `FinanceUnavailableState` maps only existing authorization error reasons; focused component tests                  | PASS — automated                           |
| Forms use visible field labels and mobile-friendly stacked layouts; empty registers explain the state                                                        | Finance route source; full lint, type and test checks                                                              | PASS — source/automated                    |
| Finance overview uses exact paged school-scoped M9 rows, separates recorded from verified collections, and exposes tasks only for authorized sections        | `/finance/overview`; `loadFinanceDashboard`; RLS-scoped existing tables/views                                      | PASS — source/automated                    |
| Student bill register and invoice detail use the existing `finance.billing.view` gate and show allocations only when Collections read access is also present | `/finance/billing`, `/finance/billing/[invoiceId]`; current authorization checks; M9 billing and allocation tables | PASS — source/automated                    |
| Student identity in Finance views is displayed or searchable only when the current school authorization also grants existing student-record access           | Role-sensitive `students.view` + `students.student_records` check; otherwise identity is omitted                   | PASS — source/automated                    |
| Exact-decimal validation, recorder/verifier separation, allocation, receipts, reversals, expense approvals and reconciliation remain unchanged               | Existing `src/features/finance` service, schema, migration-contract tests and M9 matrix                            | PASS — automated/source; no live mutations |
| Authenticated browser review of populated fee, payment, expense, cashier, report and reconciliation flows                                                    | Requires protected preview and authorized QA data                                                                  | NOT TESTED                                 |
| Responsive configured-state review on mobile and desktop                                                                                                     | Founder visual acceptance step                                                                                     | NOT TESTED                                 |
| Live Finance write workflow in isolated synthetic data                                                                                                       | Requires separate isolated demo/UAT execution                                                                      | NOT TESTED                                 |
| Production/shared tenant mutation                                                                                                                            | Not performed                                                                                                      | NONE                                       |

## Quality evidence for this branch

Current PR head: `4180f145e82285d644d488e37d52f2904d5982e5`. Local frozen
install, formatting, zero-warning lint, strict TypeScript, the full suite
(**399 tests across 88 files**) and production build passed. `pnpm audit --prod`
passed. The full dependency audit remains non-green because the existing
unsuppressed development-only `braces@3.0.3` advisory
(`GHSA-vfj7-8cjw-p6xm`) remains in
`eslint-config-next > @next/eslint-plugin-next > fast-glob > micromatch > braces`.

GitHub Actions run `38490587242` passed frozen install, formatting, lint,
TypeScript, all tests and production build. Its dependency-audit gate failed on
the same existing advisory, so its subsequent tracked-secret step was skipped.
A separate local tracked-source pattern scan found no literal credential
patterns. Netlify Deploy Preview `6acecd2d4e4ec2c5c72c481d` is Ready on the exact
current head; the Next.js plugin succeeded and Netlify's regular and enhanced
secret scans found no matches across 477 files.

The protected preview requires Netlify team SSO for non-production deploys.
Authenticated Finance UI inspection remains NOT TESTED. The founder's prior
read-only owner-account inspection applies to the earlier Finance routes; the
new overview and bill register have source/automated evidence only.

The previously recorded owner-browser review was read-only. No production or
shared tenant Finance records were created, modified, reversed or reconciled.
