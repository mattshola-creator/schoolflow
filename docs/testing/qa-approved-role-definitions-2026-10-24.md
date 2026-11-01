# Approved QA role definitions — 24 October 2026

Founder replied "proceed" to the exact Principal/Bursar proposal in PR131. Application baseline remains893b3529600d137af06f9526c7de76086079649a, protected deploy6adca64ca3df51462dfabeac. PR128 remains draft/unmerged. No application redeploy required for definitions.

Applied only to QA project afqykqlxecpzspjoyegc: non-system qa_principal_review with the exact13 approved keys; non-system qa_bursar_recorder with the exact4 approved recorder keys. Existing Owner's effective organization permission subset verified. No changes to existing roles, assignments, memberships, auth identities, entitlements, PostgreSQL grants, RLS, schemas or production.

Validation: full transaction executed and rolled back before persistence; persistent execution succeeded; replay returned the same two definitions and counts. Zero assignments for both. Exactly2 qa.role_definition.provisioned audit events after replay; actor_user_id null plus explicit administrative QA connector execution label and founder authorization metadata. No Owner JWT/actor spoofing. This is administrative QA fixture provisioning, not authenticated Owner application evidence.

Existing Cedarbridge synthetic identities: teacher, recorder, verifier, each active organization/school membership and intended original role. No separate Principal identity exists. No identity recreated, role reassigned, or duplicate recorder assignment added. Own-identity Principal/Bursar acceptance remains OPEN. The approved proposal limits assignment to verified existing identities; a distinct eligible Principal identity is a prerequisite before assignment.

Current browser tab handle is absent; no sign-out initiated. Role-page browser verification has not been passed. Prior new-head Owner acceptance remains preserved separately. Mobile, teacher own-identity, true Finance/Studio overlap and eligible private-image fixture gates remain OPEN.

Reproducible QA-only data script: scripts/qa/provision-approved-role-definitions.sql. It locks retry execution, validates exact synthetic organization/school identifiers, refuses unknown keys and nonmatching existing definitions, preserves immutable audit history, and never creates assignments. It must never be included in a production release candidate.

Rollback: no access has been granted to users by these unused definitions, so no user access needs revocation. Preserve unused definitions and audit records pending review. If later pilot assignments exist, end only those assignments through authorized operations, preserving history. Do not delete audit records or run broad role/permission deletion.
