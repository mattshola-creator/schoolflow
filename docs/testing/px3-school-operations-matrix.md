# PX3 Prototype Pack B — School Operations acceptance matrix

## Scope and architecture

| Criterion                     | Evidence                                                              | Status |
| ----------------------------- | --------------------------------------------------------------------- | ------ |
| Feature-isolated prototype    | `/px3-operations`; no existing operational route replaced             | PASS   |
| Synthetic-only data           | Prototype banner, deterministic local fixture arrays                  | PASS   |
| Two authorized schools        | Cedarbridge Primary and Cedarbridge Academy                           | PASS   |
| Inaccessible school denial    | Disabled Northgate option plus unavailable shell item                 | PASS   |
| Platform boundary             | Platform Console remains unavailable to Organization Owner            | PASS   |
| Production services untouched | No Supabase, migration, domain-service, entitlement or action changes | PASS   |
| PX6 boundary preserved        | Existing application routes remain authoritative and unchanged        | PASS   |

## Screen coverage

| Reference area               | Evidence                                                     | Status |
| ---------------------------- | ------------------------------------------------------------ | ------ |
| Organization and School Home | Seven role-specific KPI, exception and approval compositions | PASS   |
| My Day and Action Center     | Responsibility-aware daily queue                             | PASS   |
| Administration               | Membership/effective access and module explanations          | PASS   |
| Students and Student 360     | Responsive register, filters and eight 360 sections          | PASS   |
| Admissions                   | Pipeline, Applicant 360, exact workflow rail and readiness   | PASS   |
| Teaching and Attendance      | Classes, lesson summary and fast attendance controls         | PASS   |
| Finance                      | Exact-decimal KPIs, verification queue and disabled mutation | PASS   |
| Assessment and Results       | Score-entry reference, blockers and publication rail         | PASS   |

## Role and responsibility coverage

The prototype provides seven explicit perspectives: Organization Owner / Director,
Principal / Head Teacher, Teacher / Class Teacher, Admissions Officer, Bursar /
Finance Officer, Assessment / Examination Officer, and Student Administrator /
Registrar. The perspective affects work prioritization without creating a second
authorization system or assuming one identity has only one responsibility.

Each perspective now changes the Home information hierarchy, metrics and
priority tasks. Scope selection is carried across all eight workspaces. Primary
has 684 active learners and Academy 600; organization-wide derives to 1,284.
Attendance and collection percentages are calculated from summed counts/value,
not added or averaged percentages. The scope-aware Context Ribbon is explicitly
labelled synthetic and states that production context is unchanged.

## Reusable patterns

- `KpiCard`
- `ExceptionCard`
- responsive register table plus `MobileRecordCards`
- `RecordCard`
- `WorkflowRail`
- `StickyPrototypeActions`
- PX1 `ApplicationShell`, `ContextRibbon`, buttons, badges, cards and tables

## Integrity boundaries

- Finance uses string-formatted exact-decimal synthetic values and preserves
  recorder/verifier separation in the reference language.
- Assessment fields are read-only and submit/publication actions are disabled;
  server computation and M10 workflow authority remain explicit.
- Attendance submission is disabled and labelled prototype-only.
- Admissions reuses the established stage meaning rather than implementing a
  competing state machine.
- No prototype control is connected to a production mutation.

## Quality gate

| Check                       | Status | Evidence                          |
| --------------------------- | ------ | --------------------------------- |
| Focused interaction tests   | PASS   | PX3 prototype test suite          |
| Formatting                  | PASS   | Prettier check                    |
| Zero-warning lint           | PASS   | Local lint                        |
| Strict TypeScript           | PASS   | Local typecheck                   |
| Full regression suite       | PASS   | 327 tests across 72 files         |
| Production build            | PASS   | Next.js 16.3.8 optimized build    |
| Responsive layout tests     | PASS   | Mobile-card/table and shell tests |
| Live desktop visual check   | PASS   | Protected preview at 1363px       |
| Founder responsive review   | PASS   | Accepted with documented limits   |
| Secret scan                 | PASS   | Local tracked secret-pattern scan |
| Production dependency audit | PASS   | Zero production vulnerabilities   |

The full development audit remains non-zero only for the accepted, unsuppressed
`braces@3.0.3` advisory (`GHSA-vfj7-8cjw-p6xm`) through ESLint tooling. It has
no production dependency path and PX3 does not change dependencies.

