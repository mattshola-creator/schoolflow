# Studio security approval package: private processed assets

Founder authorized disposable validation and subsequent reviewed QA-only implementation on 22 October 2026. Status: corrected SQL passes 33 embedded PostgreSQL checks; applied only to QA after schema preflight. Dependency order: studio-persistence-proposal.sql then studio-private-assets-proposal.sql. This does not authorize production application. Execution guards remain intact in the review proposals; validated migration copies preserve QA history.

Additional security impact: one private bucket, one restrictive Storage policy, two RLS-enabled tables, one authenticated asset-draft RPC, one explicit authenticated premium-image eligibility predicate, private publication and processor-audit trigger functions. No platform authority, plan changes or direct authenticated asset/Storage writes. Service-only asset registration uses the existing server secret; no new client secret. The new definer only binds current school assets after Owner and current subscription checks. Restoring an image creates a new version and requires current entitlement.

## Required endpoint contract before enablement

1. Upload: validate genuine user with the existing server authentication; exact same-origin request, explicit authorized school, effective Owner, school.manage, module/feature and Professional/Enterprise plan. Apply existing byte/signature/raster/crop checks. Server generates UUID/key; upload processed WebP with upsert=false. SHA-256 and dimensions come from actual output, not request fields. Re-read authority/plan before service-only registry insert. Preserve the original caller actor in created_by; audit the processor action explicitly with that actor in a separate event because a service JWT does not supply the original auth.uid. No raw client signing/upload endpoint.
2. Download: validate user and explicit school on every request. Owners may view retained school drafts; ordinary permitted school members may view only the currently published binding. Require current premium image entitlement even for a retained old image. Resolve key from the registry, never accept a key/URL from the caller. Mint at most a 60-second URL, private/no-store, no URL logging. A URL already issued remains a bearer capability until expiry; immediate revocation is not claimed. If immediate revocation is required, use an authenticated streaming proxy instead.
3. Publication: the database trigger rechecks premium entitlement even when the original publication RPC is called directly. Rendering also checks current entitlement and falls back to a core theme without deleting history. Shared publishing remains disabled until SQL and endpoint denial tests pass.
4. Retention: immutable keys, no overwrite. Failed registry insert leaves an unreferenced orphan; maintenance may delete only objects older than 24 hours that have no registry row, after a second reference check. Do not delete registered assets or anything referenced by any retained version. Registered-unused asset retention remains indefinite until a separately approved retention policy. Never delete Storage metadata directly; use Storage API.
5. Race safety: all draft entry points and publish lock the same school state; assets and bindings cannot be edited by clients. Retry must match configuration, restore source and exact asset. Upload retry uses a new immutable key; no duplicate publication/version effect. Revoke client authority between processing, registry, draft, publish and sign to prove denial.

## Required tests and release gate

- SQL dependency/syntax/privilege checks in a disposable QA environment; no production test writes.
- Anonymous, teacher, foreign owner, inactive owner, wrong school and expired/downgraded/ambiguous plans denied at every endpoint and RPC.
- Direct client Storage SELECT/INSERT/UPDATE/DELETE/sign denied, including unrelated permissive policies; service upload limited to expected immutable paths by application checks.
- Exact bytes/hash/dimensions recorded; forged registry metadata cannot be submitted through client APIs; SVG/animated/truncated/oversized/decompression payloads rejected.
- Publish base RPC bypass attempt with image after downgrade rejected. Config-only save cannot retrofit an asset onto existing or published versions.
- Restore creates a new binding/version without changing historical rows; cross-school binding rejected by composite foreign keys.
- Two simultaneous saves/publishes: one serializable outcome; mismatched replay rejected; one audit effect per successful action.
- Signed URL issuance denies foreign/superseded assets; expiry behavior documented; no signed URLs in audit/logs.
- Orphan cleanup fault injection and reference race tests; no registered/history asset deletion.
- Actual Owner browser, 12 themes, keyboard, 320/360/768/1440, image upload/crop/overlay, Starter/Growth denials; all synthetic chart data labeled.

The existing first-slice state table exposes the current draft UUID to school members. It contains no draft content but this is an explicit metadata exposure for founder review; tighten its read DTO before release if even draft existence is considered confidential. Organization defaults/platform policy overrides remain deferred. The validated SQL has been applied to QA only; application integration is not release-ready. See ../testing/studio-disposable-validation-2026-10-22.md for actual coverage and limits.
