# Shared-shell appearance integration

## Impact and implementation boundary

The existing ApplicationShell gains an optional enableAppearance presentation prop. It defaults to false, preserving existing callers. When opted in, Premium Emerald is the initial theme; a labeled selector permits Classic Light and Midnight Emerald in component state only. The fixed catalog is reused through a shell-only CSS variable adapter.

Affected presentation: ApplicationShell, WorkspaceNavigation, ContextRibbon and scoped appearance styles imported by the global stylesheet. Existing navigation data, links, mobile dialog handlers, collapse preference, account controls, logout action and context switch form remain unchanged. No domain loader, workflow, metric, entitlement or authorization service is modified. Existing domain content keeps its original application tokens and colors.

The isolated /design/shared-shell route composes these actual components outside the normal app route-group layout, avoiding nested shells. It retains the existing organization-inspection capability and matching organization/school context checks. Hosted rendering requires a Deploy Preview bound to the QA project; development rendering remains available locally. This review route is not the live Owner dashboard.

## Verification and rollout

Verify all themes at 320,360,768,1440px; desktop sidebar collapse; mobile focus containment/Escape/return; account menu; context disclosure and selector; long names; keyboard focus; contrast; reduced motion; empty/unavailable navigation. Tests preserve legacy default, permission-derived destinations and route denial/context matching. Run format, lint, strict types, full tests, build, independent secret scan and unsuppressed dependency audit.

Runtime theme values do not change html, body, application-wide tokens, cookies, localStorage or database settings. The existing sidebar-collapse preference is retained. Removing enableAppearance restores the existing shell; removing the review route leaves existing application routes unchanged. Broader app-layout wiring and live role-dashboard redesign require their own review after this contained implementation.

Browser verification also corrected the icon-only home link name, made navigation heading IDs unique across desktop and mobile, improved drawer account contrast and allowed long context labels to wrap. These changes preserve existing navigation targets and context actions.
