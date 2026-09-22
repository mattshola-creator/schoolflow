# ADR-0008: Admissions lifecycle and enrollment conversion

- Status: Accepted for M7
- Date: 22 September 2026

## Decision

Admissions owns school-scoped applicant workflow records, assessment attempts, decisions, offers and enrollment-readiness checklists. Applicant and guardian identities use the shared `people` table. They do not become student records merely because an application is approved or an offer is issued.

The lifecycle distinguishes application review, assessment, admission decision, offer response and enrollment. Entrance-assessment retakes create new numbered attempts and preserve earlier scores. Decisions are append-oriented. The offer records the final session and placement proposal.

Enrollment conversion is a caller-bound atomic function. It requires an accepted offer, all required checklist items, `admissions.enroll`, the Admissions entitlement and feature state, plus `students.manage`. It reuses the applicant Person and creates the existing M4 Student Profile, Enrollment, Class Membership and Guardian Relationships. It never creates a parallel student master.

All exposed admissions tables use school-scoped RLS. Ordinary API roles have read grants only; mutations occur through narrowly scoped functions with fixed empty search paths, authenticated-only execution and explicit permission, membership, entitlement and feature checks. Shared M6 audit triggers record admissions changes.

## Consequences

- Approval, offer and enrollment remain distinct business events.
- Retake and decision history remain available for inspection and audit.
- Direct IDs, cross-school access and authentication alone cannot authorize access.
- Later Finance, Documents and Communication work can reference application IDs without taking ownership of applicant or student identity.
