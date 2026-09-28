# ADR-0012: Controlled student attendance corrections

- Status: Accepted for M8-A4
- Date: 28 September 2026

## Decision

Submitted student registers remain read-only. An actor whose effective
authorization includes `attendance.student.correct` may instead submit one
student correction at a time with a different enabled status and a mandatory
audit reason.

The correction action validates the entry identifier, replacement status and
bounded reason, then calls the existing M8-A2 correction service exactly once.
The caller-bound database function remains authoritative for feature, tenant,
school, assignment, lock-window and permission checks. It updates the current
entry and appends the prior value, replacement value, reason and actor to the
immutable correction history in one transaction.

Public failures remain generic. The browser never receives raw database errors,
and a logging, redirect or service failure cannot trigger an automatic retry.

## Consequences

- Original register submission remains immutable through the UI.
- Every status change requires a reason and produces append-only history.
- View-only users can inspect a submitted register without receiving correction
  controls.
- The existing disabled feature gate still controls both register submission
  and correction access.
- Production correction testing remains a separately authorized activity.
