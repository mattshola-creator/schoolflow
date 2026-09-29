# ADR-0018: Teaching assignment management

- Status: Accepted for M8-E1

Teaching responsibilities use the existing effective-dated
`teaching_assignments` foundation. A class-teacher assignment targets a class
level and optional arm without a subject. A subject-teacher assignment targets
the same class scope and exactly one subject. The database and application
validation enforce this distinction consistently.

The responsive workspace is protected by the existing
`academics.teaching_management` feature. Viewing and management use distinct
permissions. Every read and write is bound to the server-validated active
organization and school; RLS and composite foreign keys remain authoritative.

Assignments are ended or cancelled rather than deleted. Existing database
triggers retain session, employment-assignment, class-arm and overlapping-scope
validation. This phase does not create timetable, curriculum, lesson-delivery
or homework records and does not enable the production feature.
