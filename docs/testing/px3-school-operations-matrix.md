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

| Check                       | Status  | Evidence                          |
| --------------------------- | ------- | --------------------------------- |
| Focused interaction tests   | PASS    | PX3 prototype test suite          |
| Formatting                  | PASS    | Prettier check                    |
| Zero-warning lint           | PASS    | Local lint                        |
| Strict TypeScript           | PASS    | Local typecheck                   |
| Full regression suite       | PASS    | 324 tests across 72 files         |
| Production build            | PASS    | Next.js 16.3.8 optimized build    |
| Responsive layout tests     | PASS    | Mobile-card/table and shell tests |
| Live desktop visual check   | PASS    | Protected preview at 1363px       |
| Founder responsive review   | PENDING | Protected preview                 |
| Secret scan                 | PASS    | Local tracked secret-pattern scan |
| Production dependency audit | PASS    | Zero production vulnerabilities   |

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

## Deferred by design

- Full operational-route migration belongs to PX6.
- Live demo tenant, credentials, impersonation, perspective switching and reset
  belong to PX7.
- Prototype actions do not write data.
- Founder acceptance is required before merge or production deployment.
