# Operational dashboard queues — 24 October 2026

Baseline c961e3f30621a88fd5798c65691976453217fe5c / protected PR128. No new schema, role definitions, grants, RLS, entitlement or production changes.

Leadership now uses the existing authenticated Assessment workspace, school/context equality checks and an allowlisted server projection to show draft/reopened/submitted/reviewed/approved/published batch counts. Counts are scoped to the chosen session/period, include versions and are not learner totals. Review/approval/publication links open the matching working register; mutations retain existing independent permissions and academic locks. Inaccessible Assessment queues are omitted before rendering. Unexpected workspace failures propagate rather than being presented as authorization denials.

Assessment register now supports allowlisted status and authorized session/period filtering in both desktop and mobile representations. Context filters never expand RLS access. Filter labels and matching counts are visible; clear-filter navigation is provided. The page's previous catch-all denial is narrowed to expected AuthorizationError so unexpected database failures reach normal error handling.

Finance verification queue now links to recorded-payment filtering. The collections register explicitly labels that filters apply only to the latest 100 loaded records; school-wide counts still come from the existing Finance overview service. No collection totals, units, currency logic or financial mutations changed. Own-record verification controls are omitted; this improves usability and does not replace the existing server-side independent-actor guard. Theme-aware task badges remove a light-only background contrast defect.

Local verification:652 tests/138 files passed; formatting, zero-warning lint, strict TypeScript, application build, static showroom isolation (45 files) and unsuppressed audit passed. Hosted and actual authenticated acceptance must be recorded separately at the deployed revision.

Remaining: Principal/Bursar role contracts and own-identity acceptance, teacher acceptance, positive eligible private-image fixtures, genuine Studio/Finance overlapping transactions, full security review and actual mobile viewports. These UI changes do not close those gates. No synthetic preview is live role acceptance. Existing Owner/Studio history and demonstration records preserved.

Rollback: revert only this queue/filter/presentation slice. No data migration or historical mutation is involved.
