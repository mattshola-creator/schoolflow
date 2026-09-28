# ADR-0009: Attendance and teaching-scope foundation

- Status: Accepted for M8-A1
- Date: 28 September 2026

## Decision

M8 uses the existing organization and school context, academic structure, staff
assignment, authorization, entitlement and audit foundations. Teaching scope is
effective-dated by staff school assignment, academic session, class level,
optional class arm and optional subject. It is established before teachers can
record attendance, so a temporary school-wide teacher permission is never
required.

Student attendance uses fixed canonical statuses. Morning registration remains
mandatory; closing registration is school-configurable and disabled by default.
School settings define the lock window and enabled status subset. School calendar
exceptions prevent non-teaching days from generating false operational gaps.
Staff attendance policy has one school default with optional position-specific
overrides.

M8-A1 contains policy and scope only. It creates no attendance registers, entries,
clock events, timetable records, lessons, homework or production data. All new
tables use school-scoped foreign keys, RLS and granular permission, module and
feature checks. New M8 features default to disabled until their workflows are
implemented and separately accepted.

## Consequences

- Teacher access can later be constrained to an effective assignment.
- Schools without class arms remain supported.
- Attendance and teaching workflows can be enabled independently.
- Historical assignment and policy state is retained.
- A later M8 phase must add caller-bound atomic attendance mutations and audited
  correction records before any attendance UI is enabled.
