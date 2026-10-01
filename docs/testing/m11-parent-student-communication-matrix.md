# M11 Parent / Student / Communication Acceptance Matrix

## Durable checkpoint — 2026-10-01

- Phase: M11-A–M11-I implemented locally; release/production acceptance pending.
- Branch: `feat/m11-parent-student-communication`.
- Base: completed M10 local checkpoint `11c355e`; production M10 merge `7005180cb4d1840e5a840901ac4d590f38806aef`.
- Migration: `20261001173322_m11_parent_student_communication.sql`.
- Migration state: production rollback rehearsal passed; not applied.
- Tests: 265 passing across 59 files.
- Formatting/lint/TypeScript: passed.
- Production build/security audit/secret scan: pending.
- PR/CI/merge/deploy: pending.
- Production QA: not started; no M11 fixtures exist.
- Feature overrides: no M11 overrides enabled.
- Safety: permanent owner and M7–M10 evidence untouched.
- Exact next task: complete build/security gates, review migration, commit, push and open PR.

Production QA initially found PostgreSQL enum coercion in the M6 notification
insert paths. The fixture batch rolled back before evidence persisted. Additive
migration `m11_notification_enum_fix` explicitly casts both notice and message
notification kinds and passed its rollback rehearsal.

The next synthetic read found that M10 stores snapshot learner keys as
`student_id`. The original portal predicate used `studentId` and would have
returned the complete class snapshot if corrected only at the predicate. The
additive `m11_portal_result_isolation` migration recognizes the authoritative
key and projects a one-learner result array, preserving immutable batch metadata
without exposing classmates.

## Acceptance criteria

| Area                     | Evidence                                                           | Status      |
| ------------------------ | ------------------------------------------------------------------ | ----------- |
| Guardian identity        | Account links to existing person; no duplicate guardian identity   | Implemented |
| Student identity         | Account links to student person                                    | Implemented |
| Relationship scope       | Active `has_portal_access` relationship required                   | Implemented |
| Student self scope       | Student person must match requested learner                        | Implemented |
| Multiple learners        | Portal context returns every authorized linked learner             | Implemented |
| Unrelated learner denial | `portal_can_access_student` rejects missing relationship           | Implemented |
| Published results        | Read model uses only `result_publications` snapshots               | Implemented |
| Draft/internal denial    | Score/review tables are absent from portal read path               | Implemented |
| Attendance               | Student-scoped M8 summary                                          | Implemented |
| Finance                  | Student-scoped M9 billed/paid summary                              | Implemented |
| Information center       | Targeted published/expiring notices                                | Implemented |
| Messaging                | Participant-only idempotent thread messages                        | Implemented |
| Notifications            | M6 notifications with recipient/event deduplication                | Implemented |
| Attachments              | Notice/message links reuse private M6 documents                    | Implemented |
| Preferences              | In-app and future-channel preferences represented                  | Implemented |
| Permissions              | Granular account/notices/messages permissions                      | Implemented |
| Entitlements             | Five M11 feature gates                                             | Implemented |
| RLS                      | All ten M11 tables have policies                                   | Implemented |
| Audit                    | Portal linkage, notices, audiences, threads and messages audited   | Implemented |
| Mobile/accessibility     | Card-first portal, semantic headings, labeled forms, touch targets | Implemented |
| PostgreSQL validation    | Full migration rollback rehearsal against production schema        | Passed      |
| Automated suite          | 265 tests / 59 files                                               | Passed      |
| Production acceptance    | Migration, deploy and synthetic lifecycle                          | Pending     |
