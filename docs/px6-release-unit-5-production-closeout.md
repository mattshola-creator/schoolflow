# PX6 Release Unit 5 — Teaching and Attendance production closeout

## Release identity

| Item | Verified value |
| --- | --- |
| Founder-accepted application revision | `a0f7c5cf16b3d944175417b9458fbc56048b4303` |
| Application pull request | [#109](https://github.com/mattshola-creator/schoolflow/pull/109), merged |
| Application merge revision | `7c1d1b4ae85fe5d2b6905c3d3f3a1adb80cc371e` |
| Production deployment | `6acd6575c732cc91ef9cad09` |
| Deployment state | Ready |
| Published application revision | `7c1d1b4ae85fe5d2b6905c3d3f3a1adb80cc371e` |
| Production URL | https://schoolflow-app.netlify.app |

GitHub reports PR #109 merged and `main` points to the merge commit. Netlify reports the production deployment Ready on that exact commit. The Next.js plugin succeeded, and regular/enhanced secret scans inspected 466 deployed files with zero matches.

Founder conditional acceptance explicitly accepts the populated browser-verification limitations below for this controlled release. They remain open and are not pilot-readiness evidence.

## Production verification

Checks were performed on 12 October 2026.

| Check | Evidence | Result |
| --- | --- | --- |
| Accepted release and merge lineage | GitHub PR #109 merged accepted head `a0f7c5cf16b3d944175417b9458fbc56048b4303` as `7c1d1b4ae85fe5d2b6905c3d3f3a1adb80cc371e`; `main` points to the merge commit | PASS |
| Active Netlify deployment | Deploy `6acd6575c732cc91ef9cad09`, Ready, production context, same published SHA | PASS |
| Next.js deployment plugin | Netlify deployment record reports plugin success | PASS |
| Regular and enhanced secret scans | 466 files; zero matches | PASS |
| Application health endpoint | A new direct request could not be issued from this workspace. Work browser returned `net::ERR_BLOCKED_BY_CLIENT`; web retrieval said the URL was inaccessible; workspace curl could not connect to its configured proxy on port 8889. These are access limitations, not evidence of an application outage. A founder-supplied production capture from the prior production deployment showed `status: ok` and Supabase `connected`; it is prior evidence, not an independently repeated check of this RU5 deployment. | NOT INDEPENDENTLY RECHECKED |
| Unauthenticated Teaching and Attendance routes | Direct live requests were blocked by the same browser/proxy restrictions. Existing server guards and application services were not changed; automated tests passed. | NOT TESTED LIVE |
| Runtime function logs | The connected Netlify interface exposed deployment metadata but no function-log query operation. Runtime invocation logs were not independently inspected. | NOT TESTED |
| Production errors | Deployment record is Ready with no deployment error, and the function was deployed. Runtime logs were unavailable, so this does not establish that no runtime errors occurred. | DEPLOYMENT PASS; RUNTIME NOT TESTED |
| Production data changes | No production or shared tenant records were changed for QA. | NONE PERFORMED |

RU5 changed application presentation and added route-level UI/tests; it did not add or change schema, migrations, RLS, permissions, entitlements, authentication, RPCs or operational mutation contracts. Existing M8 authorization, school context, assignment scoping, attendance transactionality/idempotency, correction rules, audit history and academic locks remain authoritative. Automated regressions passed. No live cross-school denial or authenticated workflow is claimed.

## Quality and security evidence

GitHub Actions run [#38300387857](https://github.com/mattshola-creator/schoolflow/actions/runs/38300387857) ran on the accepted application revision.

| Gate | Result |
| --- | --- |
| Frozen-lockfile install | PASS |
| Formatting | PASS |
| Zero-warning lint | PASS |
| Strict TypeScript | PASS |
| Automated tests | PASS — 394 tests across 86 files |
| Production build | PASS in CI; Netlify production build also Ready |
| Full dependency audit | NON-GREEN — unsuppressed development-only `braces@3.0.3`, high advisory `GHSA-vfj7-8cjw-p6xm`, through development tooling |
| CI tracked-secret scan | SKIPPED after the audit failure; PR #109 records a local tracked-source scan with no matches |
| Netlify deployment secret scan | PASS — 466 files, zero regular or enhanced matches |
| Local build/audit rerun | BLOCKED by the workspace process/network restrictions; CI and Netlify deployment evidence above are the available independent build evidence |

The dependency advisory remains unsuppressed. The full dependency audit is not reported as green.

## Accepted browser limitations

The founder conditionally accepted these items as NOT TESTED for this controlled release:

- Populated Teaching, timetable, curriculum, lesson and homework workflows.
- Teacher-specific assignment and authorization behavior in an authenticated browser.
- Live attendance submission, duplicate handling, correction and history.
- Populated staff attendance and enabled Time Off workflows.
- Independent authenticated cross-school isolation checks.

The browser review confirmed Alpha Nursery and Primary School's unconfigured/empty states. Read-only QA inspection found M7 data configured, but the existing QA organization has Teaching and Attendance feature gates disabled; the owner's browser account is not a member of that organization; and the configured teaching assignment has no linked login profile. No feature, membership, role, assignment, or tenant data was changed to produce evidence.

## Deferred demo/UAT

The outstanding verification scenarios are recorded in [the PX7 demo/UAT register](testing/px7-demo-uat-ru5-teaching-attendance-register.md). They must be completed in an isolated demo/UAT environment with approved test accounts and without changing shared or production records.

These accepted limitations are not waived for pilot readiness. Any material defect found during demo/UAT must be corrected and verified before pilot readiness.

## Rollback

RU5 is an application-only migration. If a release regression is found, revert the PR #109 merge and redeploy the preceding verified `main` revision. RU5 introduced no schema, RLS, permission, entitlement, authentication or production-data migration requiring a database rollback.

## Final status

**PX6 RU5 — COMPLETED — DEPLOYED — PRODUCTION-VERIFIED, WITH DOCUMENTED LIMITATIONS.**

Application deployment identity and build are verified. Health endpoint, live unauthenticated-route checks and runtime logs remain explicitly documented as not independently rechecked from this workspace.
