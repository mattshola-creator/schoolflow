# QA dashboard visibility repair — 23 October 2026

Baseline: PR128 d5771b82d1501b011350c251a306c342fe35d0b2, deploy6adab2124354e7363d9e76c1.

## Verified source causes

Login and school-context actions redirect to /dashboard, which rendered the legacy operational home. Its app layout did not opt into the new shell. The real Owner composition existed only at /design/owner-dashboard. Studio's persisted effective selection was read only by the Studio page. The shell kept a temporary three-theme selection and did not consume school publication. Its CSS also forced a green navigation gradient for every non-Classic theme. These facts explain why integrating source branches did not make the newly published design visible after normal QA login.

The founder's exact browser URL is not observable from this report; production and stable QA may still be older releases. No operational production change is authorized. No specific margin defect was reproduced merely from the reported visual difference. Shared-shell responsive gutters remain unchanged; the duplicate main-content ID on the Owner page is removed to preserve the shell skip target.

## Bounded repair

Only a deploy-preview with the exact QA project binding and existing review flag enables automatic Owner routing. Before redirecting, validate effective capability, exact active school/context and an identity/organization-bound active effective Owner assignment. Other roles, group context and production keep their current dashboard. The destination service independently repeats Owner/domain authorization; neither build markers nor query strings grant authority.

An authorized QA Owner dashboard reads only the current school publication and current user's school preference through the authenticated client/RLS. Current theme entitlement is checked server-side. Individual preference takes priority only when eligible, followed by eligible published selection and then a core Emerald fallback. Unknown persisted styling and unexpected lookup failures remain errors. No draft config, asset URL, raw subscription row or privileged client is serialized. No new RLS, grants, schema, entitlement definition or persistence mutation.

Twelve existing curated palettes adapt to the bounded shell and real Owner content. Legacy aliases and three temporary personal display overrides remain compatible. Overrides are not persisted and reset to effective school appearance on a fresh visit. Context/theme key changes remount the shell to prevent carrying a temporary display override into another school. Premium content still depends on server predicates; the token adapter is presentation-only.

The complete showroom layout presets, decorative backgrounds and custom-image delivery are NOT claimed as live Owner-dashboard functionality by this palette repair. Private images, publishing/restore and Storage remain governed by their independent acceptance gates. No cross-school academic comparison is introduced.

Legacy escape: /dashboard?appearance=legacy; chrome-only fallback on the Owner page remains ?appearance=legacy. Source/history and metric calculations are unchanged.

## Verification and remaining gates

Local targeted 37 tests/5files passed, plus TypeScript; exact hosted full checks required. Tests cover production/foreign binding exclusion, missing role/expired role/capability/context denial, identity query filters, current publication rather than draft, private preference scope, downgrade fallback, unexpected errors, twelve-theme text/navigation contrast and refresh/legacy shell behavior. These are automated checks, not live authenticated acceptance.

Retest actual QA login→Owner, refresh, preserved sign-in, explicit legacy escape and permitted context switching at the revision-matched protected deploy. Do not sign out the only Owner session to manufacture logout evidence. Requested320/360/768/1440 viewport tests remain blocked unless supported genuine viewport control exists.

Storage credential must be entered by the founder through protected Netlify controls, QA Deploy Previews Functions only, secret enabled. Do not enumerate or export values. Teacher own-identity acceptance, genuine overlapping Studio/Finance transactions, private Storage/signing/expiry/restore, full plan-denial matrix, security review and unsuppressed braces finding remain release gates. Preserve all QA records and production unchanged.
