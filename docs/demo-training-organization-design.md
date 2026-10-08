# Demo & Training Organization design

**Status:** PX0 design only  
**Data rule:** wholly synthetic; no production personal data or preserved
milestone fixture may be copied into the demo.

## 1. Purpose

The Demo & Training Organization gives prospects, operators and school staff a
coherent view of SchoolFlow across roles and modules. It is not a collection of
unrelated screenshots and must never become an authorization shortcut for real
tenants.

## 2. Proposed fictional organization

**Organization:** Cedarbridge Learning Group (fictional)

| School                             | Location         | Structure                         | Purpose in demo                                                    |
| ---------------------------------- | ---------------- | --------------------------------- | ------------------------------------------------------------------ |
| Cedarbridge Nursery & Primary      | Meadow Campus    | Pre-Nursery, Nursery, Primary 1–6 | parent-heavy, class-teacher, early-years and primary operations    |
| Cedarbridge Secondary School       | Meadow Campus    | JSS 1–3, SSS 1–3                  | HOD, subject teaching, timetable, assessment and result workflows  |
| Cedarbridge Nursery & Primary East | Riverside Campus | Nursery, Primary 1–6              | multi-location/multi-school management and partial-scope scenarios |

Names, addresses, phone numbers, email domains, identifiers, documents and
transactions must be unmistakably fictional.

## 3. Academic structure

- Current session plus one closed historical session and one planned session.
- Three terms with current, closed and future examples.
- Representative levels/arms, including two arms for selected primary and
  secondary levels.
- Subjects appropriate to each school and selected department groupings for
  secondary demonstrations.
- Academic locks on historical periods; controlled unlocked current period.

## 4. Synthetic population

| Population         | Minimum coherent design                                                                                                                       | Important relationships                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Staff              | director, principals/head teacher, deputy, HODs, teachers, class teachers, bursar, cashier, admissions officer, registrar, assessment officer | multi-role and selected cross-school assignments          |
| Students           | enough learners to make registers/reports realistic without excessive seed volume; varied levels/arms/statuses                                | active enrollment, class membership, historical promotion |
| Guardians          | one- and two-child households, selected cross-school siblings, differentiated relationships                                                   | explicit guardian links; one unrelated denial fixture     |
| Applicants         | draft, review, assessed, offered, accepted, placed, enrolled and rejected examples                                                            | required-document and conversion evidence                 |
| Platform operators | separate synthetic identities if the Platform Console demo is approved                                                                        | no organization-owner equivalence                         |

Suggested implementation sizing for PX7: approximately 80–120 active learners
across the three schools, 25–35 staff identities, 50–80 guardian relationships,
and 15–25 admissions applications. Final sizing should be validated against
reset cost and performance; it is not a PX0 seed commitment.

## 5. Cross-module activity

### Admissions

- Applications distributed across meaningful workflow states.
- Entrance assessment and document-review examples.
- One completed applicant-to-student journey linked to enrollment history.

### Attendance and teaching

- Several weeks of student attendance with present/late/absent/excused cases.
- Staff clock records and one controlled correction.
- Teacher assignments, timetable, curriculum coverage, lesson plans, lesson
  deliveries and homework with coherent dates.

### Finance

- Versioned fee structures and deterministic bills.
- Unpaid, partially paid and fully allocated learners.
- Verified and pending manual payments, receipts, one controlled reversal.
- Expenses, other income, cashier session, handover and reconciliation.
- Exact NGN values that reconcile across detail and management summaries.

### Assessment and results

- Configurable schemes for primary and secondary contexts.
- Draft/incomplete score sheet, submitted/reviewed batch and immutable published
  report snapshot.
- Historical promotion and next-session enrollment.

### Shared services and communication

- Private documents with authorized links.
- Tasks, approvals, audit events and notifications.
- School-wide, class and learner-targeted notices.
- Participant-scoped conversation and communication preferences.

### Reporting

- Known counts and totals documented as fixture assertions.
- Single-school, authorized multi-school and partial-scope actors.
- An inaccessible school that contributes zero rows and zero aggregates.

## 6. Demo personas

| Persona                       | Scope and emphasis                                                 |
| ----------------------------- | ------------------------------------------------------------------ |
| Director / Organization Owner | all demo schools, cross-school Home, Administration and Insights   |
| Principal / Head Teacher      | one school, operational exceptions and approvals                   |
| Teacher                       | assigned classes/subjects, My Day, teaching, attendance and scores |
| Bursar                        | authorized Finance configuration, verification and reports         |
| Admissions Officer            | applicant pipeline and conversion workflow                         |
| Parent                        | two explicitly linked learners, family summary and communications  |
| Student                       | self-only published/attendance/communication experience            |

Persona access must be produced by the same membership, assignment,
relationship, permission, entitlement, feature and context machinery as real
access.

## 7. Demo-only Switch Perspective

Switch Perspective is a demo orchestrator, not role impersonation for normal
users.

Required safety model:

1. available only inside the isolated demo tenant/environment;
2. uses allowlisted synthetic persona identities or signed short-lived demo
   sessions;
3. cannot accept arbitrary user/tenant identifiers;
4. changes to a predeclared persona with the normal authorization snapshot;
5. displays an unmistakable persistent **Demo** banner;
6. records persona transitions without logging secrets;
7. cannot be enabled by an organization feature override in real tenants;
8. has no service-role key or privileged token in the browser;
9. dangerous operations remain disabled or simulated by a bounded demo adapter;
10. receives explicit threat-model and cross-tenant tests before release.

## 8. Isolation and reset

- Prefer a dedicated non-production Supabase project and deployment for public
  interactive demo/training. If a shared project is ever proposed, it requires
  separate security approval and a distinct tenant plus strong reset controls.
- Use migration-compatible schema and deterministic seed scripts.
- Maintain a canonical fixture manifest with stable external/demo keys.
- Reset by reconstructing only the demo environment/tenant from the canonical
  seed; never issue broad production deletes.
- Reset schedule should balance safe interaction and sales/training continuity.
- Disallow or sandbox outbound email/SMS/WhatsApp and real payment gateways.
- Use private demo documents generated specifically for the fixture.
- Rate-limit public demo entry and mutation paths.
- Make all displayed contact/payment/document data fictional.

## 9. Fixture integrity assertions

The seed/reset pipeline should verify:

- every record belongs to the demo organization/school;
- persona relationships and role scopes are exact;
- bills, allocations, receipts, reversals and aggregates reconcile;
- published snapshots match expected results while drafts remain hidden;
- attendance/report counts match documented fixture values;
- parent/student denial cases pass;
- platform persona cannot arise from organization ownership;
- no real domain, phone number, identifier, document or personal record exists;
- reset is idempotent and returns checksums/counts to the canonical state.

## 10. Guided experiences

Launch-required guidance should be lightweight: persona description, Context
Ribbon, a short task checklist and reset notice. Advanced tours, interactive
narration, analytics and training authoring are post-pilot enhancements unless
founder review elevates them.

## 11. PX7 implementation evidence

- Reviewed synthetic fixture manifest and seed generator.
- Isolated environment/tenant proof.
- Persona authorization and Switch Perspective threat-model tests.
- Deterministic expected-value tests across modules.
- Reset rehearsal with before/after counts and checksums.
- Responsive/accessibility verification of demo entry and persona switching.
- Confirmation that no production personal data or real delivery/payment
  integration is present.
