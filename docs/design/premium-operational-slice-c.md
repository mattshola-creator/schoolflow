# Leadership and Finance premium presentation

Builds on the QA-only executive components introduced in source PR138.

## Bounded implementation

Existing WorkspaceHeader and WorkspaceCard now delegate to the reviewed executive presentation components. Call sites remain limited to Leadership and Finance overview. Finance summary cards reuse ExecutiveMetric; no count, currency arithmetic or query changes. Existing permission-filtered Finance navigation replaces hard-coded light surfaces and text with shared shell color tokens, retaining current-page semantics and visible focus states.

Routes: /workspace/leadership and /finance/overview. No schema, policy, grant, role, entitlement, subscription or persistence changes. No new synthetic series or domain records. Principal and four-permission Bursar browser acceptance remains independent of Owner-authority checks.

## Verification

Regressions cover contextual headings and drill-down preservation, four-permission Recorder navigation exclusions, current-page semantics, theme token usage and entitlement denial. Full quality checks, app/showroom isolation builds, independent source secret scan and unsuppressed audit are required. Real mobile viewport acceptance remains open where unsupported; CSS wrapping is implementation evidence only.

## Recovery

Revert this presentation slice to recover prior workspace rendering. Database and historical records need no recovery. Keep the QA integration PR draft/unmerged and production unchanged.
