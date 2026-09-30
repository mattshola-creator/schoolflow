# M9 Finance acceptance matrix

| Phase | Requirement                                                               | Evidence                                                                   | Status  |
| ----- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------- |
| A     | Finance permissions, module features and deny-by-default capability check | `m9_finance` migration; RLS enabled with 2–3 policies per foundation table | Passed  |
| A     | School-scoped fee catalogue and student categories                        | Composite school/organization foreign keys and unique school codes         | Passed  |
| A     | Effective-dated fee structures and exact money                            | `numeric(14,2)`, session/period validation, draft-only ordinary updates    | Passed  |
| A     | Transactional structure plus first item                                   | `create_fee_structure` RPC and rollback-on-error semantics                 | Passed  |
| A     | Entitlement-aware responsive UI                                           | `/finance`, capability navigation and server authorization                 | Passed  |
| A     | Automated regression                                                      | 244 tests passing; strict TypeScript passing                               | Passed  |
| B     | Student billing, preview, idempotency and historical snapshots            | Pending                                                                    | Pending |
| C–E   | Payments, verification, allocation, balances and receipts                 | Pending                                                                    | Pending |
| F–H   | Expenses, cashier/reconciliation and reports                              | Pending                                                                    | Pending |
| I     | End-to-end deployment and production QA                                   | Pending                                                                    | Pending |
