# M11 Parent / Student / Communication Acceptance Matrix

## Final checkpoint — 2026-10-01

- Status: **Completed — Deployed — Production-Verified**.
- Phases: M11-A through M11-J complete; M12 not started.
- PRs: #78 primary implementation; #79 notification enum correction; #80
  portal result isolation; #81 caller-bound portal RLS predicates; #82 notice
  read-state authorization; final documentation PR recorded at closeout.
- Production migrations: `m11_parent_student_communication`,
  `m11_notification_enum_fix`, `m11_portal_result_isolation`,
  `m11_portal_rls_helper_fix`, and `m11_notice_read_rls_fix`.
- Tests: 266 passing across 59 files.
- Gate: formatting, zero-warning lint, strict TypeScript, production build,
  production dependency audit and secret-pattern scan passed.
- Production QA: dedicated synthetic portal identities, relationship, notice,
  thread, message, notification, read-state and preference evidence persisted.
- Safe state: all five M11 overrides disabled; synthetic actors have zero active
  sessions; M9/M10 overrides remain disabled; owner and M7–M10 evidence untouched.

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

An authenticated-role RLS probe then identified that policies invoked a private
helper whose execution was intentionally revoked. Additive migration
`m11_portal_rls_helper_fix` keeps private helpers inaccessible and routes policy
evaluation through caller-bound public predicates for notices and threads.

The final authenticated write probe found the same revoked-private-helper issue
in the notice read-state policy. Additive migration `m11_notice_read_rls_fix`
routes its `WITH CHECK` expression through the public caller-bound notice
predicate. Rollback rehearsal, application, focused contract test and live
authenticated read-state persistence all passed.

## Acceptance criteria

| Area                     | Evidence                                                             | Status |
| ------------------------ | -------------------------------------------------------------------- | ------ |
| Guardian identity        | Synthetic account maps to the existing guardian person               | Passed |
| Student identity         | Synthetic account maps to the learner person                         | Passed |
| Relationship scope       | Linked learner allowed; unrelated learner denied                     | Passed |
| Student self scope       | Self allowed; second synthetic learner denied                        | Passed |
| Multiple learners        | Relationship-derived learner collection is deterministic             | Passed |
| Unrelated learner denial | Authenticated RPC and RLS probes deny missing relationships          | Passed |
| Published results        | One-learner immutable `result_publications` projection               | Passed |
| Draft/internal denial    | Portal path contains no score/review tables                          | Passed |
| Attendance               | Student-scoped M8 summary returned without staff metadata            | Passed |
| Finance                  | Student-scoped billed/paid/balance summary only                      | Passed |
| Information center       | Targeted notice visible; unrelated authenticated actor sees zero     | Passed |
| Messaging                | One participant thread/message; retry preserves one message          | Passed |
| Notifications            | Two notice + one message notifications; retry creates no duplicate   | Passed |
| Attachments              | Private M6 document FKs plus audience/participant RLS; outsider zero | Passed |
| Preferences              | Optional in-app preference persisted; mandatory notice retained      | Passed |
| Permissions              | Granular staff communication permissions enforced                    | Passed |
| Entitlements             | Five enabled/disabled gates tested; final state disabled             | Passed |
| RLS                      | Ten tables; linked/self allowed and unrelated actor sees zero        | Passed |
| Audit                    | 10 scoped synthetic lifecycle events; no message bodies logged       | Passed |
| Mobile/accessibility     | Card-first responsive layout and semantic/form interaction tests     | Passed |
| PostgreSQL validation    | Full migration rollback rehearsal against production schema          | Passed |
| Automated suite          | 266 tests / 59 files                                                 | Passed |
| Production acceptance    | Migration, exact-revision deploy and synthetic lifecycle             | Passed |
