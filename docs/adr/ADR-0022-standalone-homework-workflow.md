# ADR-0022: Standalone homework workflow

- Status: Accepted for M8-E6
- Date: 30 September 2026

## Decision

Homework assigned to learners is a standalone, school-scoped academic record.
It is distinct from the optional `homework` note on lesson delivery, which
remains historical evidence of what a teacher recorded during a delivered
lesson.

Each homework assignment is derived from an authorized subject teaching
assignment and carries its session, optional academic period, subject, class,
assigned date, due date and lifecycle. Optional links to lesson delivery and
curriculum preserve traceability without making either prerequisite mandatory.

M8 supports draft, publish, close and cancel. Submission, grading, learner and
guardian access, reminders and messaging are outside this slice. Those later
experiences must reuse this record instead of copying it.

## Security and integrity

- `academics.homework.manage`, the academics entitlement and the disabled-by-
  default `academics.teaching_management` feature gate are all required.
- The server re-resolves the teaching assignment and derives subject/class
  scope; browser-supplied scope is not trusted.
- Composite foreign keys and a validation trigger reject cross-school,
  cross-session, cross-assignment and invalid-date links.
- Authenticated clients receive only explicit SELECT, INSERT and UPDATE column
  grants. RLS is enabled; there is no delete policy or delete grant.
- Publication is a separate explicit transition and audit events retain the
  actor and state change.

## Consequences

Teachers can prepare homework independently of a lesson plan or delivery while
retaining optional curriculum and delivery traceability. Production remains
disabled and empty until a separately authorized verification session.
