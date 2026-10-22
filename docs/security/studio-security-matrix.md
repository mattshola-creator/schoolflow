# Branding & Experience Studio: implementation and gated persistence

The code is an authenticated QA-only implementation slice, not a claim that persistence is live. It reuses all twelve original designs/tokens/textures, existing charts and existing identity/authorization/plan tables. Existing Starter/Growth/Professional/Enterprise keys were inspected. Trial access is capped at core themes. No plan, price, feature entitlement or subscription record was changed.

## First persistence approval package (not applied)

`studio-persistence-proposal.sql` contains guarded review-only SQL: three school-bound tables, five narrow authenticated RPC/predicate grants, strict JSON allowlisting, SELECT-only RLS and existing audit triggers. There are no client table mutation grants. A manager must have effective organization_owner authority and school.manage; non-manager personal preference changes are restricted to auth.uid and permitted school membership. Every mutation rechecks the current effective subscription. Unknown, ambiguous, suspended and expired subscriptions fail closed. Draft writes lock the school state and compare revisions; request reuse must match the prior payload. Publish locks the same state and rechecks its exact current draft. Restores append a new version and retain the original. Premium entitlement downgrade must also be checked during rendering, falling back to core appearance without deleting retained versions.

The proposal has NOT been executed, syntax/dependency checked in a disposable database, or accepted as release-ready. Approval permits moving this exact bounded slice through disposable-schema checks, QA migration and RPC integration; it does not authorize production application. Organization-default hierarchy and platform policy overrides remain a later explicitly scoped slice. No Platform Owner principal or privilege is created.

## Private background storage: next bounded slice, not applied

Propose a separate private `schoolflow-branding` bucket, never the school document bucket. No authenticated raw Storage INSERT/UPDATE/DELETE policy. A protected processing endpoint must validate actual caller, current school, effective owner role, module/feature and Professional/Enterprise subscription before any server Storage operation. Validate streamed request byte cap, 5 MB file cap, MIME versus decoded format, single-frame raster, decoded pixel cap, oriented source dimensions 1280×720 through 4096×4096, normalized crop, full decode, metadata stripping and WebP re-encoding. Only processed bytes may be stored under server-generated organization/school/asset UUID paths. No public URLs or arbitrary external URL backgrounds.

Exact bucket/asset registration SQL is deliberately NOT included in this first approval package. It requires a separate attested asset lifecycle design, orphan cleanup policy and signed-download authorization before applying Storage policies or enabling image publication. The current image endpoint returns private no-store normalized preview bytes only, and requires an entitled real subscription; trial cannot spoof its way into image processing.

## Mandatory test matrix

| Boundary         | Required verification                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity         | Anonymous/teacher/expired owner/foreign org denied; current Owner allowed only in explicit school                                                    |
| Plans            | Starter/trial 6; Growth 8; Professional/Enterprise 12; unknown/ambiguous/expired fail closed; legacy aliases and free dark stay available            |
| Image bytes      | Actual PNG/JPEG/WebP decode; forged MIME/SVG, truncation, animation, >5 MB, >16 MP, EXIF rotation, tiny/oversized dimensions and invalid crop denied |
| Upload transport | Missing content-length still bounded; cross-origin/host poisoning rejected; no secret or image bytes logged                                          |
| Persistence      | Forged tenant, direct table writes and unauthorized RPC calls denied; revision conflict and replay mismatch roll back                                |
| Publication      | Entitlement revoked between save/publish denied; concurrent publish/draft race; retry has one effect; restore creates new history                    |
| Preferences      | Only own member-school preference, no shared publishing authority, no cross-tenant preference read                                                   |
| Assets           | Private bucket, no direct raw uploads, actual processed-content attestation, no foreign/superseded signed URL access                                 |
| Hierarchy        | Policy/plan/org/school/user precedence; denied premium appearance falls back without data access changes                                             |
| Presentation     | 320/360/768/1440, 12 themes, keyboard/focus, labels/contrast, reduced motion, chart tables and print                                                 |
| Release          | Exact-head CI, independent secret scan, unsuppressed audit, protected deployment and production exclusion of QA provisioning                         |

Current source tests exercise tier counts, aliases, rejected arbitrary theme IDs, crop bounds, overlay bounds, image MIME/decode/normalization and request stream limits. They do not replace live RLS, publishing, Storage or authenticated browser acceptance. Shared save/publish controls remain visibly disabled pending migration approval.
