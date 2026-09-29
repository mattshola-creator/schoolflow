# ADR-0015: Protected staff attendance UI

- Status: Accepted for M8-B2
- Date: 28 September 2026

## Decision

Staff attendance receives two feature-gated server-rendered routes: a clock
workspace and a working-hours setup page. Both reuse the existing attendance
module, `attendance.staff_clock` feature, active tenant/school context and
operation-specific permissions.

The clock page obtains assignments through a caller-bound read RPC. The RPC
uses the M8-B1 assignment authorization helper, so self-service returns only
the linked staff assignment while authorized school-wide recorders may receive
other active assignments. It returns the effective position override or school
default policy and the current derived day state without granting unrelated
Staff-module visibility.

Clock occurrence time is generated on the server action. The browser submits
only the assignment, event kind, idempotency key and optional bounded note.
The M8-B1 record RPC remains authoritative for date, order, policy, employment,
assignment, authorization and idempotency checks.

Policy setup requires `attendance.configure`. It supports one active school
default and optional active position overrides using the existing effective-
dated policy table and RLS controls.

## Consequences

- Disabled organizations cannot load either route or invoke the mutations.
- Historical dates are read-only in the clock UI.
- The responsive layout uses stacked cards and full-width mobile actions, with
  no page-wide horizontal table.
- M8-B2 does not add correction, absence, permission, reporting or Action
  Center workflows.
- The feature remains disabled and no production clock event is created.
