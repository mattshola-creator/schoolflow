# Premium operational experience — isolated UI candidate

## Source of truth and scope

Based on QA integration `db542ada7113ae2476be61b35416fc77936dc2dd`, independently rechecked through PR #128 metadata and Netlify deployment `6ade652a8d700648a161d7d1` (ready, deploy-preview, matching commit). PR #128 and #147 are open drafts and unmerged. No database operations were performed for this UI slice.

Read the supplied README, full implementation order, competitive review and image catalogue. Inspected the concept compositions separately from operational code. No competitor assets or concept illustrations are included in application output. Concepts' sample identities, arithmetic, organization aggregates and trends were not used as implementation data.

Branch: `ux/royal-emerald-workspaces-2026-11-02`. Target: existing QA integration branch, never production main. This is an incremental H1/H2 and shared-component H3 candidate, not completion of the whole product acceptance programme.

## Implemented

- Royal Emerald Executive retains `premium-emerald` / `emerald` identifiers. Navy navigation, emerald hero, pearl canvas and restrained champagne detail.
- Ocean Intelligence becomes available through the existing temporary shell appearance selector; published `ocean` retains the same palette. Midnight Emerald / Midnight Command retain both identifiers with navy/charcoal surfaces. Classic Light remains available. Twelve curated theme IDs and tiers unchanged.
- Hero tokens are separate from navigation tokens. Published aliases resolve consistently with temporary shell selections. Existing school/personal preference precedence and entitlement resolution are unchanged.
- Reusable WorkQueue displays already-authorized links, statuses and optional counts. It never loads records or decides permissions. Zero is preserved; an absent count is not replaced with zero.
- Owner tasks, Leadership next actions, Finance tasks and Teacher work areas use this component. Finance tasks and Teacher work areas precede statistical summaries. Existing destination filters, academic context and server authorization remain intact.
- Shared page headers, cards, table cells and form inputs inherit scoped theme presentation. Semantic error/status styles are retained. Operational charts inherit the current shell tokens.
- Shared DataTable receives a named keyboard-focusable scroll region; tables retain semantic captions and markup. Mobile metric spacing/type and theme controls refined.

## Screen / service / acceptance gap matrix

| Screen                               | Actual source and current boundary                                                                                   | UI change                                                               | Remaining gate                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Owner `/design/owner-dashboard`      | `loadOwnerDashboard`, identity-bound Owner entry; permission-filtered Reporting/Finance/OperationalHome projections  | Tokens, metric surfaces and task list                                   | Actual Owner sign-in, theme comparison, refresh and Studio precedence                |
| Leadership `/workspace/leadership`   | `reporting.dashboard.view`, selected-school checks, permission-projected reports, Assessment queue                   | Next-action cards and chart tokens                                      | Principal own identity; missing-register/coverage data not invented                  |
| Finance `/finance/overview`          | `loadFinanceDashboard`, existing per-section visibility and Finance predicates                                       | Operational tasks first; filtered recorded-payment destination retained | Bursar own identity, independent verification and concurrency remain separate gates  |
| Teacher `/workspace/teacher`         | Assessment workspace and six-label metadata endpoint; `teacherWorkAreas` evaluates existing permissions/entitlements | Permitted work first; assignment/lock explanation; list scope retained  | Teacher own identity; expired temporary pilot must not be silently renewed           |
| Assigned Teaching `/teaching/own`    | `loadOwnTeachingWorkspace`, approved assignment-scoped contracts                                                     | Inherits shell palette and existing academic components                 | Timetable/lesson/attendance own-identity acceptance                                  |
| Attendance `/attendance`             | Existing attendance workspace/roster service and register mutations                                                  | Shared input/header/table presentation where used                       | Locks/concurrency remain Stage 1; no privileged changes here                         |
| Students `/students`                 | `loadStudents`, existing server authorization                                                                        | Shared header/card/input/table components                               | Authorized desktop/mobile task acceptance                                            |
| Staff `/staff`                       | `loadStaff`, canonical relationships and existing staff authority                                                    | Shared components                                                       | No broad Teacher directory access added                                              |
| Admissions `/admissions`             | `loadAdmissions`, existing filters and lifecycle services                                                            | Shared components                                                       | Conversion journey and independent permission checks; no invented intake actions     |
| Assessment `/assessments` and sheets | Existing batch/sheet permissions and metadata RPC                                                                    | Shared components; workflow state logic untouched                       | Original scores/history and academic locks need live regression evidence             |
| Studio `/administration/branding`    | Existing branding context, version services and private assets                                                       | Registry naming/tokens and shared components only                       | Publish/refresh/restore plus private image/sign/expiry remain independent live gates |

## Visual and data rules

No school-wide Teaching capability, new data fields, role grants, database changes, commercial entitlement changes, Finance calculations or mutation rules. No new organization aggregate, trend or comparison is inferred. Owner remains explicitly selected-school scoped until an independently authorized comparable rollup exists.

Focus and foreground/background token contrast are tested. Gold/teal metric trim is decorative and conveys no workflow status. Actual current identities remain in the existing account controls; workspace presentation does not confer a role.

## Verification categories

- Automated component/token/authorization regressions: report exact totals with final commit; do not infer browser acceptance from unit tests.
- Hosted QA: baseline deployment independently verified; candidate deployment must match the new PR head.
- Browser inspection: existing QA URL reached Netlify team protection. No surviving authenticated app session was found. No login bypass, sign-out or authentication change attempted.
- Actual authenticated screenshots and 320/360/390/768/1024/1440 viewport acceptance: BLOCKED pending authorized session and supported viewport control. Concept images are not evidence.
- Finance/Studio/attendance concurrency, private assets, independent Principal/Bursar/Teacher identities and remaining security review: remain under Stage 1 HOLD. This UI candidate does not close them.

## Reversibility and founder acceptance

Revert this UI commit (or close the draft) to restore the baseline. No schema/data rollback required. Legacy appearance opt-out is retained. School theme history and identifiers remain valid.

Before acceptance: verify all three flagship appearances with identical authorized Owner data; navigate role-permitted task links; check named table scrolling by keyboard, mobile menu/focus and long context labels; verify Studio published appearance after refresh/context switch. Record actual and founder-assisted evidence separately. Do not merge QA history wholesale or publish production.
