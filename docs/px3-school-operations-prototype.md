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

## Rollback

Remove the isolated route and `src/components/px3` directory. There is no schema,
data or configuration rollback.
