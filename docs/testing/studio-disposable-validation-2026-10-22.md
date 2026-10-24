# Studio disposable validation — 22 October 2026

## Actual result

33 assertions passed in ephemeral PGlite 0.5.11, PostgreSQL 18.6 WASM. Persistence SQL executed before private assets SQL. The approval execution guards were removed only in the in-memory test copy. After the disposable checks and QA schema preflight, applied QA migrations 20261022204324_studio_versioned_persistence and 20261022204346_studio_private_processed_assets. No production migrations or writes. No customer or QA identity/data was copied into the test database.

Reproducible runner: scripts/studio-disposable-validation.mjs. Install @electric-sql/pglite@0.5.11 in a disposable tools directory and set SCHOOLFLOW_PGLITE_MODULE to its index.js file URL when running the script. No production dependency added. Uses an in-memory database; closed/discarded after execution.

The harness replays repository private-schema, identity/tenancy and entitlement migrations, the effective academic module/feature helpers and the existing audit definition. Auth users/uid and Storage tables are minimal adapters. Unsupported extension creation is skipped in the test bootstrap; no Studio SQL statements are skipped except the approval guards. This is meaningful SQL/RLS/function validation, not full hosted Supabase integration.

## Corrections found

- Replaced winter-frost proxy with explicit premium-image eligibility: actual signed-in member, exact active school/org, enabled foundation feature/module and exactly one current active Professional/Enterprise subscription. Trial, expired and downgraded subscriptions denied.
- Added exact active school/org checks before writes; all-schools organization membership alone did not validate an arbitrary school ID.
- Nullable revision comparisons now reject null/negative revisions and use IS DISTINCT FROM for draft/publication checks.
- Unknown plan identifiers fail closed for curated-theme availability.
- Processed asset audit uses the server-verified originating actor supplied in the service-only registry; generic service JWT auth.uid would lose that actor. This requires the upload endpoint to derive created_by from verified identity, never client JSON.

## Covered

Owner save/publish; anonymous, teacher, foreign Owner and foreign school denials; null/stale revisions; exact retry and mismatched replay; no direct table writes; no raw client Storage upload even with a broad permissive policy; teacher cannot read drafts; school member reads published only; foreign tenant reads no versions; restore appends; correct Owner audit actor; teacher/unregistered asset binding denial; image retry; no retrofitting onto published history; downgraded image publication denied by database trigger; active premium image publication; direct binding edits denied; expired/trial/downgraded image eligibility denied.

## Still open — do not mark passed

- Full hosted Storage API and actual private-object processing/registration.
- Genuinely overlapping sessions and lock observation. PGlite serializes calls; retry/stale-revision tests are not concurrency evidence.
- Signed URL expiry/revocation window, streaming proxy option, orphan cleanup and upload fault injection.
- Owner/teacher browser identities and responsive Studio acceptance.
- Save/publish/restore/personal-preference UI integration remains disabled; database RPCs alone do not make subscriber functionality live.
- Full native PostgreSQL startup was blocked by workspace ownership restrictions. No paid disposable cloud branch was created.

Actual QA PostgreSQL 17.11 rolled-back Owner tests passed save, same-request retry, publication retry and restore-as-new-version: two transient versions and three correct Owner version events. Restricted teacher save was denied; manager/image predicates returned false. Final QA counts were zero stored versions/states/assets, confirming rollback. Bucket is private, restrictive policy present, and authenticated direct asset/version INSERT privileges are false. Endpoint/UI integration, signed URLs, true concurrency and authenticated browser acceptance remain OPEN. PX6 teacher and Finance concurrency remain independent OPEN gates. Braces audit remains unsuppressed. Production unchanged.
