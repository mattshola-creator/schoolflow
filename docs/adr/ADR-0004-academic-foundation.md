# ADR-0004: School-scoped academic foundation

- Status: Accepted
- Date: 13 September 2026

## Context

SchoolFlow must support different academic structures in schools belonging to the same organization. Later enrollment, attendance, timetable, assessment and results records require stable academic identifiers and consistent lock semantics.

## Decision

- Sessions, periods, sections, class levels, class arms, subjects and subject applicability are owned by both `organization_id` and `school_id`; composite foreign keys prevent cross-school relationships.
- Period counts and labels are configurable. Nigerian terms and common level names are usability defaults only, never global enums.
- Class levels and arms are separate. Optional sections group levels without making a section mandatory.
- Subjects are school-owned; level applicability records carry core/elective classification so one subject can vary by level.
- Current session/period state is unique per school and changed through caller-bound atomic functions. Date ranges and overlap rules are database-enforced.
- Academic locks are append-oriented records with school, session or period scope. Database triggers reject affected mutations, and releases preserve who, when and why.
- Setup readiness is derived in one domain service from persisted records; clients cannot set a cosmetic completion flag.
- Every exposed academic table uses M1 membership/scope, M2 permission, module entitlement and feature-state checks in RLS. Product users deactivate/archive historical structures rather than deleting them.

## Consequences

Later modules reference these identifiers rather than defining their own class, subject or period tables. They must also consult the applicable academic lock before mutation. Audit instrumentation remains owned by the M6 shared audit milestone.
