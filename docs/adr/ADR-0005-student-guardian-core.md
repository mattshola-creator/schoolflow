# ADR-0005: Student and guardian core

- Status: Accepted
- Date: 13 September 2026

## Decision

Student identity is organization-owned through `Person` and `StudentProfile`. School participation is represented by historical `StudentEnrollment` rows, and placement by dated `ClassMembership` rows. Class changes end the current membership and create another; they do not rewrite history.

Guardian relationships link a guardian `Person` to a student and retain effective dates, relationship type, primary-contact, portal-access and financial-responsibility attributes. Similar identity data is never auto-merged.

Student visibility is derived from an authorized enrollment school. Every exposed M4 table has RLS, and creation uses a caller-bound atomic RPC that validates membership, school scope, permission, module entitlement and feature state. Direct delete access is withheld from historical student records.

Import preview is a separate persisted batch/row model. Validation and duplicate warnings are stored atomically, while execution remains a later explicitly confirmed workflow.

## Consequences

- A student can retain one permanent organization identity while moving between schools or returning later.
- School-scoped staff see only students enrolled in schools within their effective assignment.
- Academic sessions, levels and arms remain authoritative M3 references.
- M6 can add audit events and document records without changing student identity ownership.
