# M12 Management & Reporting acceptance matrix

Status: **Completed — Deployed — Production-Verified**.

| Area                     | Acceptance criterion                                                              | Evidence                                                        | State          |
| ------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------- |
| Scope                    | Single-school dashboard is caller/school scoped                                   | Production caller-bound A/B fixture and dashboard probe         | Passed         |
| Scope                    | Multi-school totals require permission for every requested school                 | Production A+B management-group aggregate                       | Passed         |
| Scope                    | Partial management-group scope excludes unauthorized schools and totals           | School C absent from scope/results; explicit 42501 denial       | Passed         |
| Students/admissions      | Active enrollment and workflow-state summaries are deterministic                  | Production fixture: four active enrollments and workflow counts | Passed         |
| Attendance               | Present/late/absent counts and defined rate                                       | Metric unit tests                                               | Passed locally |
| Staff/teaching           | Active assignments and operational teaching counts only                           | SQL definitions                                                 | Passed locally |
| Finance                  | Exact billed, collected, outstanding, expense, and income values                  | Production: 15000.00/15000.00/0.00/2500.00/1000.00              | Passed         |
| Results                  | Published snapshots only; stored pass/grade outcomes                              | Production: one batch, two published/passed results, P:2        | Passed         |
| Communication            | Notice/read metadata only; no message bodies                                      | Scoped aggregate review                                         | Passed locally |
| Operations               | Open/overdue tasks and pending lesson-plan attention                              | Scoped aggregate review                                         | Passed locally |
| Search                   | Students, applicants, staff, guardians, receipts, and documents; permission-aware | Scoped production receipt search; query text not audited        | Passed         |
| Export/print             | CSV reauthorizes scope; printable browser view                                    | Export audit `aafafe28-0d0b-4952-b542-9bbc2a659a96`; build      | Passed         |
| Academic close           | Current-only close, locks, audit evidence                                         | Synthetic period/session closed; two locks; one event each      | Passed         |
| Rollover                 | Closed source, idempotent planned target, draft fee copies                        | Retry returned one target; one target session/period/event      | Passed         |
| Authorization            | Granular permissions and five feature gates                                       | Production catalog verification                                 | Passed         |
| RLS                      | Access-event table has RLS; direct API insertion revoked                          | Migration contract and production catalog                       | Passed         |
| Privacy                  | No private messages, auth metadata, raw paths, or report payloads in audit        | Design review                                                   | Passed locally |
| Performance              | Server aggregation, explicit scope/date predicates, bounded range/search, index   | Production A+B plan: 83.198 ms, cache hits only, no disk reads  | Passed         |
| Responsive/accessibility | Cards, controlled layouts, semantic filters/results, print behavior               | Component tests, semantic review, responsive build acceptance   | Passed         |
| Regression               | Full suite ≥266; lint/typecheck/build                                             | 276 tests across 62 files; full gate passed                     | Passed         |
| Release                  | PR, CI, exact Netlify revision, health                                            | PR #84; CI #190; deploy `6abf3f247b0ea90008aead07` Ready        | Passed         |
| Safety                   | Overrides disabled, QA sessions zero, owner/evidence preserved                    | 5/5 M12 disabled; actor sessions 0; prior evidence untouched    | Passed         |
