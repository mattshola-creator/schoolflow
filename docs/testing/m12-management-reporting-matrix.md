# M12 Management & Reporting acceptance matrix

Status at implementation checkpoint: implemented, migration applied, local gate passing; release/production QA evidence pending.

| Area                     | Acceptance criterion                                                              | Evidence                                                          | State                 |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------- |
| Scope                    | Single-school dashboard is caller/school scoped                                   | `can_access_reporting`, `reporting_scope`, `management_dashboard` | Passed locally        |
| Scope                    | Multi-school totals require permission for every requested school                 | Per-school cross-school loop and contract test                    | Passed locally        |
| Scope                    | Partial management-group scope excludes unauthorized schools and totals           | Caller-bound scope RPC; production probe pending                  | Pending production QA |
| Students/admissions      | Active enrollment and workflow-state summaries are deterministic                  | SQL definitions and known-fixture QA pending                      | Passed locally        |
| Attendance               | Present/late/absent counts and defined rate                                       | Metric unit tests                                                 | Passed locally        |
| Staff/teaching           | Active assignments and operational teaching counts only                           | SQL definitions                                                   | Passed locally        |
| Finance                  | Exact billed, collected, outstanding, expense, and income values                  | Numeric SQL plus exact minor-unit test                            | Passed locally        |
| Results                  | Published snapshots only; stored pass/grade outcomes                              | Snapshot JSON aggregation contract                                | Passed locally        |
| Communication            | Notice/read metadata only; no message bodies                                      | Scoped aggregate review                                           | Passed locally        |
| Operations               | Open/overdue tasks and pending lesson-plan attention                              | Scoped aggregate review                                           | Passed locally        |
| Search                   | Students, applicants, staff, guardians, receipts, and documents; permission-aware | Bounded scoped RPC                                                | Passed locally        |
| Export/print             | CSV reauthorizes scope; printable browser view                                    | Route/build and export audit RPC                                  | Passed locally        |
| Academic close           | Current-only close, locks, audit evidence                                         | Transactional RPC rehearsal                                       | Passed locally        |
| Rollover                 | Closed source, idempotent planned target, draft fee copies                        | Transactional RPC rehearsal                                       | Passed locally        |
| Authorization            | Granular permissions and five feature gates                                       | Production catalog verification                                   | Passed                |
| RLS                      | Access-event table has RLS; direct API insertion revoked                          | Migration contract and production catalog                         | Passed                |
| Privacy                  | No private messages, auth metadata, raw paths, or report payloads in audit        | Design review                                                     | Passed locally        |
| Performance              | Server aggregation, explicit scope/date predicates, bounded range/search, index   | Query-plan production review pending                              | Pending production QA |
| Responsive/accessibility | Cards, controlled layouts, semantic filters/results, print behavior               | Browser acceptance pending                                        | Pending production QA |
| Regression               | Full suite ≥266; lint/typecheck/build                                             | 276 tests across 62 files; local build passed                     | Passed locally        |
| Release                  | PR, CI, exact Netlify revision, health                                            | Pending                                                           | Pending release       |
| Safety                   | Overrides disabled, QA sessions zero, owner/evidence preserved                    | Pending final verification                                        | Pending closeout      |
