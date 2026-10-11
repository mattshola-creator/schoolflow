# PX6 Release Unit 3 production closeout

## Release identity

| Item                                  | Verified value                             |
| ------------------------------------- | ------------------------------------------ |
| Founder-accepted application revision | `44548f3d67d21cd527042efd3c81e6637ddbe096` |
| Application pull request              | #104, merged                               |
| Application merge revision            | `137edf5b46f641774ffed0587478bcbbcea96c30` |
| Production deployment                 | `6acbbd979008ec0008a6dd4d`                 |
| Deployment state                      | Ready                                      |
| Published application revision        | `137edf5b46f641774ffed0587478bcbbcea96c30` |
| Production URL                        | `https://schoolflow-app.netlify.app`       |

GitHub's PR and commit records confirm that PR #104 merged the accepted RU3
head into `main`. The merge contains the bounded Students and Staff migration,
focused tests and release documentation. No schema migration, RLS policy,
permission, entitlement, authentication, dependency or production-data change
is present in the application release.

Netlify identifies the active production deployment as the exact merge
revision. Its Next.js plugin completed successfully. Regular and enhanced
secret scanning inspected 449 deployed files and reported zero matches.

## Production verification

Verification was performed on 11 October 2026 UTC.

| Check                     | Evidence                                                         | Result     |
| ------------------------- | ---------------------------------------------------------------- | ---------- |
| Health endpoint           | `/api/health` returned HTTP 200 and service status `ok`          | PASS       |
| Supabase dependency       | Health response reported `connected`                             | PASS       |
| Students protection       | Unauthenticated `/students` redirected to sign-in                | PASS       |
| Staff protection          | Unauthenticated `/staff` redirected to sign-in                   | PASS       |
| Direct profile protection | Unauthenticated direct Student 360 request redirected to sign-in | PASS       |
| Authenticated records     | No authorized production browser session was available           | NOT TESTED |
| School switching          | Requires an authenticated, authorized production session         | NOT TESTED |
| Production mutations      | Deliberately not exercised during non-destructive verification   | NOT TESTED |

The accepted implementation retains school-scoped service gates before Student
360 or Staff 360 identity data is loaded. Supabase RLS remains authoritative;
the release adds no service-role bypass. Organization-wide context does not
substitute for the school-specific enrollment or primary-assignment checks.

## Functional integrity

- Students retain exact filtered counts independent of page size, search by
  name or student number, enrollment/class filters, deterministic sorting,
  filter-preserving pagination, responsive register views and school-gated
  Student 360 identity, guardian, enrollment and placement history.
- Mandatory gender and complete primary-guardian requirements remain in the
  existing operational creation schema and `create_student_record` RPC.
- CSV import remains validation-preview only. A preview row may omit guardian
  data for correction review, but there is no import-commit route and no path
  around operational guardian validation.
- Staff retain exact primary-assignment counts without duplicates, search by
  name or staff number, employment/department filters, deterministic sorting,
  responsive register views and school-gated Staff 360 identity, contact,
  employment and assignment history.
- Existing staff creation, account linking, transfer and termination contracts
  remain unchanged.

## Quality and security gates

| Gate                         | Result                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| Frozen lockfile installation | PASS                                                                                   |
| Formatting                   | PASS                                                                                   |
| Zero-warning lint            | PASS                                                                                   |
| Strict TypeScript            | PASS                                                                                   |
| Automated tests              | PASS — 379 tests across 83 files                                                       |
| Production build             | PASS                                                                                   |
| Production dependency audit  | PASS — no known vulnerabilities                                                        |
| Full dependency audit        | NON-GREEN — development-only `braces@3.0.3`, `GHSA-vfj7-8cjw-p6xm`; no patch available |
| Tracked-source secret scan   | PASS — zero matches                                                                    |
| Netlify enhanced secret scan | PASS — zero matches across 449 files                                                   |

The advisory is unsuppressed and remains an accepted M13 hardening limitation.
The production dependency graph is clean. The repository workflow places its
tracked-secret step after the full audit, so that step may be skipped when the
documented audit fails; the identical scan was independently run and passed.

## Preserved limitations

- Authenticated production presentation and authorized context switching were
  not independently browser-tested during closeout.
- General Student and Staff profile editing remains deferred because M4/M5 do
  not provide a general audited edit contract; unsafe direct writes were not
  introduced.
- CSV import does not commit records.
- The development-only `braces` advisory remains open and visible.

## Rollback

RU3 is application-only. If a release regression is found, revert the PR #104
merge and redeploy the preceding verified `main` revision. No destructive
database rollback is required because RU3 contains no schema, RLS or data
migration.

## Final status

**PX6 RU3 — COMPLETED — DEPLOYED — PRODUCTION-VERIFIED, WITH DOCUMENTED LIMITATIONS.**
