# PX6 RU3 Students and Staff acceptance matrix

| Area                      | Evidence                                                                                                                  | Result                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Baseline                  | Branch created from documented RU2 closeout `03765ef`                                                                     | PASS                                                 |
| Student authorization     | `students.view`, module/feature evaluation, school-specific context and RLS                                               | PASS implementation/focused tests                    |
| Staff authorization       | `staff.view`, module/feature evaluation, school-specific context and RLS                                                  | PASS implementation/focused tests                    |
| Context mismatch          | Active organization/school must equal authorization snapshot before queries                                               | PASS focused tests                                   |
| Direct profile scope      | Student enrollment and staff primary assignment must exist in active school                                               | PASS implementation/source review                    |
| Student count             | Exact count from the filtered school enrollment query; page bounded to 20                                                 | PASS implementation                                  |
| Staff count               | Exact count of filtered primary current/planned school assignments; page bounded to 20                                    | PASS implementation                                  |
| Search                    | Authorized name and student/staff number resolution                                                                       | PASS implementation                                  |
| Filters and sorting       | Student status/class; staff status/department; stable pagination query                                                    | PASS focused page/schema tests                       |
| Student 360               | Identity, guardian relationships, enrollment and class history                                                            | PASS existing workflow plus school gate              |
| Staff 360                 | Contact, employment, assignment and permitted role-linked workflow visibility                                             | PASS existing workflow plus school gate              |
| Student creation          | Mandatory gender, guardian identity, relationship and primary-contact requirement                                         | PASS existing schema/RPC regression                  |
| Import policy             | Preview-only rows may omit guardian fields; no commit path; operational creation still rejects a missing primary guardian | PASS focused cross-contract regression               |
| Staff creation            | Atomic identity, employment and first assignment; optional authorized account link                                        | PASS existing schema/RPC regression                  |
| General editing           | No established audited M4/M5 general edit contract                                                                        | DEFERRED — no unsafe direct writes introduced        |
| Responsive register       | Mobile cards; semantic desktop table; contained table overflow                                                            | PASS automated/source review; founder review pending |
| Accessibility             | Labelled filters, semantic headings/tables/nav, 44px controls, visible focus                                              | PASS automated/source review; manual preview pending |
| Loading/empty/error       | Shared PX1 loading and state components                                                                                   | PASS implementation                                  |
| RU1/RU2 regression        | Existing shell, context, Home/My Day and Administration tests retained                                                    | PASS — full 379-test suite                           |
| Schema/RLS/data           | No migration, policy, entitlement, configuration or production-data change                                                | PASS changed-file review                             |
| Quality gate              | Frozen install, format, zero-warning lint, strict TypeScript, 379 tests/83 files, build                                   | PASS local                                           |
| Production audit          | Runtime dependency audit at high severity                                                                                 | PASS — no known vulnerabilities                      |
| Full dependency audit     | Development-only `braces@3.0.3`, `GHSA-vfj7-8cjw-p6xm`, no patch                                                          | EXPECTED NON-GREEN — documented and unsuppressed     |
| Tracked-secret scan       | Established repository scan; sensitive values are not printed                                                             | PASS local                                           |
| GitHub CI                 | Run #255 install, format, lint, TypeScript, 376 tests and build                                                           | FUNCTIONAL GATES PASS; overall non-green at audit    |
| CI secret step            | Runs after the full dependency audit                                                                                      | SKIPPED after documented audit failure               |
| Netlify preview           | Deployment `6acb6d0316099a000814de50` at application revision `4bf7309`                                                   | PASS — Ready, Next.js plugin successful              |
| Netlify secret scan       | Regular and enhanced scan of 449 deployed files                                                                           | PASS — zero matches                                  |
| Independent browser       | Protected Students/Staff routes require Netlify Team Protection and application login                                     | NOT TESTED — sign-in barrier reached                 |
| Founder visual acceptance | Prior desktop and mobile review completed; final release acceptance withheld pending this verification                    | CONDITIONAL                                          |

## Required founder checks

- Student register filters, pagination and mobile cards.
- Student 360 guardian and placement history presentation.
- Staff register filters, pagination and mobile cards.
- Staff 360 employment and assignment presentation.
- School context switching and accurate Context Ribbon labels.
- View-only accounts do not receive management actions.

## Final founder-verification notes

- The import route invokes only `create_student_import_preview`; it does not
  call `create_student_record` or expose an import-commit action.
- The preview copy now states that omission is permitted only for validation
  review and that later authorized creation requires a complete primary
  guardian.
- Focused regression coverage accepts a guardian-free preview row and proves
  that the same missing guardian data fails the operational creation schema.
