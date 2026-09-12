# ADR-0002: Identity, tenancy and authorization

- Status: Accepted
- Date: 12 September 2026

## Context

SchoolFlow must support one authenticated account across multiple organizations and schools without allowing tenant identifiers supplied by a browser to grant access.

## Decision

- Supabase Auth owns credentials and sessions; `profiles` links an Auth user to a reusable `person` record.
- `organizations` are the tenant boundary. Schools and optional management groups belong to exactly one organization; locations are independent organization records so schools may share a location.
- Organization and school memberships establish data scope. Roles are organization-owned permission bundles, while role assignments carry organization, management-group or school scope.
- PostgreSQL constraints prevent cross-organization references. RLS and server-side checks enforce authorization for every exposed tenant table.
- Active organization/school context is an HTTP-only preference selected only from RLS-filtered memberships. It never expands database access.
- Tenant onboarding and invitation acceptance are atomic, narrowly granted `security definer` RPCs with fixed search paths, authenticated caller checks and database validation.
- User-editable Auth metadata is used only for initial display-name capture, never for authorization.

## Consequences

Every later module must carry an organization boundary and use membership/permission helpers in operation-specific RLS policies. New permissions can be added without hard-coding authority into UI routes. Entitlements and subscription enforcement remain M2 work.