The live preview inspection also verified every workspace without page-level
horizontal overflow. A duplicated shell-level Home entry found during visual
QA was removed before founder review; the dedicated prototype workspace Home
control remains unchanged.

Focused correction coverage verifies materially different Home content for all
seven perspectives, exact additive fixture reconciliation, weighted attendance,
scope-aware Student and Finance content, Context Ribbon agreement, persistence
across workspace changes, disabled Northgate access and unchanged platform
authorization wording.

## Final role, scope and workspace coverage

| Coverage dimension          | Automated evidence                                                                                                 | Result |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| 7 perspectives × 3 scopes   | 21 scoped presentation contracts; each has distinct title, description and three prioritized tasks                 | PASS   |
| 8 workspaces × 3 scopes     | Home, My Day, Administration, Students, Admissions, Teaching, Finance and Assessment exercised at all three scopes | PASS   |
| Organization Owner heading  | `Your school group today` at organization scope                                                                    | PASS   |
| Individual Owner headings   | Named Primary/Academy overview headings                                                                            | PASS   |
| Multi-responsibility My Day | Scoped, categorized, deduplicated role task list; presentation-only control                                        | PASS   |
| Student 360                 | Primary and Academy learner/guardian/balance examples switch with scope                                            | PASS   |
| Applicant 360               | Primary and Academy applicant/placement examples switch with scope                                                 | PASS   |
| Teaching/attendance         | School-matched classes, rooms, learners and register rows                                                          | PASS   |
| Payment verification        | School-matched payer rows and exact-decimal scoped totals                                                          | PASS   |
| Assessment blockers         | Scoped sheets, submissions, blockers, learners and subject example                                                 | PASS   |
| Context integrity           | Ribbon and workspace read the same synthetic scope state                                                           | PASS   |
| Denial boundaries           | Northgate disabled; Platform Console separately restricted                                                         | PASS   |

## Responsive and accessibility coverage

|  Width | Verification source                                                                   | Result                                 |
| -----: | ------------------------------------------------------------------------------------- | -------------------------------------- |
|  320px | Responsive CSS/component assertions; founder mobile review of prior corrected preview | PASS with final preview review pending |
|  375px | Responsive CSS/component assertions; founder mobile review                            | PASS with final preview review pending |
|  390px | Responsive CSS/component assertions; founder mobile review                            | PASS with final preview review pending |
|  768px | Breakpoint/component review and responsive register behavior                          | PASS with final preview review pending |
| 1024px | Breakpoint/component review and table/card balance                                    | PASS with final preview review pending |
| 1440px | Desktop component and layout review                                                   | PASS with final preview review pending |

The workspace selector has tab semantics, roving tab focus, Left/Right arrow
navigation, automatic active-tab centering, a narrow-screen swipe hint, an edge
fade and contained horizontal scrolling. Netlify team SSO prevents independent
Work-browser capture without an invited browser session. No public-homepage
image is used as PX3 evidence. The founder independently reviewed the protected
preview and formally accepted revision
`109ab881f6870856a45426b25c32bf047c5d7015` with documented limitations. This
records founder evidence; it does not recast the blocked Work-browser capture as
an independently performed visual test.

## Founder acceptance fixture record

| Measure               | Cedarbridge Primary | Cedarbridge Academy |   Organization |
| --------------------- | ------------------: | ------------------: | -------------: |
| Active learners       |                 684 |                 600 |          1,284 |
| Present today         |                 651 |                 559 |          1,210 |
| Attendance follow-ups |                  33 |                  41 |             74 |
| Collections           |      ₦14,880,000.00 |       ₦9,800,450.00 | ₦24,680,450.00 |
| Pending approvals     |                   7 |                   5 |             12 |

Founder acceptance is **ACCEPTED WITH DOCUMENTED LIMITATIONS**. Synthetic data
is nonpersistent; perspective switching does not grant permissions; mutations
remain disabled; generic links remain illustrative; PX6 owns full operational
migration and PX7 owns the interactive demo. Northgate remains inaccessible and
Platform Super Admin remains separate from Organization Owner.

## Deferred by design

- Full operational-route migration belongs to PX6.
- Live demo tenant, credentials, impersonation, perspective switching and reset
  belong to PX7.
- Prototype actions do not write data.
- Production closeout still requires the protected merge, exact-revision
  deployment and non-destructive production verification.
