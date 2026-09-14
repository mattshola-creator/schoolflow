# M5 Staff Foundation verification matrix

| Area             | Allowed proof                                                                           | Denied/invariant proof                                                                      |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Staff identity   | Authorized owner creates Person, staff profile, employment and assignment atomically    | Non-member creation and direct-ID visibility denied                                         |
| School structure | Authorized school admin creates configurable departments and positions                  | Composite keys reject cross-school department/position relationships                        |
| Employment       | Active dated employment and staff number uniqueness persist                             | Tenant identity fields are not client-updatable; historical delete privilege is absent      |
| Assignment       | Active school assignment references matching employment, profile and position           | Cross-tenant scope and invalid reporting relationships are rejected                         |
| Transfer         | Atomic transfer ends the prior assignment and starts the destination assignment         | Caller must manage both source and destination schools; invalid destination is denied       |
| Access linkage   | Privacy-limited candidate RPC exposes only active members to authorized access managers | Non-members receive no candidate data and cannot assign themselves access                   |
| Exit             | Authorized exit ends employment and active/planned assignments                          | Only explicitly staff-linked roles are revoked; unrelated membership/access is preserved    |
| Entitlement      | Entitled + permitted + enabled staff capability succeeds                                | Missing membership, permission, entitlement or feature state denies through M2 evaluator    |
| RLS/grants       | Authorized school reads and writes the approved rows/columns                            | `anon` has no table privileges; API roles cannot DELETE/TRUNCATE or rewrite tenant identity |

Remote tests used rollback-only fixtures. The permanent owner Auth record was neither changed nor used as disposable data; all staff, tenant and school fixtures were rolled back.
