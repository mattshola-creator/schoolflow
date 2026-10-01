# M12 reporting architecture and KPI definitions

M12 is a read-oriented composition layer over the operational sources delivered by M3–M11. It creates no shadow ledger, score store, attendance store, student register, or message archive. Caller-bound RPCs validate authentication, membership, school or management-group assignment, granular permission, module entitlement, and feature state before aggregating data.

## Definitions

| Indicator             | Authoritative definition                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active enrollment     | `student_enrollments.status = active`, optionally constrained to the selected academic session.                                                                                                   |
| Applications          | Applications belonging to the selected school/session; accepted includes accepted, enrollment-pending, and enrolled workflow states.                                                              |
| Attendance entries    | Submitted student attendance entries in the selected date range. Present includes `present` and `late`; absence and lateness remain separately visible. Rate is `(present + late) / all entries`. |
| Active staff          | Active school staff assignments, not historical staff profiles.                                                                                                                                   |
| Teaching activity     | Approved lesson plans and delivered/partially-delivered lesson deliveries in the selected period/date range. It is an operational count, not a teacher-quality score.                             |
| Billed                | Non-reversed immutable student charge originals for the selected academic context.                                                                                                                |
| Collected             | Verified payments received in the selected date range/context.                                                                                                                                    |
| Outstanding           | Current authoritative student Finance balance view.                                                                                                                                               |
| Expenses              | Approved, paid, or completed expense amounts in the selected date range/context.                                                                                                                  |
| Other income          | Recorded other income in the selected date range.                                                                                                                                                 |
| Published results     | Learner-subject results extracted only from immutable M10 publication snapshots. Draft/review data is excluded.                                                                                   |
| Passed results        | Published snapshot result items whose stored authoritative `is_pass` value is true. Grades are never recomputed in M12.                                                                           |
| Promotions            | Stored M10 promotion outcomes for the selected source academic context.                                                                                                                           |
| Communication         | Published notice and notice-read metadata only. Private message bodies are excluded.                                                                                                              |
| Operational attention | Open/in-progress Action Center tasks, overdue tasks, and submitted lesson plans awaiting a decision.                                                                                              |

Money is aggregated as PostgreSQL `numeric` and returned as decimal text. The UI totals decimal strings with integer minor units; JavaScript floating point is not authoritative. Global search is capped and contextual, and excludes private message content and raw storage paths. CSV exports reauthorize the same school scope server-side and record only report type, scope, filters, actor, and time.

Term/session close writes an academic lock. Rollover requires a closed source session, is idempotent, creates a planned session and periods, and copies active fee structures forward as drafts.
