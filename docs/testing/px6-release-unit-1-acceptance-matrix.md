# PX6 Release Unit 1 acceptance matrix

**Release unit:** Shell, Home, Context Ribbon and My Day  
**Branch:** `feat/px6-ru1-shell-home-my-day`  
**State:** completed, deployed and production-verified with documented limitations

| Area                   | Required evidence                                                                            | Current result                                             |
| ---------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Authenticated shell    | Existing responsive shell, drawer, account controls, keyboard and focus tests remain green   | PASS — reused unchanged                                    |
| Context authority      | Organization/school options originate from active memberships and RLS-visible schools        | PASS automated — selection, cookie and forgery regressions |
| Organization scope     | Offered only when the existing membership has `all_schools = true`                           | PASS — regression test                                     |
| School scope           | Restricted membership cannot receive organization-wide scope                                 | PASS — regression test                                     |
| Academic context       | Existing server-derived session/term ribbon and explicit fallbacks remain unchanged          | PASS — existing ribbon tests                               |
| Home scope             | School heading and organization-wide heading are explicit and agree with the ribbon context  | PASS — implementation and component tests                  |
| Home data              | Exact totals use real RLS-filtered records while displayed lists remain bounded to 20/type   | PASS automated — empty and >20-record regressions          |
| Authorization          | Home and My Day require the existing Action Center capability before any operational query   | PASS — evaluator and no-query denial regression            |
| Entitlements/features  | Module shortcuts and unavailable explanations use `buildWorkspaceAccess`                     | PASS — navigation regression tests                         |
| Multi-responsibility   | Established permissions produce a combined work-area presentation without changing authority | PASS — focused model test                                  |
| Priority ordering      | Urgent/high work precedes normal/low work, then due date                                     | PASS — focused model test                                  |
| Safe links             | Notification links are restricted to application-relative paths                              | PASS — focused security test                               |
| Empty/error/loading    | Honest route-level loading, empty, denied and retry states exist                             | PASS — component coverage; visual review pending           |
| Action Center          | Existing create/update/decision services and routes remain unchanged                         | PASS — full regression                                     |
| Responsive layout      | Cards and work rows use contained responsive layouts at 320–1440px                           | PASS automated; manual browser NOT TESTED                  |
| Accessibility          | Semantic regions, labelled summaries, minimum-height work rows and visible focus patterns    | PASS automated; manual browser NOT TESTED                  |
| Cross-tenant isolation | No service-role access or client-side filtering; Supabase RLS remains authoritative          | PASS — architecture and full regression                    |
| Production isolation   | No schema, policy, dependency, entitlement, flag or production-data mutation                 | PASS changed-file review                                   |
| Founder review         | Protected preview and screenshots accepted                                                   | PASS — founder accepted revision `b03bcf9`                 |
| Controlled merge       | Protected merge without bypassing repository controls                                        | PASS — PR #100, merge `b586be3`                            |
| Production deployment  | Ready deploy at exact merge revision with clean enhanced secret scan                          | PASS — `6acad83131a9180009331d6b`, 429 files, zero matches |
| Production health      | Health endpoint and Supabase connectivity                                                     | PASS — `status: ok`, Supabase connected                    |
| Authenticated browser  | Home/My Day continuity in an authenticated production session                                 | NOT TESTED — no reusable secure owner session              |

## Quality checkpoint

- Frozen-lockfile installation: PASS.
- Formatting: PASS.
- Zero-warning lint: PASS.
- Strict TypeScript: PASS.
- Automated suite: 357 tests across 76 files PASS.
- Production build: PASS; `/dashboard` and `/my-day` compile as dynamic routes.
- Production dependency audit: PASS, zero known vulnerabilities.
- Full dependency audit: expected non-green result for the documented,
  unsuppressed development-only `braces@3.0.3` advisory
  (`GHSA-vfj7-8cjw-p6xm`); no patched npm version is available.
- Tracked privileged-secret scan: PASS, zero matches.
- GitHub Actions: final correction run recorded after publication. The workflow
  is expected to remain non-green only at the unsuppressed full dependency
  audit; its separate functional-step results must be reported accurately.
- Netlify protected preview: deployment status check PASS for exact PR head;
  independent Work-browser rendering NOT TESTED because Team Protection
  requires an invited Netlify account.
- Production merge: PASS, `b586be320a6954e4710b23e2af44e5faa550158f`.
- Production deploy: PASS, `6acad83131a9180009331d6b`, Ready at the exact
  merge SHA, plugin success, 429 files and zero enhanced-secret matches.
- Production health: PASS, application `ok` and Supabase connected.
- Authenticated production browser verification: NOT TESTED; automated and
  founder evidence are not represented as an independent browser session.

## Founder correction evidence

- Summary totals use PostgREST exact counts on the same authorized filters as
  each bounded list; they no longer derive totals from returned array length.
- Urgent work is the exact high/urgent task count plus exact pending approval
  count, matching the presentation model.
- An active tenant option with `schoolId: null` is created only when the
  membership explicitly has `all_schools = true`.
- A restricted membership with zero RLS-visible schools produces no context;
  it no longer receives organization-wide access as a fallback.
- Empty school cookies restore an existing authorized organization-wide option
  exactly. Stale, cross-organization and manufactured selections fall back to
  the safe default or are rejected by the context-switch action.
- Home/My Day rejects any mismatch between active tenant context and effective
  authorization snapshot before calling Supabase. All reads use the caller's
  authenticated client; no service-role path exists.

## Route migration inventory

| Route                | Before                                                            | Release Unit 1                                                                            |
| -------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `/dashboard`         | Membership directory, duplicate context selector and module cards | Scope-aware operational Home using authorized real records and capability-aware shortcuts |
| `/my-day`            | Not present                                                       | Read-only priority view over existing Action Center records                               |
| `/action-center`     | Operational task/approval mutations                               | Unchanged; remains the mutation surface                                                   |
| Authenticated layout | PX1 shell and authoritative ribbon                                | Unchanged; Home/My Day integrate into it                                                  |

## Risks and rollback

- An organization-wide query is permitted only for an existing all-school
  membership and remains constrained by RLS. If preview evidence reveals a
  policy mismatch, organization-wide selection will be removed before merge.
- Operational summaries intentionally use bounded result sets. They are
  orientation counts, not statutory reports; Management reporting remains the
  authoritative reporting surface.
- Roll back by reverting the single RU1 merge and verifying Netlify serves the
  prior revision. No schema or persisted contract requires reversal.
