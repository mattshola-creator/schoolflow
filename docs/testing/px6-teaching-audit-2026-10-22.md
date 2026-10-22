# QA teaching assignment audit repair

Applied only to QA afqykqlxecpzspjoyegc as 20261022201726_qa_teaching_assignment_audit. No grants, RLS, validation or workflow changes.

Root cause: teaching_assignments had timestamp and validation triggers, but no capture_audit_event trigger. Reuse the existing empty-search-path trigger function after INSERT/UPDATE/DELETE. The audit insert participates in the same transaction, so audit failure rejects the write. No historical backfill or synthetic past actor/time.

Database-role test, fully rolled back: authorized Owner update produced update.teaching_assignments with the actual Owner actor and correct organization/school. Teacher update returned zero rows under unchanged RLS. An initial verification SELECT used the wrong audit timestamp column and failed; the transaction did not commit. The corrected query passed.

Existing synthetic assignment remains unchanged. Positive INSERT/DELETE actor tests, cross-tenant attempt and actual browser lifecycle acceptance remain required. Rollback drops only the trigger; retained audit history must not be deleted.

Full previous PR124 code gates passed except unsuppressed audit. This change is SQL/documentation only and does not close teacher score entry or transaction concurrency.
