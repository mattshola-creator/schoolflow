# ADR-0007: Shared Services Foundation

## Status

Accepted for M6.

## Context

Admissions, attendance, finance, results and staff workflows all need audit, documents, tasks, approvals and notifications. Duplicating those records inside each feature would make authorization, history and reporting inconsistent.

## Decision

- `audit_events` is the append-oriented operational/security trail. Normal API roles can read authorized events but cannot update or delete them.
- `documents` owns file metadata and links to private objects in the `schoolflow-documents` Supabase Storage bucket. Storage access delegates to the same caller-bound permission, entitlement and feature checks as metadata access.
- `action_tasks` is the reusable Action Center queue with owner, priority, deadline and source references.
- Approval policies, ordered steps, requests and immutable decisions form the reusable approval engine. Caller-bound functions create policies/requests atomically and validate decision role scope.
- `notifications` is the in-app delivery foundation. Later communication work may add provider adapters without moving authoritative notification state into a provider.
- Shared services remain school-scoped inside the Organization tenant boundary and extend the M2 `foundation` entitlement rather than creating another authorization system.

## Consequences

- Later modules reference shared record IDs instead of creating parallel audit, file or approval tables.
- Generated document rendering, external notification delivery and domain-specific workflow conditions remain in their owning milestones.
- Restricted `SECURITY DEFINER` functions are caller-bound, have empty search paths, revoke anonymous/public execution and validate permission plus scope.
