# ADR-0003: Effective authorization and product availability

- Status: Accepted
- Date: 13 September 2026

## Context

M1 established organization memberships, scoped role assignments and RLS. M2 must add SaaS product availability without creating a competing authorization system or allowing plan names to leak into feature code.

## Decision

- `get_my_authorization` is the caller-bound database contract for effective permissions and product availability in one already-authorized organization/school context.
- The RPC derives the user from `auth.uid()`, validates membership and school scope, and never accepts a target user identifier.
- Application code evaluates a typed snapshot through one deterministic policy function. Server guards and navigation consume the same evaluator.
- Permission, module entitlement and operational feature state remain separate inputs. A capability is allowed only when every required input allows it.
- Plans and module entitlements are platform-owned configuration. Organization plan state and feature overrides cannot be modified by ordinary Data API roles.
- Commercial plan packaging is data-driven. The initial development catalog enables the approved V1 modules for all working plan names; future commercial decisions change records, not feature code.

## Consequences

Later module operations must declare their permission and module requirements and invoke the shared server guard in addition to their table-level RLS policies. Navigation filtering improves usability but is not an authorization boundary. Platform administration of plans and flags requires a separately authorized operator surface in a later approved scope.
