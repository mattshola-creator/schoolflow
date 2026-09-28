# ADR-0013: Protected attendance policy setup

- Status: Accepted for M8-A5 prerequisite
- Date: 28 September 2026

## Decision

Student attendance cannot be used until a school-scoped attendance policy has
been created. The `/attendance/setup` route uses the existing attendance module,
feature gate, active tenant/school context and `attendance.configure` permission.
It does not create a parallel authorization path.

The setup action validates the lock window, enabled status set, attendance days
and related policy invariants before making one caller-bound insert or update.
Database RLS repeats the feature, tenant, school and permission checks and binds
the creating/updating actor to `auth.uid()`.

The student-register feature remains disabled by default. A QA administrator may
temporarily enable it solely to establish policy, save the policy through the
authenticated application path, then disable it before any attendance register
is submitted.

## Consequences

- Missing policy remains a fail-closed state for register submission.
- Configuration uses the real authenticated actor and existing RLS policies.
- Public errors remain generic and a failed write is not retried.
- Policy setup and attendance-event QA remain separately controlled checkpoints.
