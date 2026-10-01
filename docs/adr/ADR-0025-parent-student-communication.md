# ADR-0025: Parent, Student and Communication

## Status

Accepted for M11.

## Decision

- `portal_accounts` links an authenticated user to an existing person; it does not duplicate guardian or student identity.
- Guardian learner access is derived from an active `guardian_relationships` record with `has_portal_access`. Student access is self-derived through the student person's profile.
- Portal academic views consume only immutable M10 `result_publications`; draft scores and workflow data remain inaccessible.
- Attendance and Finance remain authoritative in M8/M9. M11 exposes narrowly scoped read models rather than copying records.
- Notices are school-owned, audience-targeted, publishable and expirable. Audience intent is persisted separately and evaluated server-side.
- Messaging is participant-scoped, ordered and idempotent. It is controlled school communication, not unrestricted real-time chat.
- M6 notifications and private documents remain the delivery and attachment foundations. External email/SMS/WhatsApp/push providers remain replaceable future adapters.

## Consequences

Parent/student authentication never implies broad school membership. Every portal resource requires an active account, valid relationship/self mapping, school scope, module entitlement and feature enablement. Five independently switchable M11 features preserve safe rollout and QA controls.
