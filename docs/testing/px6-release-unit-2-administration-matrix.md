# PX6 Release Unit 2 Administration acceptance matrix

| Area                     | Evidence                                                                                        | Result                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Route guard              | Existing `organization.view`, Foundation entitlement and authorization-inspection feature       | PASS automated/source review                         |
| Context consistency      | Active organization/school must equal authorization snapshot before querying                    | PASS implementation; preview review pending          |
| Membership scope         | Organization counts use organization memberships; school counts use selected-school memberships | PASS implementation                                  |
| Invitations              | Pending records are RLS-authorized, scope-filtered and bounded                                  | PASS implementation                                  |
| Role assignments         | RLS-authorized active assignments; school view includes organization and selected-school scope  | PASS implementation                                  |
| Profile privacy          | No new profile-read capability; member references are privacy-limited                           | PASS focused test                                    |
| Effective access         | Human-readable permission groups derive from the existing snapshot                              | PASS focused test                                    |
| Module availability      | Existing permission, entitlement, module and feature evaluator reused                           | PASS focused test                                    |
| Permission denial        | Member/role sections explain unavailable information without querying a privileged path         | PASS focused component test                          |
| Platform boundary        | No Platform Console, subscription, entitlement or rollout mutations                             | PASS changed-file review                             |
| Loading/error states     | Route-level honest loading and retry states                                                     | PASS implementation                                  |
| Responsive/accessibility | Responsive cards, semantic regions and existing focus system                                    | PASS automated/source review; manual preview pending |
| Schema/RLS/data          | No migration, policy or production-data change                                                  | PASS changed-file review                             |
| Founder acceptance       | Protected preview reviewed and accepted                                                         | PENDING                                              |

## Known limitation

Invitation creation/delivery and general role/membership mutation are not
included because no complete server-authorized domain contract exists in the
current production architecture. Direct browser writes were not introduced.
