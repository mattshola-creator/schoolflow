# ADR-0019: Manual timetable conflict review

- Status: Accepted for M8-E2

Timetable periods belong to one school and academic session. Manual timetable
entries reference an existing teaching assignment in the same tenant, school
and session. The database validates those relationships, applies RLS through
the existing teaching-management feature gate, and captures changes in the
shared audit trail.

The application checks every active period whose time overlaps on the same
weekday. It warns when the proposed entry double-books either the teacher or
the exact class level and arm. No entry is written on the warning path. A user
with timetable-management permission may review the clash and submit again
with explicit acknowledgement, which is retained on the entry.

This phase intentionally provides manual allocation only. It does not generate
a timetable automatically or create curriculum, lesson-delivery, or homework
records.
