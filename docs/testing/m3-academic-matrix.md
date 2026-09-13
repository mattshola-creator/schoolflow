# M3 Academic Foundation verification matrix

| Area          | Allowed proof                                                    | Denied/invariant proof                                                |
| ------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Session       | Authorized school admin creates a valid current session          | Invalid dates, overlap and conflicting current state rejected         |
| Period        | Ordered period inside its current session                        | Outside-session, overlapping and cross-session relationships rejected |
| Structure     | Configurable section, level and custom-named arm                 | Duplicate level/order and cross-school relationships rejected         |
| Subject       | Atomic subject plus optional level applicability                 | Duplicate name/code, foreign level and unauthorized caller rejected   |
| Lock          | Authorized lock and history-preserving release                   | Locked direct mutation and lock-history alteration rejected           |
| Authorization | School-scoped viewer reads its own structure                     | Viewer mutation, non-member and cross-organization UUID access denied |
| Entitlement   | Entitled + permitted + enabled feature succeeds                  | Disabled academic entitlement prevents read/write capability          |
| Setup         | Persisted records derive fresh, partial, ready and locked states | No client-writable completion flag exists                             |

Remote tests run inside transactions and roll back every fixture. The application journey uses disposable QA identities and removes them after live verification.
