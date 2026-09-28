# ADR-0010: Atomic student attendance registers

- Status: Accepted for M8-A2
- Date: 28 September 2026

## Decision

Student attendance is stored as one morning or closing register for a school,
session, class level, optional class arm and teaching day. Submission is atomic:
the caller-bound database function validates the full effective class roster,
enabled statuses, calendar policy, lock window, feature entitlement and either a
matching teaching assignment or an explicit school-wide permission before it
creates the register and every entry.

Clients supply a UUID idempotency key. Replaying the same canonical request
returns the original register; reusing the key for different content is rejected.
Authenticated roles have read-only table grants. Register and entry creation and
entry correction are available only through the checked functions.

Corrections append an immutable reasoned history row before updating the current
entry status. Before the lock time, record permission is sufficient; at or after
the lock time, correction permission is required. Tenant-scoped foreign keys,
RLS and the existing protected audit trigger apply throughout.

## Consequences

- Partial class registers and duplicate student entries are rejected.
- A failed submission rolls back the register and all entries together.
- Direct event-table writes and correction-history mutation are unavailable to
  authenticated clients.
- Schools without class arms remain supported.
- The student attendance feature remains disabled by default. M8-A2 adds no UI,
  enables no tenant and records no production attendance.
