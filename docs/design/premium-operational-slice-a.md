# Premium operational integration — first slice

Baseline: c213315de16a75ffa32cf04454b6600c6002d4b4. The independently protected showroom remains at deploy 6ad9ed49186fcc6ed379d7db.

## Implemented boundary

The existing QA-only Organization Owner route adopts reusable ExecutiveHeader and ExecutiveMetric presentation components. They adapt the showroom's executive hierarchy, restrained gold light, theme-aware surfaces, metric emphasis, keyboard links and narrow-screen wrapping. The existing accessible ProgressCard remains connected to the authorized reporting DTO; no fictional dataset or demonstration dashboard is imported. Metric details remain available in native keyboard-operable disclosure controls.

Affected route: /design/owner-dashboard. Existing shell appearance opt-in and explicit legacy dashboard escape remain. No service, authorization, metric calculation, persistence, entitlement, database or workflow changes.

## Regression requirements

Component coverage verifies actual DTO values, attendance numerator/denominator and dates, accessible chart alternative, absent unauthorized Finance/work links, unavailable-data handling and legacy escape. Existing authorization and theme regressions remain mandatory. Full formatting, lint, strict TypeScript, tests, application/showroom builds, independent source secret scan and unsuppressed dependency audit must pass before QA integration.

Hosted browser evidence must identify the exact source revision and deployment. Earlier Owner/Teacher acceptance is preserved but does not establish new visual acceptance. Requested real viewport widths remain open until supported controls are available.

## Next bounded slices

1. Adopt shared presentation in Leadership and Finance without expanding their DTOs or role permissions.
2. Improve permission-filtered Owner operational queues using existing services and reviewed definitions.
3. Standardize Teacher and selected register/detail surfaces.
4. Harmonize the persisted Studio experience; do not introduce new layout persistence implicitly.

Principal/Bursar independent authentication, premium private images, true Finance/Studio overlap, broader security review and mobile acceptance remain separate open gates. No visual milestone closes them.

## Recovery and release

Revert this presentation-only slice to restore the preceding dashboard, or use the existing legacy route. No database recovery is needed. Integrate only after exact-head checks; retain integration PR as draft/unmerged. Production remains unchanged and release is HOLD.
