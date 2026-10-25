# Assessment context proposal validation — 24 October 2026

Sanitized public evidence. No live identity, organization, school, fixture or invitation identifiers are included.

## Proposed change

One guarded, review-only read contract and a disposable validation runner. No live application code, database schema, RLS, grants, subscriptions or user assignments were changed. The SQL execution guard remains intact in the proposal file; only an in-memory test copy removes it.

Baseline runtime revision: `22b72e4940432590898724dbd78c320695673f25`. Its existing Teacher submission and Assessment presentation acceptance remain preserved.

## Disposable PostgreSQL evidence

28 assertions passed using PGlite 0.5.11 (installed only in a temporary tools directory, not an application dependency). The runner loads the existing batch-read and assigned-Teacher helper definitions from repository SQL. Foundational permission, membership, entitlement and staff-visibility inputs are explicitly mocked. All identities, names and UUIDs are fictional. No hosted service is contacted and no live credentials are accepted.

Covered: canonical own name; six context labels; fixed output allowlist; unchanged direct-table denial; anonymous/missing identity; unknown/foreign batch and selected context; unassigned identity/subject/class/school; future and ended assignment; inactive employment; missing permission; suspended membership; expired entitlement; management with/without staff access; mismatched canonical person; foreign label relationship; missing historical assignment; unchanged record count; anonymous EXECUTE absence.

This proves syntax and local contract behavior. It does not prove actual QA memberships, subscriptions, authenticated browser behavior, whole-schema RLS compatibility, transaction overlap or a production-ready migration.

Reproduce with `scripts/assessment-context-disposable-validation.mjs`, setting `SCHOOLFLOW_PGLITE_MODULE` to the installed PGlite module URL in an isolated temporary tools directory. It always creates/discards an in-memory database; it has no database connection parameter.

## Application regression checks

671 tests across 140 files passed. Formatting, zero-warning lint, strict TypeScript, application build, showroom isolation build (60 exported static files) and unsuppressed dependency audit passed. Fresh audit: no known vulnerabilities. Hosted independent secret scanning and final source-PR CI must be checked separately; do not substitute earlier runtime CI for this proposal revision.

## Acceptance still open

- Pilot invitations remain pending; own-identity Principal/Bursar dashboard acceptance is not claimed. The supported browser exposes no independent profile/context creation capability, and current Owner/Teacher sessions were preserved.
- All requested authenticated responsive widths remain unverified; no supported viewport control is advertised.
- Eligible private-image fixture and private Storage journey; actual overlapping Finance/Studio transactions; remaining role, academic-lock and security-advisor gates remain open.
- Detailed security evidence requires a separately approved restricted destination. No private evidence is published by this proposal.

## Approval boundary

Founder review is needed for the exact proposed SECURITY DEFINER metadata projection and authenticated EXECUTE privilege before isolated QA application. No broad Teacher directory/setup grant is proposed. Subsequent application integration and live acceptance remain a separate slice. No production change or integration-PR merge is authorized.
