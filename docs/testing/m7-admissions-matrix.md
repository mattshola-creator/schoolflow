# M7 Admissions Verification Matrix

| Area         | Allowed case                                                                                                 | Denied/invariant case                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Applications | Authorized school operator creates and reads an applicant                                                    | Outsider/direct-ID read and mutation return no access                               |
| Lifecycle    | Approved transitions progress through review, assessment, decision, offer and enrollment                     | Invalid state jumps are rejected                                                    |
| Assessments  | Manual scores and multiple numbered attempts are preserved                                                   | Invalid scores and unauthorized assessment are rejected                             |
| Decisions    | Authorized decision records approval, rejection or retake with rationale                                     | Approval does not create a student or silently enroll                               |
| Offers       | Authorized offer records final session/level/arm and response                                                | Cross-school placement and unauthorized response are rejected                       |
| Checklist    | Authorized enrollment operator updates persisted readiness items                                             | Required incomplete items block conversion                                          |
| Conversion   | Accepted, ready applicant reuses Person and creates M4 student/enrollment/placement/guardian rows atomically | Duplicate conversion, missing student permission and direct table writes are denied |
| History      | Admissions records and audit events remain append-oriented                                                   | Ordinary API roles cannot delete applications                                       |

## Current evidence

- The remote migration and both corrective function migrations applied successfully to the SchoolFlow development project.
- A rollback-only remote matrix passed the complete two-attempt lifecycle, decision, offer acceptance, required checklist, atomic conversion and shared-Person assertion.
- The same matrix confirmed outsider RLS invisibility, direct function denial and unavailable API deletion.
- Schema tests cover application validation, guardian completeness, score bounds and the distinction between approval, offer and enrollment.
- All M7 tables have RLS enabled; `anon` has no table access and `authenticated` has no direct insert, update or delete grants. Caller-bound functions retain fixed empty search paths and no anonymous/public execution.
- The full local gate passed formatting, zero-warning lint, strict TypeScript, 52 tests across 16 files and the production build. The production dependency audit found no known vulnerabilities.
