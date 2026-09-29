# ADR-0020: Curriculum coverage

- Status: Accepted for M8-E3

Curriculum items are ordered subject units attached to an existing subject
teaching assignment in the same organization, school, academic session, class
scope and subject. The server derives that scope from the authorized assignment;
it does not trust duplicated form identifiers.

Planned dates remain within the academic session and, when selected, its
academic period. Coverage progresses through planned, in-progress, completed,
deferred or cancelled states. Completion requires a date. Records are updated
or cancelled rather than deleted, and every write enters the shared audit trail.

Curriculum viewing and management use separate existing permissions behind the
disabled teaching-management feature. This phase does not create lesson plans,
lesson-delivery evidence, homework, or production curriculum data.
