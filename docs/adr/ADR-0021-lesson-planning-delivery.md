# ADR-0021: Lesson planning and delivery records

- Status: Accepted for M8-E4 foundation

Lesson plans and lesson delivery are separate records. A school can use lesson
plans, delivery evidence, or both without manufacturing a plan merely to record
what was taught. Both records inherit organization, school, session, subject and
class scope from an authorized subject-teaching assignment. Optional curriculum
links must belong to the same assignment.

Lesson-plan review is a controlled state transition. Submission uses the lesson
plan management permission, while approval and rejection require the separate
approval permission. Rejection requires a bounded review comment. Database
triggers derive reviewer identity and timestamps, and prevent clients from
self-approving by submitting reviewer fields.

Delivery evidence captures the date, topic, curriculum coverage, classwork,
homework and teacher reflection requested by the PRD. All writes use the shared
audit trigger. Neither table exposes delete access. Both remain behind the
disabled teaching-management feature, and this phase creates no production
lesson data.
