# PX6 Release Unit 2 — Administration

**State:** implemented for protected founder review  
**Branch:** `feat/px6-ru2-administration`

## Bounded scope

RU2 migrates `/administration` from the pilot access summary to the accepted
Administration Center presentation using live, caller-authorized records. It
includes active organization/school context, exact scoped membership and
pending-invitation counts, bounded invitation and role-assignment references,
human-readable effective-access groups, and permission/entitlement/feature
aware module explanations.

The route uses the authenticated Supabase client and existing RLS policies for
`organization_memberships`, `school_memberships`, `invitations`,
`role_assignments` and `management_groups`. It refuses to render if active
tenant context and the effective authorization snapshot disagree.

## Deliberate boundaries

- No schema, migration, RLS, permission, entitlement or feature change.
- No service-role or platform-operator path.
- Organization Owner remains separate from Platform Super Admin.
- Platform-owned plan, entitlement and controlled-rollout writes remain
  unavailable to tenant administrators.
- The current repository has no complete invitation-delivery or general
  role-mutation domain service. RU2 therefore does not invent a write flow on
  top of table access; those mutations remain deferred until a separately
  reviewed server contract exists.
- Personal profile access is not broadened. Role rows use privacy-limited
  member references unless an established authorized profile service exists.

## Rollback

Revert the single RU2 merge and allow Git-connected Netlify deployment to
publish the prior application revision. There is no database rollback,
persisted prototype state or data conversion.

## Verification approach

Focused presentation/model tests cover permission-derived sections, hidden
membership and role states, privacy-limited references and distinct module
unavailability. Full authorization, tenancy, navigation and regression tests
remain mandatory, together with formatting, lint, strict TypeScript,
production build, production/full audits and secret scans. Independent
authenticated preview rendering is recorded as NOT TESTED if Netlify Team
Protection blocks the Work browser.
