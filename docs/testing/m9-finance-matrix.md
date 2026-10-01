# M9 Finance acceptance matrix

| Phase | Requirement                                                               | Evidence                                                                                                 | Status  |
| ----- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------- |
| A     | Finance permissions, module features and deny-by-default capability check | `m9_finance` migration; RLS enabled with 2–3 policies per foundation table                               | Passed  |
| A     | School-scoped fee catalogue and student categories                        | Composite school/organization foreign keys and unique school codes                                       | Passed  |
| A     | Effective-dated fee structures and exact money                            | `numeric(14,2)`, session/period validation, draft-only ordinary updates                                  | Passed  |
| A     | Transactional structure plus first item                                   | `create_fee_structure` RPC and rollback-on-error semantics                                               | Passed  |
| A     | Entitlement-aware responsive UI                                           | `/finance`, capability navigation and server authorization                                               | Passed  |
| A     | Automated regression                                                      | 244 tests passing; strict TypeScript passing                                                             | Passed  |
| B     | Student billing, preview, idempotency and historical snapshots            | `m9_student_billing`; immutable invoice/charge snapshots and unique structure-item enrollment constraint | Passed  |
| C     | Manual payment recording and server-authorized verification               | `record_payment`/`verify_payment`; caller-bound RPCs, idempotency and segregation setting                | Passed  |
| D     | Transactional allocation, partial payments and deterministic balances     | `allocate_payment`; exact numeric checks, row locks and derived balance views                            | Passed  |
| E     | Stable receipts and authorized reprint                                    | Immutable receipt number, school/student/allocation snapshots and one receipt per payment                | Passed  |
| F     | Expense submission, approval, evidence-backed payment and completion      | Expense lifecycle RPCs, document FK and append-only audit events                                         | Passed  |
| G     | Cashier close, handover and manual reconciliation                         | Locked close/reconcile/handover RPCs, variance evidence and immutable links                              | Passed  |
| H     | Finance reports and other income                                          | Security-invoker school-scoped summaries, balance reports and idempotent income records                  | Passed  |
| I     | Automated integration and regression gate                                 | 247 tests passing; lint and strict TypeScript passing                                                    | Passed  |
| I     | Deployment and controlled production QA                                   | Awaiting application PR, production deploy and synthetic acceptance journey                              | Pending |

## Integrity and boundary evidence

- All authoritative monetary columns use PostgreSQL `numeric(14,2)` and UI schemas reject more than two decimal places.
- Repeated billing and income/payment recording use school-scoped idempotency keys or immutable uniqueness constraints.
- Payment reversal retains the original payment, allocations and receipt, appends reversal evidence and excludes reversed allocations from derived balances.
- All Finance tables use organization/school foreign keys and RLS. Public report/balance views use `security_invoker = true`.
- Payroll, general ledger, gateways, bank APIs, automated bank reconciliation, procurement, tax, budgeting, multi-currency settlement and external accounting integrations remain outside M9.
