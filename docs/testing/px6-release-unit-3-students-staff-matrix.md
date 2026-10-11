# PX6 RU3 Students and Staff acceptance matrix

| Area                      | Evidence                                                                                | Result                                               |
| ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Baseline                  | Branch created from documented RU2 closeout `03765ef`                                   | PASS                                                 |
| Student authorization     | `students.view`, module/feature evaluation, school-specific context and RLS             | PASS implementation/focused tests                    |
| Staff authorization       | `staff.view`, module/feature evaluation, school-specific context and RLS                | PASS implementation/focused tests                    |
| Context mismatch          | Active organization/school must equal authorization snapshot before queries             | PASS focused tests                                   |
| Direct profile scope      | Student enrollment and staff primary assignment must exist in active school             | PASS implementation/source review                    |
| Student count             | Exact count from the filtered school enrollment query; page bounded to 20               | PASS implementation                                  |
| Staff count               | Exact count of filtered primary current/planned school assignments; page bounded to 20  | PASS implementation                                  |
| Search                    | Authorized name and student/staff number resolution                                     | PASS implementation                                  |
| Filters and sorting       | Student status/class; staff status/department; stable pagination query                  | PASS focused page/schema tests                       |
| Student 360               | Identity, guardian relationships, enrollment and class history                          | PASS existing workflow plus school gate              |
| Staff 360                 | Contact, employment, assignment and permitted role-linked workflow visibility           | PASS existing workflow plus school gate              |
| Student creation          | Mandatory gender, guardian identity, relationship and primary-contact requirement       | PASS existing schema/RPC regression                  |
| Staff creation            | Atomic identity, employment and first assignment; optional authorized account link      | PASS existing schema/RPC regression                  |
| General editing           | No established audited M4/M5 general edit contract                                      | DEFERRED — no unsafe direct writes introduced        |
| Responsive register       | Mobile cards; semantic desktop table; contained table overflow                          | PASS automated/source review; founder review pending |
| Accessibility             | Labelled filters, semantic headings/tables/nav, 44px controls, visible focus            | PASS automated/source review; manual preview pending |
| Loading/empty/error       | Shared PX1 loading and state components                                                 | PASS implementation                                  |
| RU1/RU2 regression        | Existing shell, context, Home/My Day and Administration tests retained                  | PASS — full 376-test suite                           |
| Schema/RLS/data           | No migration, policy, entitlement, configuration or production-data change              | PASS changed-file review                             |
| Quality gate              | Frozen install, format, zero-warning lint, strict TypeScript, 376 tests/83 files, build | PASS local                                           |
| Production audit          | Runtime dependency audit at high severity                                               | PASS — no known vulnerabilities                      |
| Full dependency audit     | Development-only `braces@3.0.3`, `GHSA-vfj7-8cjw-p6xm`, no patch                        | EXPECTED NON-GREEN — documented and unsuppressed     |
| Tracked-secret scan       | Established repository scan; sensitive values are not printed                           | PASS local                                           |
| Protected preview         | Netlify preview at exact branch revision                                                | PENDING                                              |
| Founder visual acceptance | Desktop and mobile review                                                               | PENDING                                              |

## Required founder checks

- Student register filters, pagination and mobile cards.
- Student 360 guardian and placement history presentation.
- Staff register filters, pagination and mobile cards.
- Staff 360 employment and assignment presentation.
- School context switching and accurate Context Ribbon labels.
- View-only accounts do not receive management actions.
