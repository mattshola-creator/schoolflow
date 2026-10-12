# PX6 Release Unit 4 production closeout

## Release identity

| Item                                  | Verified value                                                           |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Founder-accepted application revision | `f0598d488fbe1cc0508b995fd9451f587d88869d`                               |
| Application pull request              | [#106](https://github.com/mattshola-creator/schoolflow/pull/106), merged |
| Application merge revision            | `db73f024009359f35b14ac050861c8795defae5f`                               |
| Production deployment                 | `6acc097916099a000833d699`                                               |
| Deployment state                      | Ready                                                                    |
| Published application revision        | `db73f024009359f35b14ac050861c8795defae5f`                               |
| Production URL                        | https://schoolflow-app.netlify.app                                       |

GitHub reports `main` at the application merge revision. Netlify reports the
production deploy Ready at that exact SHA. The Next.js plugin succeeded, and
the deployment's enhanced secret scan examined 456 files with zero regular or
enhanced matches.

## Production verification

The deployment and production health evidence were checked on 12 October 2026.
The founder supplied a live mobile-browser capture of `/api/health`. It shows
`status: "ok"`, service `schoolflow-web`, Supabase `connected`, and a
reported 516 ms latency. The reviewed production route maps this healthy result
to HTTP 200. The request was blocked from the Work browser and workspace proxy,
so the live health body is founder-provided evidence rather than an
independently issued request from this workspace.

| Check                                         | Evidence                                                                                               | Result                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------- |
| GitHub release revision                       | `main` points to `db73f024009359f35b14ac050861c8795defae5f`                                            | PASS                   |
| Active Netlify deployment                     | Deploy `6acc097916099a000833d699`, Ready, same published SHA                                           | PASS                   |
| Next.js deployment plugin                     | Netlify deploy record reports plugin success                                                           | PASS                   |
| Enhanced secret scan                          | 456 files; zero regular or enhanced matches                                                            | PASS                   |
| Application health                            | Founder-provided live response is `ok`; route contract maps healthy state to HTTP 200                  | PASS, founder evidence |
| Supabase application dependency               | Health response reports `connected`                                                                    | PASS, founder evidence |
| Unauthenticated Admissions protection         | Prior live request redirected to sign-in                                                               | PASS                   |
| Authenticated Admissions records and workflow | No authorized production browser session was available                                                 | NOT TESTED             |
| Direct cross-school RLS behavior              | Existing service gates and RLS contracts were retained; no authenticated production test was performed | NOT TESTED live        |
| Production mutations                          | No production application data was created, changed, or converted for verification                     | NOT PERFORMED          |

The Netlify deploy record confirms that the Next.js server handler was deployed.
Runtime function invocation logs could not be inspected: the Netlify function
logs dashboard request timed out, and no function-log reader is exposed by the
connected Netlify interface available to this workspace. This is a documented
evidence limitation, not evidence that runtime logs contain no errors.
No logging settings or deployment configuration were changed to obtain logs.

The accepted implementation preserves the centralized capability checks,
explicit active-school validation, existing M7 lifecycle/RPC contracts, and
Supabase RLS. These controls were reviewed in the merged PR and its acceptance
matrix; authenticated production checks remain NOT TESTED. No production data
was modified during this verification.

## Automated verification and security

The recorded RU4 baseline is 387 passing tests across 85 files. GitHub Actions
run #267 on the closeout PR's source tree independently passed frozen-lockfile
installation, formatting, zero-warning lint, strict TypeScript, all 387 tests
across 85 files, and production build. The full audit failed on the single
known development-only `braces` advisory; CI skipped tracked-secret scanning
after that failure. This GitHub run is distinct from the original RU4 PR's
recorded local verification.

| Gate                         | Result                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Frozen-lockfile installation | PASS — GitHub Actions #267                                                      |
| Formatting                   | PASS — GitHub Actions #267                                                      |
| Zero-warning lint            | PASS — GitHub Actions #267                                                      |
| Strict TypeScript            | PASS — GitHub Actions #267                                                      |
| Automated tests              | PASS — 387 tests across 85 files; GitHub Actions #267                           |
| Production build             | PASS — GitHub Actions #267                                                      |
| Production dependency audit  | PASS — no known production dependency advisory recorded                         |
| Full dependency audit        | NON-GREEN — unsuppressed development-only `braces@3.0.3`, `GHSA-vfj7-8cjw-p6xm` |
| Tracked-secret scan          | PASS — prior recorded local scan; CI #267 skipped after audit failure           |
| Netlify secret scan          | PASS — 456 deployed files, zero regular/enhanced matches                        |

The development-only advisory remains unsuppressed and visible. The dependency
audit is reported as non-green; the successful production dependency audit is
not presented as a pass for the full dependency graph.

## Preserved limitations

- Authenticated production Admissions, Applicant 360, decision, offer,
  readiness, document-review, assessment, and conversion workflows were NOT
  TESTED in an independent authenticated browser session.
- Live cross-school denial and RLS behavior were not exercised during this
  closeout.
- Netlify runtime function invocation logs were unavailable through the
  connected interface; the dashboard request timed out.
- The full GitHub Actions audit is NON-GREEN; its downstream tracked-secret
  scan was skipped. The prior recorded local tracked-secret scan and current
  Netlify scan passed.
- The full dependency audit remains non-green for the documented development-
  only `braces@3.0.3` advisory.

## Rollback

RU4 is an application-only migration. If a release regression is found, revert
the PR #106 merge and redeploy the preceding verified `main` revision. RU4
introduced no schema, RLS, permission, entitlement, authentication, or
production-data change requiring a database rollback.

## Final status

**PX6 RU4 — COMPLETED — DEPLOYED — PRODUCTION-VERIFIED, WITH DOCUMENTED
LIMITATIONS.**
