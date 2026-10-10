# PX5 — Founder visual acceptance and experience baseline

## Status

**FOUNDER ACCEPTED — documentation closeout in review. PX6 is not authorized by
this record.**

PX5 reconciles the accepted Product Experience 2.0 direction across the PX1
foundation and Prototype Packs A–E. It changes documentation only. The
M0–M13 security, tenancy, authorization, entitlement, Finance, assessment and
audit architecture remains authoritative.

## Accepted revision register

| Experience                                 | Founder-accepted reference                 | Production merge                           | Result                                                    |
| ------------------------------------------ | ------------------------------------------ | ------------------------------------------ | --------------------------------------------------------- |
| PX1 Design System and shell                | `6eac996685104784cca8e18df26c3ea7ecc5d41f` | `bf9d1c873c7db7abfb9f30fb1f8035aa9c094a93` | Accepted and production-verified                          |
| Pack A — Public SaaS Hub                   | PR #93 accepted head                       | `7438194fc5ce471c3d4441393a9cad985ab800af` | Accepted and production-verified                          |
| Pack B — School Operations                 | `109ab881f6870856a45426b25c32bf047c5d7015` | `b036ad61e7f27b5acbef3d4a123ebcdec6e50a6f` | Accepted with documented limitations; production-verified |
| Packs C–E — Families, Platform, Experience | `399b9a442a67d3493518d1deb4a0d30ae86ec5be` | `18d864ad4978637d989d59c5ce288f8ae121f51e` | Accepted with documented limitations; deployed            |

## Cross-pack acceptance

| Area          | Accepted direction                                                                    | Migration guardrail                                                   |
| ------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Visual system | Calm, professional PX1 tokens, accessible focus and contextual accent                 | Reuse tokens/components; do not create parallel systems               |
| Navigation    | Work-oriented, responsive, permission- and entitlement-aware                          | Existing authorization remains authoritative                          |
| Context       | Organization → School → Session → Term, with explicit synthetic context in prototypes | Never imply that a presentation selector changes production authority |
| Operations    | Responsibility-aware work, scoped registers, 360 views and action queues              | M3–M12 services and state machines remain authoritative               |
| Families      | Mobile-first, linked-learner switching and relationship-safe data                     | M11 relationship/RLS contracts govern production                      |
| Platform      | Platform operators remain separate from Organization Owners                           | Production operator model requires separate security design           |
| Experience    | Branding inheritance, scoped search/notifications and complete states                 | Persistence/publish contracts remain deferred                         |

## Evidence boundary

Founder screenshot and preview review supplies visual acceptance where Work
browser access was blocked by Netlify Team Protection. Automated component,
authorization and responsive tests are recorded separately and are not
represented as independent browser evidence. PX4 production rendering could not
be independently exercised by Work because its cloud browser returned
`ERR_BLOCKED_BY_CLIENT`; exact Netlify deployment evidence remains available.

## Founder decisions still required before affected production work

- Choose the production student Finance policy: none, summary-only, or
  separately authorized detailed access.
- Approve the production Platform Operator authorization model before PX8.
- Approve commercial plan names, limits, prices and legal copy.
- Approve branding persistence, publishing and rollback policy before PX8.
- Authorize PX6 explicitly after reviewing this PX5 package.

## Rollback

This PX5 branch is documentation-only and can be reverted without an
application or database rollback. Accepted production prototypes remain
route-isolated and do not replace operational routes.
