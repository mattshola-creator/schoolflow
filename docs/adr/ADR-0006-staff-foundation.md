# ADR-0006: Staff identity, employment and school assignments

## Status

Accepted — 14 September 2026

## Context

SchoolFlow must preserve a staff member's identity and employment history while supporting dated assignments to different schools, configurable departments and positions, reporting lines, and optional application access. Staff exit must not erase attribution or remove unrelated access such as a guardian identity.

## Decision

- `staff_profiles` is an organization-owned staff identity linked to the shared `people` record.
- `employments` records the effective-dated organization employment relationship and may link an existing Supabase Auth user.
- `staff_assignments` records the effective-dated school, department, position, reporting line and optional role-assignment relationship.
- Departments and positions are school-specific. Composite foreign keys prevent organization/school identifiers from being mixed across records.
- Creation is atomic through a caller-bound RPC. A user account is never created implicitly; an authorized administrator may link an existing active organization member and role.
- Transfer atomically ends the prior assignment, creates the destination assignment and moves only the linked school role when one exists.
- Employment exit preserves all history and ends only role assignments explicitly linked through staff assignments. Organization membership and unrelated roles are not inferred to be staff access and are not revoked.
- M2 permission, entitlement and feature evaluation remains authoritative. Staff RLS requires valid school scope, `staff` entitlement and `staff.staff_records` feature state.
- API roles receive only explicit table privileges. Historical tables provide no delete capability.

## Consequences

Later attendance, payroll, timetable and performance modules can reference durable staff and assignment identifiers without owning the employment lifecycle. Transfers and exits remain auditable. Operational staff access must be explicitly linked to an assignment to be lifecycle-managed automatically.
