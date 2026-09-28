# ADR-0014: Caller-bound staff clock events

- Status: Accepted for M8-B1
- Date: 28 September 2026

## Decision

Staff attendance uses an append-only clock-event ledger and one derived daily
summary per staff assignment and local school date. Clock events retain their
original occurrence time. An authorized correction appends the previous and
replacement times, reason and actor; it never rewrites the original event.

The caller-bound functions resolve the authenticated actor and repeat feature,
module, tenant, school, employment, assignment and permission checks. Linked
staff may record their own event when they hold `attendance.staff.record`.
Broader recording and correction require the separate
`attendance.staff.record_all` and `attendance.staff.correct_all` permissions.

The effective position policy takes precedence over the school default. It is
snapshotted into the daily summary so later policy changes do not rewrite
historical attendance meaning. Clock-out requires an earlier clock-in, duplicate
event types are rejected, and an idempotency key makes retries safe without
creating a second event.

Direct table mutation is denied. Authenticated clients receive scoped SELECT
only; all event and correction writes occur through the security-definer
functions and are audited.

## Consequences

- Original clock evidence and correction history remain independently auditable.
- Self-service does not imply access to another staff member's record.
- Daily status is derived from the effective times and policy snapshot.
- The feature remains disabled by default in M8-B1.
- M8-B1 adds no user interface and creates no production clock event.
