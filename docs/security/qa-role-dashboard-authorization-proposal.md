# Bounded QA role dashboard authorization proposal

Review only. Do not execute role provisioning from this document without founder authorization for these specific permission sets. No new schema, PostgreSQL GRANT, RLS, RPC, subscription or platform authority is proposed.

## Verified catalogue, 24 October 2026

QA project afqykqlxecpzspjoyegc has organization_owner (116 permissions), qa_assessment_teacher (5), qa_payment_recorder (4), qa_payment_verifier (5), qa_internal_read_only (15). Principal/Bursar are absent. Teacher currently has academics.view, academics.scores.view, academics.scores.enter, academics.scores.submit and students.view. Do not add school-wide Teaching or academic setup merely to repair navigation; the application fallback uses the existing Assessment route and its assignment RLS.

## Proposed role definitions

Create non-system organization-local definitions only for the existing Cedarbridge synthetic QA school, using existing roles/role_permissions structures. Validate every key against permissions and require it to be a subset of the authenticated Owner's delegable permissions. Never create platform or organization-wide principal assignments.

Principal pilot key qa_principal_review, exact keys:

- organization.view
- school.view
- students.view
- attendance.view
- academics.view
- academics.scores.view
- academics.results.view
- academics.results.review
- reporting.dashboard.view
- reporting.school.view
- reporting.academic.view
- reporting.attendance.view
- shared.tasks.view

This initial role can read permitted school reporting and review submitted results. It cannot enter scores, approve/publish/correct results, promote students, manage locks/setup/roles or access Finance. Teaching summaries remain unavailable until their separate school-wide read scope is approved. No staff-private records included.

Bursar recorder pilot key qa_bursar_recorder, exact keys (identical to current bounded recorder):

- finance.view
- finance.billing.view
- finance.payments.view
- finance.payments.record

Independent verifier remains the existing separately authenticated qa_payment_verifier identity. No verifier/allocator/correction/expense approval/cashier/role-management permissions added to the recorder. This is a bounded recording pilot, not authorization for every Finance operation.

Assignments: only existing verified synthetic identities with active matching organization and school membership; scope school; effective dates explicit. Do not reuse Owner identity for Principal/Bursar evidence, recreate accounts, assign a role to oneself or change existing assignments. If no distinct eligible identity exists, return that prerequisite before provisioning. Preserve canonical persons and audit actors.

## Required tests before acceptance

Owner delegation subset; role.manage denial; foreign organization/school; expired membership/effective dates; no self-grant; non-system role restriction; teacher assigned/unassigned score access; Principal review allowed and approval/publication/Finance denied; Bursar record allowed and independent verification denied; actual own-identity login/context/routing; append-only audit; idempotent retries and unchanged historical assignments.

Rollback: end only the newly created pilot assignments via existing authorized operations; preserve assignment history and audits. Remove unused definitions only through a separately reviewed reversible policy. Production is excluded.

## Current security and execution blockers

Read-only current QA catalog:110 authenticated-callable public SECURITY DEFINER functions;0 anon-callable;all have empty search_path. Selected allocate_payment/verify_payment/Studio entitlement definitions reviewed; this does not close110-function body/dependency review. Payment allocation locks payment and charge rows in stable charge order before balance reads. Verification checks can_access_finance and independent actor under finance_settings. These are structural evidence, not overlapping transaction acceptance.

Security advisor:110 definer warnings; leaked-password-protection warning remains. Two no-policy informational findings are intentional default-deny service-only Studio asset tables; never add client policies simply to silence them. Review references:

- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

This workspace has no psql and no configured verified direct QA connection. Existing staff multi-connection harness remains unexecuted. Sequential MCP calls must not count as concurrency proof. Browser named sessions do not establish isolated profiles; preserve Owner session until an independently authenticated teacher context is available.
