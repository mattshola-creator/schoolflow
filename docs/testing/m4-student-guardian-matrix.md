# M4 Student & Guardian Verification Matrix

| Area                     | Allowed case                                                                       | Denied/invariant case                                                                   | Evidence                                              |
| ------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Student creation         | Organization owner created identity, enrollment, placement and guardian atomically | Outsider and cross-tenant direct-ID creation rejected                                   | Remote rollback transaction passed                    |
| Student visibility       | School A owner selected its enrolled student                                       | School A owner could not select School B student; non-member selected none              | Remote RLS transaction passed                         |
| History                  | Enrollment and active placement created                                            | Historical enrollment delete affected no rows; identity-person rewrite lacked privilege | Remote RLS transaction passed                         |
| School/session integrity | Placement referenced same-school session, level and arm                            | Composite keys prevent cross-school/session relationships                               | Migration constraint rehearsal and application passed |
| Import preview           | Quoted CSV and complete rows validate; exact numbers warn                          | Missing headers and incomplete guardian tuples fail                                     | Vitest and atomic preview RPC                         |
| Secrets                  | Public client uses publishable configuration only                                  | No service-role/secret credential found in tracked source                               | Repository review                                     |

Disposable remote fixtures were created inside a transaction and rolled back. The permanent owner account was not used as a QA identity.
