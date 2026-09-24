# M7 Admissions Verification Matrix

M7 Admissions is Completed — Deployed & Verified. This matrix distinguishes
automated and rollback-only evidence from authenticated production observations.

| Area          | Approved behavior                                                                                                                 | Denied/invariant behavior                                                       | Evidence                                                                                       | Status                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| Applications  | Authorized school operator creates, lists and opens an applicant                                                                  | Outsider and direct-ID access are denied                                        | Authenticated production creation/register/detail journey; RLS and remote denial matrix        | Verified                |
| Lifecycle     | Applications progress only through approved review, assessment, decision, offer and enrollment states                             | Invalid state jumps are rejected                                                | Transition constraints, schema tests and rollback-only lifecycle matrix                        | Verified                |
| Assessments   | Manual scores and numbered retake attempts are preserved                                                                          | Invalid scores and unauthorized assessment are rejected                         | Two-attempt rollback-only remote matrix and focused schema tests                               | Verified                |
| Decisions     | Authorized actors record approval, rejection or retake with rationale                                                             | Approval alone never creates a student or enrollment                            | Decision transition tests, append-oriented records and production approval evidence            | Verified                |
| Offers        | Authorized actors issue and accept/decline offers with final placement                                                            | Cross-school, expired, duplicate and unauthorized responses are rejected        | Production offer acceptance plus focused POST/303 and service tests                            | Verified                |
| Checklist     | Authorized enrollment operators complete required readiness items                                                                 | Incomplete mandatory items block conversion                                     | Production checklist workflow, evidence gating and focused denial tests                        | Verified                |
| Documents     | Required private evidence is submitted and reviewed by an authorized actor                                                        | Upload alone does not satisfy a requirement; cross-tenant access remains denied | Two synthetic production documents, reviewer metadata, audit events and private Storage checks | Verified                |
| Conversion    | An accepted, ready applicant reuses Person and atomically creates student, enrollment, class membership and guardian relationship | Duplicate conversion, missing permission and direct writes are denied           | Two production conversions, rollback-only atomicity matrix and duplicate-protection tests      | Verified                |
| Redirect      | Successful conversion reaches the new Student 360 record                                                                          | A failed request cannot falsely imply a successful conversion                   | Live browser navigation to the correct Student 360 route; route-level HTTP 303 tests           | Verified                |
| History       | Admissions records and audit events remain append-oriented                                                                        | Ordinary API roles cannot delete admissions records                             | Production audit events, trigger coverage and remote API-deletion denial                       | Verified                |
| Responsive UX | Key M7 pages remain usable at desktop and mobile widths without workflow dead ends                                                | Visual debt does not alter authorization or business state                      | Desktop production smoke test and real-phone production smoke test                             | Verified with M7.5 debt |

## Production evidence

- `M7-QA-20260922-001` converted successfully and retained exactly one student
  profile, active enrollment, class membership and guardian relationship.
- `M7-QA-REDIRECT-20260923-001` completed the approved offer, checklist,
  placement and two-document review workflow, then converted once to student
  `39ea07a0-00fc-4a4d-b280-a2a726064499` with student number
  `M7-QA-STU-REDIRECT-20260923-001`.
- The production browser reached
  `/students/39ea07a0-00fc-4a4d-b280-a2a726064499?message=Applicant+enrolled`
  and Student 360 displayed the expected student, guardian, session, class,
  enrollment date and active status.
- Independent persisted-state verification found exactly one student profile,
  one active enrollment, one active class membership and one active guardian
  relationship for the second conversion. The applicant Person was reused and
  the accepted offer, verified documents and checklist history remained intact.
- The raw production HTTP 303 status and `Location` header were not captured,
  but the browser-level redirect was observed and focused route tests assert the
  303 response and destination.
- The authorized QA account was signed out and the permanent owner account was
  not accessed or modified.

## Security and quality evidence

- All M7 tables have RLS enabled. `anon` has no table access and
  `authenticated` has no direct insert, update or delete grants.
- Caller-bound functions retain fixed empty search paths, explicit permission,
  entitlement, tenant and school checks, and no anonymous/public execution.
- The rollback-only remote matrix passed the two-attempt lifecycle, decision,
  offer, checklist, atomic conversion, shared-Person and outsider-denial cases.
- Focused endpoint tests cover same-origin enforcement, authorization,
  cross-tenant denial, invalid and duplicate submissions, safe errors,
  idempotency and HTTP 303 redirects.
- PR #32 merged as revision `5d1160b61fdf169fa55895a68162a31d3a973048`.
  GitHub Actions run #77 passed 97 tests across 23 files and the production
  build.
- Netlify production deploy `6ab4ff7754d09810470c17a8` is Ready and its
  enhanced secret scan reported zero matches.
- The temporary conversion-context diagnostic probe is disabled.

## M7.5 responsive UI/UX backlog

The real-phone smoke test found no workflow dead end, but it identified
horizontal overflow, clipped navigation/text, occasional reliance on zooming
out, weak secondary-text weight/contrast, dense checklist/document stacking and
occasional Netlify badge obstruction. These are accepted as non-blocking M7.5
design work and are not represented as resolved in M7.
