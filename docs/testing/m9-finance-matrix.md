# M9 Finance acceptance matrix

| Phase | Requirement                                                               | Evidence                                                                                                      | Status |
| ----- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| A     | Finance permissions, module features and deny-by-default capability check | `m9_finance` migration; RLS enabled with 2–3 policies per foundation table                                    | Passed |
| A     | School-scoped fee catalogue and student categories                        | Composite school/organization foreign keys and unique school codes                                            | Passed |
| A     | Effective-dated fee structures and exact money                            | `numeric(14,2)`, session/period validation, draft-only ordinary updates                                       | Passed |
| A     | Transactional structure plus first item                                   | `create_fee_structure` RPC and rollback-on-error semantics                                                    | Passed |
| A     | Entitlement-aware responsive UI                                           | `/finance`, capability navigation and server authorization                                                    | Passed |
| A     | Automated regression                                                      | 244 tests passing; strict TypeScript passing                                                                  | Passed |
| B     | Student billing, preview, idempotency and historical snapshots            | `m9_student_billing`; immutable invoice/charge snapshots and unique structure-item enrollment constraint      | Passed |
| C     | Manual payment recording and server-authorized verification               | `record_payment`/`verify_payment`; caller-bound RPCs, idempotency and segregation setting                     | Passed |
| D     | Transactional allocation, partial payments and deterministic balances     | `allocate_payment`; exact numeric checks, row locks and derived balance views                                 | Passed |
| E     | Stable receipts and authorized reprint                                    | Immutable receipt number, school/student/allocation snapshots and one receipt per payment                     | Passed |
| F     | Expense submission, approval, evidence-backed payment and completion      | Expense lifecycle RPCs, document FK and append-only audit events                                              | Passed |
| G     | Cashier close, handover and manual reconciliation                         | Locked close/reconcile/handover RPCs, variance evidence and immutable links                                   | Passed |
| H     | Finance reports and other income                                          | Security-invoker school-scoped summaries, balance reports and idempotent income records                       | Passed |
| I     | Automated integration and regression gate                                 | 248 tests passing; formatting, lint, strict TypeScript, build and dependency audit passed                     | Passed |
| I     | Deployment and controlled production QA                                   | PRs #72–73; final merge `665f668e`; Netlify `6abe43bdde3f2d000866171c`; isolated synthetic lifecycle evidence | Passed |

## Integrity and boundary evidence

- All authoritative monetary columns use PostgreSQL `numeric(14,2)` and UI schemas reject more than two decimal places.
- Repeated billing and income/payment recording use school-scoped idempotency keys or immutable uniqueness constraints.
- Payment reversal retains the original payment, allocations and receipt, appends reversal evidence and excludes reversed allocations from derived balances.
- All Finance tables use organization/school foreign keys and RLS. Public report/balance views use `security_invoker = true`.
- Payroll, general ledger, gateways, bank APIs, automated bank reconciliation, procurement, tax, budgeting, multi-currency settlement and external accounting integrations remain outside M9.

## Production acceptance evidence

- Dedicated synthetic organization `M9 Finance QA Organization`, school `M9 Finance QA School`, learner `M9-FIN-QA-001` and two synthetic QA actors are preserved as acceptance evidence.
- One repeated billing request produced one billing run and one charge. A recorder self-verification attempt was denied before an independent verifier approved the payment.
- A partial payment was allocated and receipted, then reversed without deleting history; the derived balance returned to `NGN 15,000.00`. A separate verified cash payment settled the charge to `NGN 0.00`.
- Cashier close had a `NGN 0.00` variance; one controlled handover persisted; manual reconciliation reached `reconciled`.
- The synthetic expense reached `completed` only after approval and document evidence. One other-income record persisted.
- Finance summaries returned collection, expense and student-balance rows; 25 scoped Finance audit events were present.
- Cross-tenant mutation and RLS visibility probes were denied. All six temporary Finance feature flags were restored to disabled.
- Production acceptance exposed enum CASE coercion in three RPCs. Migration `m9_finance_enum_status_fixes` was rollback-rehearsed, applied, and the complete lifecycle then passed.
- No authenticated browser QA session was opened, so no session cookie remained to sign out. The permanent owner and all M7/M8 fixtures were untouched.
