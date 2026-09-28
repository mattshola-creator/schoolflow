# ADR-0011: Feature-gated student attendance register UI

- Status: Accepted for M8-A3
- Date: 28 September 2026

## Decision

The student attendance navigation and `/attendance` route use the existing
`attendance.student_registers` feature gate. A disabled feature is absent from
workspace navigation, and direct route access fails closed through the standard
capability guard.

The register UI lists only effective class scopes that the authenticated actor
may record. Two caller-bound read functions expose the minimum data needed by
the workflow: assigned class labels/counts and the selected roster with any
existing register state. They reuse the M8-A2 feature, tenant, school,
permission and effective teaching-assignment checks rather than granting
attendance users general student-directory or academic-setup access.

Submission continues through the single M8-A2 atomic RPC. The server action
validates the date, scope, register type, idempotency key and every roster entry,
then performs exactly one service call. Public errors remain generic. An
existing register is displayed read-only; the correction workflow is deferred
to a separately controlled phase.

## Consequences

- Teachers see only assigned, effective rosters; school-wide recorders retain
  their explicitly granted scope.
- The responsive UI supports schools with and without class arms and does not
  require horizontal tables on mobile.
- Browser resubmission carries one idempotency key, while database enforcement
  remains authoritative.
- The feature remains disabled and no production attendance is created during
  M8-A3 deployment.
