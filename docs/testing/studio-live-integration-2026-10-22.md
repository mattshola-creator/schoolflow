# Studio application integration — 22 October 2026

QA-only application slice; no schema, grants, policies or production changes. Depends on PR127 migrations 20261022204324 and 20261022204346 already applied in QA.

## Implemented

- Server-authorized persistence API and Owner Studio controls for draft save, separate publish, history and restore-as-new-version. Current school is matched to the request to reject stale workspace submissions. Revision/idempotency remain enforced by existing RPCs.
- Server restores published configuration on page load; school-keyed client state resets on context change. Unknown/expired plans denied; downgraded premium themes use core fallback while preserving history. Authentication/subscription/authority lookup failures are distinguished from denials.
- Processed private uploads: existing full JPG/PNG/WebP decoder/crop/size/pixel/metadata checks, immutable generated WebP path, SHA-256/dimensions attestation and original verified actor. Owner and image entitlement rechecked before privileged operations and again after upload.
- Owner-only signed asset delivery for an RLS-readable version in the current school; registry path is resolved on the server, never accepted from the caller. URLs last60seconds; private no-store responses. Issued URLs remain bearer capabilities until expiry.
- Server-only credential access is restricted to exact QA binding. Missing credential returns503; no direct client Storage fallback. Service credential never serialized. Image draft binding/publish enforcement remains in approved database contract.

## Verification

Full local suite556 tests/123 files passed;29 focused branding tests cover foreign request/host/context, null revision, premium-save denial, conflict propagation, history-preserving downgrade, revoked upload authority, missing credential, hidden/foreign version denial, immutable upload and actor attestation. Formatting, zero-warning lint, strict TypeScript and app build checked. Targeted final rerun after corrections recorded separately. Independent source secret scan required before publication. No synthetic test is authenticated browser acceptance.

## Actual limitations and open gates

No new live Owner save/publish/refresh/restore result claimed. Current secure browser inventory contains only an about:blank tab; previous Owner/teacher sessions are not present or verified. Supported browser API does not advertise responsive viewport control. Do not use preview-width controls as320/360/768/1440 actual viewport evidence.

Automatic approval review rejected Netlify getAllEnvVars because it might retrieve secret values; metadata-only inspection was needed. No alternate credential extraction attempted. SUPABASE_SERVICE_ROLE_KEY presence in QA Functions remains unverified. The runtime reads only that server-only key; secure configuration or confirmation is required before actual uploads/signing can pass. Do not paste credentials into chat or expose them through NEXT_PUBLIC variables.

Actual Storage operations, signed URL expiry, upload fault/orphan handling, browser entitlement journeys and true overlapping transactions remain OPEN. Restore currently resolves immutable image bindings through the server credential, so absent configuration also blocks restore safely. No cleanup job or personal preference interface added. Shared theme publication is scoped to Studio presentation; application-wide shell rollout remains a separate gate. PX6 teacher and Finance concurrency remain independent. Fresh audit reported two critical and one high Next.js findings in addition to earlier findings. PR126 now preserves the supported Vitest5.0.3 remediation and adds Next.js/eslint-config-next16.4.1. The same supported versions are composed in this Studio candidate without merging PR126. Fresh composed audit:zero critical, zero moderate, one high braces finding; no suppression/overrides. Exact-head hosted CI and release integration remain required.

Rollback: disable QA Studio opt-in or restore previous PR125 source. Keep database versions, assets and audit history. All PRs draft/unmerged; production unchanged.
