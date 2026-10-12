# PX7 demo/UAT register — PX6 RU5 Teaching and Attendance

**Status:** OPEN — not pilot-readiness evidence  
**Release:** PX6 RU5 — Teaching and Attendance  
**Release revision:** `7c1d1b4ae85fe5d2b6905c3d3f3a1adb80cc371e`

Complete this register in an isolated demo/UAT environment with approved QA accounts and records. Do not use production or shared tenant records to create test data. Record the environment, account role (no credentials), tested revision, date, tester, evidence link, and result for each item. Keep a scenario NOT TESTED until it has actually been exercised. Any material defect blocks pilot readiness until corrected and retested.

## Teaching and academic workflows

- [ ] **NOT TESTED** — Populated My Teaching shows only the signed-in teacher's authorized teaching assignments.
- [ ] **NOT TESTED** — Class/subject workspace shows correct school, session, term, class, subject, teacher and authorized student roster.
- [ ] **NOT TESTED** — Teacher cannot open an unassigned class or another teacher's assignment.
- [ ] **NOT TESTED** — Populated weekly timetable shows accurate periods and allocations.
- [ ] **NOT TESTED** — Daily timetable and day selection show the selected school/session/day.
- [ ] **NOT TESTED** — Timetable allocation actions remain permission-controlled and preserve existing clash acknowledgement.
- [ ] **NOT TESTED** — Curriculum plans, lessons and lesson delivery show correct class/subject/session context.
- [ ] **NOT TESTED** — Homework list, status, due dates and existing authorized actions are correct.
- [ ] **NOT TESTED** — Empty, loading, error, unavailable and access-denied states remain usable.

## Student attendance

- [ ] **NOT TESTED** — Attendance policy and active academic context allow only eligible registers.
- [ ] **NOT TESTED** — Authorized class loads the correct school-scoped roster and existing register.
- [ ] **NOT TESTED** — Submission follows the existing complete-register and transaction rules.
- [ ] **NOT TESTED** — Duplicate submission is prevented/idempotent under the existing contract.
- [ ] **NOT TESTED** — Corrections are available only to authorized roles and obey the lock window.
- [ ] **NOT TESTED** — Correction history and audit evidence retain the original and corrected states.
- [ ] **NOT TESTED** — Cross-school class/student identifiers fail closed.

Use disposable isolated fixtures for write scenarios. Do not submit or correct shared QA records.

## Staff attendance and Time Off

- [ ] **NOT TESTED** — Authorized staff attendance view shows the correct active staff assignment and date policy.
- [ ] **NOT TESTED** — Existing clock-in/clock-out, exception, correction and audit flows preserve M8 rules.
- [ ] **NOT TESTED** — Unauthorized staff actions and cross-school access are denied.
- [ ] **NOT TESTED** — Existing Time Off feature, leave type, request and approval workflows work when enabled through approved QA configuration.
- [ ] **NOT TESTED** — Disabled, unentitled, invalid-context and permission-denied Time Off states remain distinct and fail closed.

## Authorization, context and isolation

- [ ] **NOT TESTED** — Teacher sees only assignments, timetable, roster, lessons and homework permitted by assignment and role.
- [ ] **NOT TESTED** — Management sees only the scope allowed by existing permissions.
- [ ] **NOT TESTED** — Active organization and school context is validated on every workflow.
- [ ] **NOT TESTED** — Switching between authorized schools changes results correctly and never leaks prior-school data.
- [ ] **NOT TESTED** — Invalid or unauthorized school context denies data access and mutation.
- [ ] **NOT TESTED** — Existing RLS and server-service/RPC checks remain authoritative.

## Responsive configured-state review

- [ ] **NOT TESTED** — Mobile Teaching dashboard and populated assignment cards are readable and operable.
- [ ] **NOT TESTED** — Mobile timetable and class workspace require no horizontal page scrolling.
- [ ] **NOT TESTED** — Mobile curriculum, lesson and homework screens preserve readable forms and actions.
- [ ] **NOT TESTED** — Mobile attendance entry is efficient, accessible and touch-friendly.
- [ ] **NOT TESTED** — Desktop configured-state tables, navigation and permission-sensitive actions remain usable.
- [ ] **NOT TESTED** — Loading, validation, success/error feedback and confirmation states work on mobile and desktop.

## Completion record

| Field                          | Value       |
| ------------------------------ | ----------- |
| Isolated environment           |             |
| Tested application revision    |             |
| Tester / role                  |             |
| Test date                      |             |
| Evidence links                 |             |
| Defects and follow-up issue/PR |             |
| Pilot-readiness decision       | NOT DECIDED |
