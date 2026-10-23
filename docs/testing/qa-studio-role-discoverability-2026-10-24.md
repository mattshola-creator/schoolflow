# Studio discoverability and role experience — 24 October 2026

Baseline: f1ca210f68929982195daa7ae34d2fffcdf6ba06, draft integration PR128. QA only.

## Confirmed source gaps and implemented correction

Studio existed at /administration/branding but neither application shell advertised it. Ordinary (app) layout did not opt into appearance or consume published school settings. Both Owner shell and normal application shell now use a shared presentation-link policy. Effective Owner authority, explicit school context, school.manage and existing foundation capability are required for the Studio navigation entry. The Studio independently repeats its own Owner/subscription checks. Ordinary Owner routes now consume the existing scoped published/personal palette loader. No draft, arbitrary styling, asset or privileged client is serialized by this change.

Routes: /administration/branding (existing Studio); /administration/roles (bounded configured-role assignment UI); /workspaces (current identity's own effective role list and allowed task destinations); /administration/role-preview (Owner-only QA synthetic explorer). Build marker and exact QA project checks retain production isolation. Role explorer reuses the existing eight-audience DemoDashboard and scoped visualization CSS, clearly labels fictional data and changes no session or permission. It is not live workflow acceptance.

## Role boundaries

Existing QA catalogue contains organization_owner and three bounded QA roles. No Principal, Vice Principal, generic Teacher, Bursar, Admissions, Staff, Guardian or Student permission set is invented. Coverage is explained in the interface. Assignment/revocation uses the authenticated client and existing role_assignments RLS/audit triggers. Requires role.manage, explicit matching school/organization, existing active school and organization membership, a configured non-system role, and no permission beyond the actor's effective set. Self-assignment/revocation, Owner and system role changes, foreign context and empty role grants are denied. Ended assignments retain audit history. Deterministic assignment IDs prevent duplicate rows from this action's overlapping inserts; database concurrency acceptance remains open.

My workspaces & roles is authorized task navigation, not a reduced-role session. Selecting a role preview never changes auth identity or RLS. Users with multiple grants continue to have their effective union of permissions. Separate actual synthetic accounts remain necessary for role-specific acceptance.

## Verification and limits

Local targeted appearance/navigation/action tests, strict TypeScript and targeted zero-warning lint passed before publishing. Hosted full regression/build/audit and independent scan must be verified against the new head. No actual role assignment or revocation was performed during this source implementation. No data/identity/schema/grant/entitlement changes. Existing DEMO26 population preserved.

Mobile controls use fluid grids, min-width-zero selects and 44px controls. Actual authenticated 360/390/tablet/desktop screenshots remain blocked until a supported authenticated browser session and viewport control are available. Source layout checks do not substitute for screenshots. Subscription/private image/publishing refresh and palette contrast across legacy domain content require live retest; only palette integration is changed here. Custom background delivery remains in existing protected Storage contract, not generalized into all domain pages.

Rollback: revert this application commit; previously published branding history and all demo data are untouched. Production remains unchanged; PR remains draft/unmerged.

## Follow-up validation

Successful Studio publication now calls router.refresh only after a successful server mutation, refreshing the surrounding published shell immediately. A denied mutation leaves the shell unchanged. Role page renders expected authorization denial separately from unexpected failures. Reassignment appends a new role-assignment row instead of rewriting ended history. Twenty-four targeted tests passed plus local strict TypeScript and targeted lint.

CI395 at c5d2c6f6e83cadc80d6573f1b0b6ed2d775ccc63 passed tests, both builds, format, lint, TypeScript and independent scan but failed unsuppressed audit on newly reported Zod GHSA-mrhx-c7xc-m3w5 (<4.6.6). Supported patch investigation is active. Historical braces finding was withdrawn upstream; no findings are suppressed. Live acceptance remains blocked by missing secure browser sessions.
