# Organization Owner dashboard — isolated QA opt-in

The route `/design/owner-dashboard` is a read-only composition outside the operational application route-group layout. Existing QA-bound shared-shell build gating runs before identity loading. A build flag is never authority: the service requires the existing organization capability, a matching explicit school context and an active, effective Organization Owner assignment bound to the authenticated user and organization. Ordinary `/dashboard` is unchanged.

## Five bounded slices

1. Context and server DTO boundary: existing tenant/academic context, permission-aware navigation, read-only presentation opt-in, legacy dashboard and shell fallback links.
2. Enrollment and attendance: existing single-school Management service, active enrollment **rows**, and present-plus-late / recorded marks. Attendance keeps the source's session/date window semantics and is explicitly not period-filtered. No unique-learner estimate or trend is invented.
3. Finance: existing overview service, separately labelled currency groups and time semantics. No cross-currency sums or SaaS billing. Existing underlying numeric aggregation is reused rather than changed here; this PR does not assert a new accounting calculation.
4. Assessment: existing Management publication output, accurately labelled publication/batch versions including historical rows, not current unique batches. Navigation links retain independent destination authorization.
5. Action Center: existing operational-home service, existing counts and prioritized tasks. Approval and notification values/items are omitted before client serialization unless their separate permissions allow them.

Every raw service envelope remains on the server. Explicit DTO projection excludes unrelated domain fields, alternate schools, learner/person records and clients. Returned reporting and Finance scope is checked against the active school. Data failures render unavailable states, not fabricated zeros. Domain/module/feature checks run before the relevant service call. Cross-school comparisons remain deferred.

The reusable attendance ring/table now accepts an explicit authorized-data label; its existing demo callers retain fictional-data labels. Theme choices remain temporary shared-shell state. No persistence, entitlement, schema, grant or Platform Owner changes are included.

## Regression / acceptance

Automated coverage checks absent production binding before user loading, capability failures, legacy appearance, foreign/organization-only context denial, field omission, module/feature denial and unexpected reporting school rejection. Full formatting/lint/TypeScript/regression/build/independent secret scanning and unsuppressed audit remain required. Browser acceptance must use a genuinely authenticated Owner session and verify the actual preview revision. Real records are never copied into the public showroom.

Verify 320/360/768/1440 widths, three shell themes, keyboard navigation, long context names, missing/denied/error states and legacy fallback. Authenticated viewport limitations must remain open rather than being replaced by synthetic evidence.

## Rollout and fallback

The draft is independently reviewable and stacked on the accepted showroom component baseline. No prerequisite PR merge is authorized. Only the protected QA preview should expose the review route. Production binding returns 404. Release requires explicit founder approval after mandatory gates; the default route stays legacy. Fix forward by removing the review route or reverting this bounded source change if needed.

## Premium Custom Design Studio — preserved roadmap

Keep custom image selection, validation, crop/focal point, safe overlays, contrast preview, desktop/mobile preview, draft/publish and versioned restore in the roadmap. Only allow vetted raster formats; enforce byte/dimension/decode limits, strip metadata, re-encode and reject active SVG/HTML/CSS/JavaScript. Final numeric limits need a separately reviewed upload specification. Server persistence, Storage policies, per-tenant ownership, entitlement checks and publishing authority remain gated; no upload endpoint or storage-policy change is implemented here.

The protected QA site's branch allowlist retains its existing QA branch and adds the accepted showroom baseline as an additional preview base, so this stacked PR can receive a Deploy Preview. The QA primary branch, operational production site, environment variables and access protection are unchanged. The route still requires the QA-bound deploy-preview marker plus all live identity and permission checks.
