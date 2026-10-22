# Platform Owner architecture and founder-account gap analysis

Status: planning only, 19 October 2026. No Platform Owner Dashboard, operator grants, subscription billing tables or production changes are implemented by this proposal. Founder approval is required before implementation.

## Verified application boundaries

- Application authentication is shared, but current production code authorizes work through organization memberships, school memberships, organization-scoped roles and centralized permission / entitlement / feature evaluation.
- Organization creation atomically creates an Organization Owner. `private.bootstrap_organization_owner` is a trigger helper; Organization Owner is tenant authority and does not establish SaaS operator authority.
- Administration explicitly describes that platform boundary. `/px4-platform` is a fixture-driven prototype, not a functioning privileged control plane.
- The inspected QA database has no `platform_owner`, `platform_admin` or `platform_super_admin` role. All existing `roles` entries are organization scoped. This must not be worked around with an all-organizations membership or a broad RLS bypass.
- The verified QA owner profile is active and linked to a person record. That evidence does not identify or certify the permanent production founder account. A tenant owner's email or QA user ID must not be silently adopted as the permanent platform principal.
- Organization-plan bootstrapping creates a standard trialing Starter plan. The source does not set a mandatory 30-day end timestamp during bootstrap. Existing plan evaluation supports an `ends_at` boundary, but that is not evidence that the approved 30-day policy has been implemented.
- No implemented SaaS invoice, subscription-payment evidence, bank-transfer verification or flagged-registration queue was found in the inspected application schema. Existing Finance payments, receipts and allocations belong to schools and must remain separate.

## Approved policies translated into requirements

| Approved policy                       | Proposed behavior / missing control                                                                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hybrid registration                   | Ordinary eligible schools may self-register; invited / assisted registrations remain available. Use one authenticated onboarding system.                                                                                           |
| Automatic standard trial              | Activate standard access only after required account verification and validated onboarding. Store activation time and chosen trial plan atomically.                                                                                |
| 30-day trial                          | Authoritative UTC `trial_started_at` and `trial_ends_at = trial_started_at + interval '30 days'`; deterministic expiry, idempotent activation and audited exceptions. Do not infer expiry from a UI countdown.                     |
| Flagged and exceptional registrations | Persist review reason and status; manual approval/rejection with actor, timestamp and audit. Do not silently grant operator privileges to reviewers.                                                                               |
| Verified bank-transfer subscriptions  | Separate subscription invoice, expected amount/currency/reference, private payment proof, authorized manual review, immutable decision and idempotent activation. Keep reconciliation, reversals and support exceptions auditable. |
| Separate SaaS and school Finance      | Dedicated subscription domain and private evidence storage; no reuse of student charges, school receipts, school cashier sessions or tenant finance roles for SaaS subscription decisions.                                         |

## Proposed authorization model

Keep the single application and single login. Add a separate server-authorized control-plane namespace (for example `/platform`) only after approval. Tenant Organization Owners must receive no access merely by owning schools.

Use an explicit platform-principal assignment tied to the permanent Auth user ID, stored in a private schema with no tenant-managed write path. Distinguish founder / platform owner, registration reviewer, subscription reviewer and support roles. Each route and mutation requires its exact platform capability, current account status and appropriate stronger authentication. Do not authorize from editable user metadata, email-domain matching, the UI persona selector or a client-stored role.

Create separate append-only platform audit records because current school audit events require tenant context. Log operator, capability, target organization, reason, request / idempotency key and before/after references. Support should default to service health and case metadata, without broad student or financial data access. Any later support access to tenant records needs a separately approved, time-bounded, audited design.

Do not expose service-role credentials in a browser or give the founder an interactive service-role session. Server-only privileged operations must reauthorize the authenticated operator and constrain the target and allowed action. Maintain independent review for subscription payment verification and subscription entitlement changes where practical.

## Permanent founder account checklist for implementation approval

1. Identify the intended permanent production account explicitly and verify ownership through the supported secure authentication flow. QA identities are excluded. Do not record credentials, one-time links or tokens in repository documentation.
2. Review verified email, recovery methods, stronger authentication, session revocation and safe recovery / break-glass ownership without publishing secret material.
3. Verify the founder's person/profile link, display name and required operator contact fields; provide an authorized profile-maintenance UI. Current `profiles` alone is not an operator authorization record.
4. Define exactly who may create, suspend or transfer the platform-owner assignment. Account deletion / transfer and emergency access need an explicit audited process, not a hardcoded email or hidden bypass.
5. Approve role/capability definitions, control-plane route scope, audit storage, subscription schema and trial migration policy before code or migrations are added.

## Proposed Dashboard scope and implementation order

First implement the authorization and audit foundation, with deny-by-default tests proving every tenant owner is denied. Then add a read-only overview of registrations, trial expirations, subscriptions, flagged cases and service health. Follow with separately authorized review queues for registration decisions and bank-transfer subscriptions. Add audited exceptions and operational reporting last.

Required verification includes tenant-to-platform denial, least-privilege operator permissions, disabled/suspended principal denial, multi-school scoping, trial boundary / clock tests, duplicate and concurrent subscription verification, private proof access, correction history and production rollback. Financial totals and entitlement changes must remain server authoritative.

Approval deliverable: a bounded implementation proposal with migrations, permission map, read/write contracts, founder enrollment / recovery procedure, acceptance matrix and release sequence. This document is not approval to implement that Dashboard.
