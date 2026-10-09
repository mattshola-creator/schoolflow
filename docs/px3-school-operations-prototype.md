# PX3 School Operations prototype contract

PX3 validates SchoolFlow's accepted PX1 visual language against representative
staff workflows. It is not a second operational application and does not replace
the M3–M10 services.

## Route

`/px3-operations` is an isolated, synthetic reference experience. It is safe for
a protected deploy preview and has no API, Server Action or Supabase dependency.

## Synthetic organization

- Organization: Cedarbridge Learning Group.
- Authorized schools: Cedarbridge Primary School and Cedarbridge Academy.
- Denial fixture: Northgate School, intentionally unavailable.
- Academic context: 2026/2027, First Term.
- All people, balances, applications, scores and identifiers are fictional.

## Experience architecture

The prototype combines three layers:

1. PX1 Application Shell and Context Ribbon.
2. A perspective and operating-scope control that demonstrates multiple
   responsibilities without granting access.
3. Eight bounded reference workspaces covering Home, My Day, Administration,
   Students, Admissions, Teaching/Attendance, Finance and Assessment.

## Scope and responsibility behavior

- Organization Owner at organization scope sees **Your school group today**
  with cross-school comparison and organization approval language.
- Organization Owner at an individual school sees that school's overview,
  operating health, exceptions and school-level approvals.
- The other six perspectives retain role-specific priorities and explicitly
  state whether figures include both authorized schools or one named school.
- My Day combines the selected staff responsibility with scoped tasks, assigns
  clear work categories, prioritizes urgent work and does not alter access.
- Scope state persists while moving through every workspace and drives the
  shown members, learners, applicants, classes, payments and assessments.
- The Context Ribbon is driven by the same prototype state and is explicitly
  labelled synthetic; authenticated production context remains unchanged.

## Deterministic fixture reconciliation

| Measure               | Cedarbridge Primary | Cedarbridge Academy |   Organization |
| --------------------- | ------------------: | ------------------: | -------------: |
| Active learners       |                 684 |                 600 |          1,284 |
| Present today         |                 651 |                 559 |          1,210 |
| Attendance follow-ups |                  33 |                  41 |             74 |
| Collections           |      ₦14,880,000.00 |       ₦9,800,450.00 | ₦24,680,450.00 |
| Pending approvals     |                   7 |                   5 |             12 |
| Assessment blockers   |                   1 |                   2 |              3 |

Organization percentages are calculated from aggregated numerators and
denominators. Percentages are never added or blindly averaged.

## Security contract

- Perspective selection changes presentation only.
- Northgate School cannot be selected.
- Platform Console remains a separate unavailable capability.
- Finance, attendance and assessment mutation controls are disabled.
- No production records, identities, sessions, documents or entitlements are
  queried or changed.
- Existing authorization, RLS, exact-decimal Finance and server-authoritative
  Assessment behavior remain authoritative.

## Responsive contract

- Desktop uses dense tables for registers, Finance and score entry.
- Mobile replaces those tables with readable record cards.
- Tablet retains touch-sized inputs and sticky action areas for teaching,
  attendance and assessment.
- Navigation and workspace selectors scroll within their component boundaries,
  not at the page level.
- On narrow screens, a visible swipe hint and edge fade advertise additional
  workspaces; selecting or arrowing to a workspace centers the active tab.
- Workspace tabs expose tab semantics, arrow-key movement, visible focus and
  44px minimum touch height.

## Rollback

Remove the isolated route and `src/components/px3` directory. There is no schema,
data or configuration rollback.
