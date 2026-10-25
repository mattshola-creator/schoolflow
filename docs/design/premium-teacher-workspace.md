# Protected QA Teacher workspace

## Scope

Adds /workspace/teacher using the existing authenticated Assessment workspace and unchanged six-label score-sheet context RPC. The page loads at most30 metadata projections from the latest visible batches. Class/subject/status counts describe that displayed list, not the whole school or the complete timetable. No student roster, scores or computed results are serialized into dashboard cards.

Score-entry login intent and eligible default dashboard navigation open this workspace. Teaching-only users without score-read access retain the existing Teaching route. The server still requires authenticated school context and score-entry capability; list and label authorization remain in existing services/RLS/RPC checks. No service-role client, schema, grants, entitlement or workflow changes.

Existing timetable, attendance, lesson/delivery and task screens are linked only when existing permissions and feature gates permit. The current restricted score-only Teacher is intentionally not offered those broader work areas. This milestone does not supply missing privileges or claim daily timetable/lesson acceptance for that identity.

## Presentation

Reuses ExecutiveHeader/ExecutiveMetric and curated shell appearance. Restricted score-capable QA users can select the existing three shell appearances; published Owner branding persistence is unchanged. Premium Emerald and Midnight Emerald retain their existing Emerald Executive/Midnight Command catalogue compatibility. No independent theme catalogue or persistence added.

Scoped academic surface styles cover the Teacher dashboard, score sheet, timetable, attendance and lesson/delivery screens. Existing form actions, validation, academic locks and submission behavior are unchanged. Score-table overflow is keyboard-focusable and mobile entry rows wrap. Unavailable labels stay explicit; unexpected data errors propagate.

## Verification and recovery

Regression coverage checks permission/entitlement-filtered links, displayed-list counts, strict contextual RPC invocation, submitted display, denied workspace, null metadata and unexpected errors. Existing submitted-sheet no-form and metadata/authorization regressions remain required. Requested real viewport widths remain open until supported controls exist; CSS and component checks are not mobile browser acceptance.

Revert this presentation/routing slice or use the existing legacy dashboard escape to recover the preceding UI. No database recovery is needed. Preserve original submitted scores, actor and history; do not resubmit as a visual test. Keep QA integration draft/unmerged and production unchanged. Pilot activation, private images, true transaction concurrency and broader security gates remain independent.
