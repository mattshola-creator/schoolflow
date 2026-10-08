# PX1 — Design System v2 and Application Shell

**Status:** implementation complete; founder visual acceptance pending

**Branch:** `feat/px1-design-system-shell`

**Draft PR:** `#91`

**Implementation revision:** latest head of draft PR `#91` (recorded in the PR)

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
body-scroll locking and focus return. Its modal panel uses the dynamic viewport
height, keeps the identity/close header fixed and gives the grouped navigation
its own overscroll-contained region. The backdrop remains pointer-dismissible
without entering the dialog's keyboard focus order.

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
- Netlify deploy preview: PR `#91` latest deploy (`Ready`)
- Preview URL: `https://deploy-preview-91--schoolflow-app.netlify.app/px1-reference`

The reference demonstrates the new shell, Context Ribbon, KPI cards, filters,
forms, tables, tabs, badges, loading, dialog and distinct access/setup states.
All names and figures on `/px1-reference` are synthetic.

The existing Netlify non-production team-login protection remains enabled.
Automated screenshot capture therefore stops at Netlify's access boundary until
an invited founder authenticates. PX1 does not weaken that protection merely to
produce visual evidence. Desktop, tablet and mobile inspection remain the
founder visual-acceptance step; they do not block review of the implementation
or the protected preview itself.

## Founder responsive-review refinement

The founder accepted the overall desktop/mobile direction in principle and
requested one bounded refinement pass. The reference now provides:

- a compact mobile Context Ribbon whose disclosure reveals untruncated
  organization, school, session and term values;
- mobile learner cards for the common four-field register, while retaining the
  standard table at tablet/desktop sizes and for genuinely complex datasets;
- complete, wrapping account identity in the mobile navigation drawer and
  account menu;
- explicit accessible names and 44-pixel targets for navigation, search,
  notifications, profile and context controls;
- reduced mobile introductory spacing and denser desktop navigation; and
- improved tablet/intermediate-width register and form balance.

The refinement is presentational only. It does not change context validation,
authorization, entitlements, RLS, domain services, accounts or tenant data.

## Final mobile-navigation correction

The final founder-review correction isolates drawer behavior at 320, 375 and
390 CSS-pixel widths:

- the panel occupies the usable dynamic viewport and clips its outer frame;
- the branded account header and 44-pixel close control remain visible;
- navigation groups scroll independently with overscroll containment and safe
  area padding;
- the document background is locked while the dialog is open and restored on
  every close path;
- a stronger modal backdrop distinguishes the drawer from expanded context
  content behind it;
- long account identities receive a full-width, naturally wrapping region
  instead of character-by-character breaking; and
- backdrop dismissal, Escape, focus trapping and trigger-focus restoration are
  covered by focused component tests.

Navigation items still come from the unchanged permission/entitlement-aware
catalog. The unavailable Platform Console remains a non-link behind its
separate platform-operator authorization boundary.

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
suppressed by this work. GitHub Actions run `#210` passed install, formatting,
lint, strict TypeScript, 302 tests across 69 files and the production build. It
failed only at the dependency-audit step because the unchanged base currently
reports three high, four moderate and one low advisory. The preview remains
protected by Netlify team login; production rollout remains withheld.
