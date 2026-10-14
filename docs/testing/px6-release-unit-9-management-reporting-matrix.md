# PX6 RU9 — Management and Reporting acceptance matrix

## Scope

Responsive migration of the existing M12 management dashboard and report controls. RU9 adds explicit authorized-school selection for management-group users and exposes the already supported academic session and period filters in the report form. Dashboard totals, searches, exports, close and rollover continue through the existing M12 services and RPCs.

## Evidence

| Area                               | Evidence                                                                                        | Result                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Dashboard and summary calculations | Existing M12 dashboard and metric implementations are unchanged                                 | Existing M12 matrix; automated regressions run for RU9       |
| School scope                       | UI choices come only from `reporting_scope`; M12 server RPC reauthorizes every requested school | Source/tests; authenticated multi-school browser NOT TESTED  |
| Session/period filters             | Exposes existing `loadReportingWorkspace` filter parameters and report RPC                      | Focused query parsing tests; populated browser NOT TESTED    |
| Search and CSV                     | Existing permission-aware RPC and export route unchanged                                        | Existing M12 acceptance evidence                             |
| Academic close and rollover        | Existing permission check, close lock, audit, idempotency and planned-copy RPCs unchanged       | Existing M12 acceptance evidence; no RU9 mutations performed |
| Production data                    | No production or shared-tenant records changed                                                  | PASS                                                         |

## Required founder/UAT review

- [ ] Single-school managers see only their authorized school.
- [ ] Management-group users can select authorized school subsets and see correct aggregate totals.
- [ ] Cross-school, unauthorized, invalid-session and invalid-period scope is rejected by the existing server/RPC contract.
- [ ] Report dates, session and period appear correctly on desktop and mobile.
- [ ] CSV export matches the visible authorized scope and filters.
- [ ] Academic close and rollover controls appear only to existing authorized roles; do not execute in shared QA.
