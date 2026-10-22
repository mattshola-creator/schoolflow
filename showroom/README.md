# SchoolFlow customer showroom candidate

This independent static Next.js application reuses the installed SchoolFlow React/Next stack and pure appearance tokens. It has no authentication client, API endpoints, live tenant data, persistence or subscription operations. All displayed school records are fictional.

## Reviewable implementation slices

1. `src/features/showroom/catalog.ts` and four original SVG textures: six core designs, two premium compositions and four decorative collections; legacy theme aliases remain supported.
2. `chart-model.ts`, `charts.tsx` and their tests: accessible SVG visualizations, exact tables, keyboard point values, missing/error states, fixed percentage scales and integer currency minor units.
3. `customer-showroom.tsx`, `dashboard.tsx` and the standalone `showroom/app`: gallery, eight audience previews, real iframe width controls and in-memory Studio draft/publish/append-only restore simulation.

The operational application router, domain services, authorization checks, database and Netlify application configuration are unchanged. The additional CI build produces only the static showroom.

## Build and isolated deployment

Run `pnpm install --frozen-lockfile`, then `pnpm showroom:build`. Deploy **only `showroom/out`** to the separate showroom candidate target. Never deploy the repository root, operational `.next` output or environment files to this target. The output scanner rejects unexpected routes, QA references, database endpoints and privileged credential patterns. It supplements the independent tracked-source secret scan.

The candidate includes noindex headers and robots exclusion. Its same-origin frame policy permits the dashboard/responsive preview controls. Preserve candidate hosting access protection until founder go-live authorization. Static export contains no application middleware or server environment.

## Verification checkpoint — 22 October 2026

- Full automated regression: 520 tests across 117 files passed.
- Formatting, ESLint, strict TypeScript, operational production build and standalone static build passed locally.
- Independent tracked-source privileged-secret scan passed; static artifact isolation scan passed.
- Token tests check body/muted/action contrast across twelve designs. These are bounded token checks, not a claim of complete WCAG certification.
- Local browser verification exercised mobile frame rendering and premium Studio draft/publish simulation. Hosted screenshots and hosted CI must be verified separately.
- Dependency audit remains **failed**: high-severity `braces@3.0.3`, GHSA-vfj7-8cjw-p6xm. The dependency path is `eslint-config-next > @next/eslint-plugin-next > fast-glob > micromatch > braces`. Registry/advisory inspection reports no published patched braces version. No override, exclusion or suppression was introduced. The dev-tool finding remains a release-review item; static deployment does not install this dependency at runtime.

## Safe public launch and rollback

1. Verify the exact source commit, hosted CI, candidate deployment and static bundle identity.
2. Complete hosted responsive/keyboard/chart/Studio checks, security headers and screenshots.
3. Obtain founder approval for candidate public launch and the residual dependency risk disposition. No merge or operational SchoolFlow production deployment is included.
4. Publish only the isolated showroom target. Retain the preceding deployment/artifact for rollback; withdraw or restore the showroom candidate if necessary. The operational application needs no rollback for these isolated files.

## Subsequent real-dashboard integration — separate bounded work

First extract reviewed presentation components into the existing opt-in shared shell. Next compose the Organization Owner dashboard from existing Management, Finance, Assessment and Action Center services behind explicit authorized school context and allowlisted server DTOs. Label enrollment rows versus unique learners, attendance numerator/denominator/window, and per-currency Finance totals. Exclude unauthorized fields before serialization. Keep cross-school comparisons deferred until per-school authorization and academic-period comparability are established.

Add permission-denied, tenant-switch, role, empty/error, responsive and keyboard regressions before expanding to another audience. Live theme publishing requires a separately authorized persistence/entitlement/security design. Platform Owner authority remains a separate privileged milestone. This showroom provides no evidence that outstanding authenticated PX6 workflows or payment concurrency gates passed.
