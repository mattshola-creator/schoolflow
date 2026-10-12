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

| Check                                                                                                                                          | Evidence                                                                                          | Status                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Finance section navigation uses the current authorization snapshot and hides destinations with missing module, feature or permission access    | `FinanceWorkspaceNav` focused tests                                                               | PASS — automated                           |
| Unauthorized, unentitled, disabled, invalid-context and technical load states remain distinct and fail closed                                  | `FinanceUnavailableState` maps only existing authorization error reasons; focused component tests | PASS — automated                           |
| Forms use visible field labels and mobile-friendly stacked layouts; empty registers explain the state                                          | Finance route source; full lint, type and test checks                                             | PASS — source/automated                    |
| Exact-decimal validation, recorder/verifier separation, allocation, receipts, reversals, expense approvals and reconciliation remain unchanged | Existing `src/features/finance` service, schema, migration-contract tests and M9 matrix           | PASS — automated/source; no live mutations |
| Authenticated browser review of populated fee, payment, expense, cashier, report and reconciliation flows                                      | Requires protected preview and authorized QA data                                                 | NOT TESTED                                 |
| Responsive configured-state review on mobile and desktop                                                                                       | Founder visual acceptance step                                                                    | NOT TESTED                                 |
| Live Finance write workflow in isolated synthetic data                                                                                         | Requires separate isolated demo/UAT execution                                                     | NOT TESTED                                 |
| Production/shared tenant mutation                                                                                                              | Not performed                                                                                     | NONE                                       |

## Quality evidence for this branch

Local automated results after implementation: focused Finance checks **10
passed**; full regression **398 tests across 88 files passed**; formatting,
zero-warning lint and strict TypeScript passed. On implementation head
`6b07567cdb432acd1e6278c59e7454eebb5d5f59`, GitHub CI passed frozen install,
format, lint, strict TypeScript, all tests and production build. The Netlify
Deploy Preview was Ready on that exact head; the Next.js plugin passed and the
regular/enhanced secret scan checked 473 files with zero findings. A subsequent
matrix-only documentation update triggers those checks again on the latest PR
head; verify the PR and deploy status against that exact revision before
acceptance.

The protected preview requires Netlify team SSO for non-production deploys. The
review browser was redirected to Netlify Team Protection, so authenticated
Finance UI inspection remains NOT TESTED.

The local production build could not fetch Geist fonts from Google Fonts because
external network access is blocked in this workspace; the successful CI and
Netlify builds provide the independent build evidence.

The frozen-lockfile install is also blocked locally: pnpm registry requests
return `EPERM` and the workspace lacks its configured `/root/.local` store
path. GitHub CI completed the frozen install successfully. The CI dependency
audit remains non-green for the existing unsuppressed development-only
`braces@3.0.3` advisory (`GHSA-vfj7-8cjw-p6xm`), through
`eslint-config-next > @next/eslint-plugin-next > fast-glob > micromatch > braces`;
the subsequent CI tracked-secret scan is skipped after that failure. The local
tracked-source scan had no matches.
