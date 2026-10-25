# Assessment presentation acceptance — 24 October 2026

Public, sanitized summary. Repository visibility was verified as public before publication. No identity emails, tenant identifiers, fixture identifiers, invitation links, credentials, sensitive diagnostics or private screenshots belong in this report.

Baseline: `65bb28c0749abbe86a27266300ab78bcfd10e6b0`. Existing actual Teacher score-entry, refresh, submission and read-only acceptance is retained; it was not repeated by this slice.

## Changes

- Score-sheet workflow is labeled independently of computed result visibility. Submitted, reviewed, approved and published batches are no longer called Draft merely because individual computed results are unavailable to the current role.
- Assigned teacher presentation follows the existing teaching assignment, staff assignment, staff profile and canonical person relationships using the authenticated client and existing school/organization filters. No directory permissions or privileged client are introduced. Missing/unavailable names are explicitly distinguished from an absent assignment.
- Unexpected lookup errors remain errors; restricted fields are not synthesized or filled from unrelated accounts.

## Evidence

Local full suite: 671 tests across 140 files passed. Formatting, zero-warning lint, strict TypeScript, application build, showroom isolation build (48 exported static files) and unsuppressed dependency audit also passed; the audit reported no known vulnerabilities. Independent secret scanning remains a hosted CI gate. Regression coverage includes all post-draft workflow labels, hidden result details, correction state, missing canonical names, and preservation of denial/error behavior.

Hosted CI, deployment and new-revision browser verification must be confirmed separately. Automated markup tests do not prove authenticated responsive acceptance.

## Acceptance still open

- Pilot Principal and Bursar own-identity invitation activation and dashboard journeys.
- Restricted Teacher academic/assignment metadata visibility requires a separately approved bounded security change; this presentation patch does not broaden access.
- Private image eligibility, upload/delivery/expiry and tenant denial; genuine Finance/Studio transaction overlap; remaining role/lock/security gates.
- Genuine authenticated viewports at 320, 360, 390, 768 and 1440 CSS pixels. No supported viewport-control capability is currently advertised by the connected browser.

Detailed evidence must remain outside public commits, PR comments and build artifacts. A restricted evidence destination has not yet been approved/configured for this slice. The earlier rejected identity-simulated write was not executed and is not acceptance evidence.

Production remains unchanged. The QA integration PR must remain draft and unmerged. Roll back presentation by reverting only this bounded application change on QA; retain workflow, score and audit history. No migration or permission rollback is required.
