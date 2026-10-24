# Approved score-sheet context integration — 24 October 2026

Sanitized evidence only. Founder approved the exact PR136 contract at `27ac40adbdd85b56d076a2bffe34dc132644d092` for isolated QA. Production application is not authorized.

## Database implementation

Rechecked the existing batch-read, assigned-Teacher and staff-view helpers and schema contracts before application. The approved SQL file matched its exact reviewed commit. All 28 disposable PostgreSQL assertions passed again. The proposal's execution guard remains in the proposal file; only the authorized migration copy removes it.

Applied QA migration `20261024191319_assessment_score_sheet_context`. The CLI-generated local migration was reconciled to the actual executor-recorded version. Hosted function-body checksum matches the migration. Catalog checks confirm STABLE SECURITY DEFINER, empty search path, no PUBLIC/anonymous EXECUTE and authenticated EXECUTE. A hosted call with no authenticated identity raised the expected permission denial. This is not authenticated Teacher/Principal acceptance.

No existing helper, table policy, table grant, role, entitlement, score, result or publication was changed. The endpoint returns only the six approved nullable display labels.

## Application implementation

Generated the RPC signature from the QA schema and incorporated only that generated contract into the existing types. The score-sheet loader retains its authenticated batch lookup and explicit selected organization/school. It calls the new RPC through the original authenticated client; no privileged application client is used. Removed the former direct directory lookup chain and redundant academic embeds.

A strict six-field response schema rejects malformed/extra fields. Permission denial remains distinct from an unexpected database/contract failure. Null labels stay null; existing unavailable-label messages remain. Workflow state, computed-result authorization, score mutation and history services are unchanged.

## Verification boundary

Seven targeted adapter regressions cover exact context arguments, nullable labels, expected denial, unexpected failure and malformed/extra response fields. Local full regression passed: 678 tests across 141 files, formatting, zero-warning lint, strict TypeScript, application build, showroom isolation build (63 static files) and unsuppressed dependency audit (no known vulnerabilities). Hosted CI, independent secret scanning and authenticated new-revision browser acceptance must be recorded separately. Existing Teacher score-entry/submission evidence remains accepted; do not resubmit scores to test labels.

Principal/Bursar own-identity activation remains blocked where independent sessions cannot be created without replacing preserved sessions. No duplicate identities or new role permissions were introduced. Private-image eligibility, actual Finance/Studio transaction overlap, mobile viewports and remaining security review remain separate open gates. No detailed live identifiers or private diagnostics are published here.

## Recovery

First revert the application adapter/types to the preceding QA application revision and redeploy it. Then, if rollback is necessary and separately reviewed, remove only the new endpoint:

```sql
drop function public.get_assessment_score_sheet_context(uuid,uuid,uuid);
```

Preserve migration history and use a reviewed forward rollback migration; do not delete or renumber an applied database migration. No score, result, publication, role or audit data rollback is required. Never restore labels by broadening directory RLS.
