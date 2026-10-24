# Bounded score-sheet context read proposal

Status: review only; no hosted SQL, grants, RLS or application integration authorized by this proposal. Exact proposed SQL is in `assessment-score-sheet-context.sql`; its leading execution guard deliberately prevents accidental application.

## Missing access and proposed boundary

An authorized score-sheet reader can currently receive an authorized batch while its embedded academic context and assigned staff/person labels are filtered by separate directory/setup policies. Do not grant academic setup or staff-directory access to resolve the labels.

Add one read-only RPC with three required UUIDs: batch, selected organization and selected school. Reuse `can_read_result_batch` unchanged, including its current assignment, membership, module/feature and subscription conditions. Return only six nullable display strings: subject, session, period, class, arm and assigned teacher. No IDs, contacts, profiles, employments, student records, scores or results are returned.

The Teacher can receive only its own canonical assigned name, checked against the existing assignment predicate and its canonical profile/person link. Other readers receive the name only through existing `can_view_staff`; a Principal's batch visibility does not automatically grant staff-directory visibility. All joins retain matching organization, school, session and class relationships. Foreign, absent and unauthorized batches use the same denial category. Expected missing names remain null; unexpected SQL failures remain failures.

## Security impact requiring founder authorization

One new `SECURITY DEFINER` read endpoint in the existing exposed schema, with empty search path, fully qualified object references, no dynamic SQL and explicit authentication. PUBLIC/anonymous execution is revoked; authenticated execution is proposed. Existing table privileges, policies, role definitions, entitlements and mutation RPCs remain unchanged. The endpoint bypasses underlying metadata RLS only for these allowlisted labels after the existing batch authorization succeeds. This limited increase in readable fields requires separate approval before any QA application.

## Validation and application sequence

1. Validate syntax and denial/allowlist behavior in a disposable in-memory PostgreSQL instance using fictional records. Mock foundational authorization inputs explicitly; this does not establish live identity, RLS or subscription acceptance.
2. After exact-contract approval, generate a migration through the CLI, recheck current helper definitions and constraints, and apply only to isolated QA.
3. Update generated RPC types and call it through the original authenticated client after the existing batch lookup and explicit selected context. Do not add a service client or browser credential handling.
4. Preserve denied, missing and unexpected-failure states. Verify real Teacher names/context and Owner/Principal restrictions in protected QA before release.

Required cases: anonymous and missing identity; foreign/mismatched organization or school; unknown batch; unassigned subject/class/school; ended assignment/employment; suspended membership; expired entitlement; own canonical Teacher name; mismatched canonical person; management with and without staff authority; null historical assignment; missing metadata; tampered foreign label relationships; six-field serialization allowlist; no anonymous EXECUTE; unchanged direct-table denial; unchanged score/history counts. Concurrency and live role acceptance are separate gates.

## Recovery

Disable/revert the application adapter first, then drop only `get_assessment_score_sheet_context(uuid,uuid,uuid)`. No data or history rollback is needed. Never broaden directory policies as a fallback. Production application requires a separately approved release.

Detailed live identifiers, diagnostics, invitation tokens and private screenshots are excluded from this public proposal. No restricted evidence destination is configured by this change.
