# PX1 — Design System v2 and Application Shell

**Status:** implementation complete; founder visual acceptance pending

**Branch:** `feat/px1-design-system-shell`

**Production state:** not merged and not activated

## Boundary

PX1 changes presentation only. It does not introduce a database migration,
permission, entitlement, feature flag, tenant record or Platform Console. The
existing authentication, tenancy, authorization evaluator, RLS, service layer
and module routes remain authoritative.

The authenticated shell is implemented on the PX1 branch so it can be tested
against real authorization snapshots. `/px1-reference` is a public,
synthetic-only reference route for visual review on a preview deployment. It
does not query or mutate production tenant data.

## Design tokens

`src/app/globals.css` defines the PX1 semantic layer:

- neutral background, surface, raised surface, foreground and muted text;
- border and strong-border roles;
- SchoolFlow brand and tenant-accent roles;
- information, success, warning and danger states;
- small through extra-large radius roles;
- small through large elevation roles;
- fast and standard motion timing;
- a high-visibility focus ring;
- reduced-motion overrides.

PX1 uses the existing SchoolFlow emerald family as the safe fallback accent.
The tenant-accent variables form the future branding integration boundary;
PX1 does not persist or publish branding configuration.

## Shared component inventory

| Area         | PX1 component/pattern                                                             |
| ------------ | --------------------------------------------------------------------------------- |
| Actions      | `Button`, `ButtonLink`, three variants and two sizes                              |
| Forms        | `FormField`, `TextInput`, semantic descriptions and inline errors                 |
| Surfaces     | `SurfaceCard`, `PageHeader`, `DetailList`                                         |
| Status       | `StatusBadge`, `StatusNotice`, `StatePanel`                                       |
| States       | empty, error, unauthorized, unentitled, disabled, setup required, invalid context |
| Navigation   | grouped `WorkspaceNavigation`, mobile modal drawer, collapsible desktop sidebar   |
| Data         | `DataTable` with component-level horizontal scrolling                             |
| Organization | semantic `Tabs`                                                                   |
| Overlays     | native accessible `Dialog`; mobile navigation drawer                              |
| Feedback     | `LoadingSkeleton` and live-region state panels                                    |

## Navigation contract

The approved order is:

1. Home
2. People
3. Academics
4. Operations
5. Communication
6. Insights
7. Administration

Items continue to originate from `buildWorkspaceAccess`. Missing permissions
remain hidden. A permitted but unavailable feature is shown as unavailable
with its actual entitlement/feature reason and is not made into a link.
Search and notifications become links only when their underlying authorized
Management or Action Center routes are present.

Desktop navigation may collapse to icons and stores only that presentation
preference in local storage. Mobile navigation retains focus trapping, Escape,
body-scroll locking and focus return.

## Context Ribbon contract

The Context Ribbon presents:

**Organization → School/organization-wide scope → Session → Term**

- Organization and school come from `loadTenantContext` and its validated
  context cookies.
- Session and term are RLS-scoped reads for the active school.
- Current records are preferred; a planned record is a visible fallback.
- Organization-wide scope never invents a school academic period.
- Missing values read “Session not configured” and “Term not configured”.
- Context switching calls the existing validated `switchContext` action.
- Mobile compresses the hierarchy without dropping the academic status.

## Reference implementation

- Authenticated reference: `/experience-preview`
- Synthetic visual-review route: `/px1-reference`

The reference demonstrates the new shell, Context Ribbon, KPI cards, filters,
forms, tables, tabs, badges, loading, dialog and distinct access/setup states.
All names and figures on `/px1-reference` are synthetic.

## Accessibility and responsive behavior

- Minimum 44-pixel interactive targets.
- Visible focus treatment from the semantic focus token.
- Skip navigation and main-content focus target.
- Semantic landmarks, labels, table caption and live regions.
- Native dialog semantics and explicit dismissal.
- Reduced-motion support.
- Purpose-built mobile drawer under `md`, tablet sidebar from `md`, and
  expanded layouts at `lg`/`xl`.
- Wide tables scroll inside their component; page-level overflow is avoided.

## Rollback

PX1 is isolated on its feature branch. Before founder acceptance, rollback is
branch/preview removal only. If later approved and merged, the previous shell
can be restored by reverting the PX1 merge; no database or tenant data rollback
is necessary.

## Deferred items

- Broad operational-page migration.
- Prototype Packs A–E.
- Global command palette and full universal-search service.
- Notification drawer/read-model redesign.
- Branding Studio and persisted tenant branding.
- Platform Console and platform-operator authorization.
- Personalized Home/My Day composition.
- Dark theme.

## Dependency status

PX1 does not modify dependencies. The PX0/M13 audit findings for Next.js,
`sharp`, `source-map-js` and `braces` remain tracked separately and are not
suppressed by this work.
