# ADR-0017: Staff attendance summaries and exceptions

- Status: Accepted for M8-B6

Staff attendance exceptions are materialized only by an explicit,
caller-authorized refresh after the effective working day has ended in the
school's configured IANA timezone. The refresh requires both attendance-summary
and Action Center task-management access; it does not run implicitly while a
page is read.

One exception may exist for each assignment, school date and missing-clock
kind. A unique constraint makes repeated refreshes idempotent. Each exception
owns at most one high-priority Action Center task. A later valid clock event,
approved full-day time-off outcome or equivalent resolved state closes the
exception and completes its still-open task without deleting history.

Only scheduled working days are evaluated. Non-teaching calendar exceptions
and approved requests covering the complete effective policy interval are
excused and cannot produce missing-clock tasks. Partial permissions do not
suppress the normal clock requirement.

The summary and refresh functions are caller-bound, use exact organization and
school predicates, expose no protected leave details and keep anonymous access
revoked. The feature remains disabled by default in production.
