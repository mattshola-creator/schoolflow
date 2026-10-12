# PX6 Release Unit 5 — Teaching and Attendance acceptance matrix

**Status:** Draft for founder preview. RU5 remains unmerged and is not released
to production.

## Approved scope

RU5 migrates the existing M8 Teaching and Attendance workflows into the PX1 /
Pack B responsive experience. It includes My Teaching, class and subject
assignments, timetable, curriculum and lessons, homework, student attendance,
staff attendance, and supported staff time-off views.

Assessment/results, finance, payroll calculations, biometric attendance,
homework submission/grading, and new timetable-generation behavior are outside
this release unit.

## Acceptance matrix

| Capability                       | Implementation and evidence                                                                                                                                           | Status                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| My Teaching                      | Role-aware school workspace, assignment summary, authorized activity links, today's periods, upcoming lesson and published homework summaries                         | Implemented; automated tests pass                                                         |
| Class / subject workspace        | New assignment detail route, session and assignment context, authorized roster via the existing attendance-scope RPC, and assignment-specific lesson/homework summary | Implemented; assignment membership fails closed; automated tests pass                     |
| Timetable                        | Existing manual allocation contracts preserved; added daily and weekly views, weekday selection, and active academic-session selection                                | Implemented; automated tests pass                                                         |
| Curriculum and lesson workflows  | Existing M8 pages and server actions retained                                                                                                                         | Existing regression tests pass                                                            |
| Homework                         | Existing creation, publication/status and due-date workflow retained; My Teaching links to the actual homework section                                                | Existing regression tests pass                                                            |
| Student attendance               | Existing date/class register, complete atomic submission, idempotency key, corrections and immutable history retained                                                 | Existing M8 regression tests pass                                                         |
| Staff attendance                 | Existing clocking, permission checks, correction path, summary, exceptions and audit workflow retained                                                                | Existing M8 regression tests pass                                                         |
| Time-off integration             | Existing staff request and approval workflow retained at `/staff/time-off`                                                                                            | Existing regression tests pass                                                            |
| Context and isolation            | Existing services continue to validate active organization/school and permissions; roster uses only returned authorized scopes                                        | Service/action regressions pass; live authenticated school-switch verification not tested |
| Responsive and accessible states | Responsive layouts retained; added Teaching and Attendance loading and recoverable error boundaries; class roster is a narrow-screen list                             | Automated tests pass; independent desktop/mobile browser review not tested                |
| Production data safety           | No production records were created or modified during this implementation                                                                                             | Confirmed                                                                                 |

## Engineering evidence

- Frozen-lockfile installation: passed with repository-pinned pnpm 11.19.0.
- Formatting: passed.
- Zero-warning lint: passed.
- Strict TypeScript: passed.
- Automated suite: 392 tests across 86 files passed.
- Production dependency audit: passed with no known vulnerabilities.
- Full dependency audit: expected non-green for the unsuppressed,
  development-only `braces@3.0.3` advisory `GHSA-vfj7-8cjw-p6xm` through
  `eslint-config-next` tooling.
- Tracked privileged-secret scan: passed with zero matches.
- Local Next.js production build: blocked in this managed workspace. Turbopack
  cannot bind its process socket (`EPERM`); the Webpack build path cannot spawn
  TypeScript's `--showConfig` child process (`EPERM`). Formatting, lint,
  TypeScript and tests pass. The protected Netlify Deploy Preview build remains
  the remote production-build verification gate.
- Netlify enhanced secret scan and preview revision: pending preview deployment.
- Authenticated browser verification: not tested in this workspace.

## Preserved M8 contracts

RU5 does not add or modify schema, migrations, RLS, permissions, entitlements,
authentication, RPCs, or mutation contracts. Existing M8 assignment scoping,
attendance transactionality, idempotency, correction permissions, historical
integrity, audit, academic locks, and time-off behavior remain authoritative.

No production attendance, staff-clock, lesson, homework, or leave data was
changed for testing.
