# QA demo population — 23 October 2026

Project: `afqykqlxecpzspjoyegc`. Application baseline: `94aac8466a990a9a42da93c4761a3d14a647c687`, protected deploy `6adb3d001f5dcccb6e983b9d`.

## Actual writes and verification

Three administrative seed batches added 168 students with 168 guardian links, 27 staff with active employment/school assignments, 24 started admission applications with guardians/checklists, three sections, 14 class levels, four subjects, 28 teaching assignments, 20 timetable periods, 140 timetable entries, 28 draft lesson plans, 28 delivery records, 70 attendance registers and 840 marks. Finance: 14 fee structures and billing runs, 168 invoices, 336 charges and 84 recorded, unverified synthetic payments.

Current global QA totals: **180 students, 30 staff, 24 admissions**. All three batches were rerun: counts unchanged. Checks found zero missing demo guardians/enrollments, zero foreign-school demo enrollments, zero billing-run/charge total mismatches and zero disabled RLS flags among checked core tables. Existing rows were preserved. No account, password, role, privilege, schema or real plan changes; no external payment/message operation.

Stable prefix `DEMO26` and deterministic MD5-derived UUIDs distinguish customer-demo data from PX6 disposable fixtures. Scripts are QA-only manual seed records, never migrations or application startup hooks. Execute only through an independently verified QA project connection, in numeric order. Advisory transaction locks serialize seed retries; inserts do not overwrite existing records. Do not delete by broad organization filters. For rollback, prefer a disposable QA snapshot restore or a separately reviewed dependency-ordered cleanup using only deterministic DEMO26 identifiers; no destructive rollback was executed.

## Attribution

This is administrative SQL population, **not** authenticated workflow acceptance. Required created_by/recorded_by fields reference the founder sponsor because their schema requires an auth user; auth.uid() was deliberately not impersonated. Trigger actor_user_id and explicit demo.seed.batch actor remain NULL, with administrative execution and sponsor identified in metadata. Synthetic notes distinguish seeded payments/lessons from actual actions. No independent verification or receipts were fabricated.

## Incomplete

Admission lifecycles, verified payments/receipts/allocations, published Assessment/report cards, communication/documents/notifications and authenticated browser navigation remain incomplete. Owner/teacher live acceptance, genuine transaction overlap and private Storage acceptance remain open. Browser sign-in/configuration is a separate blocker; seed data does not close it.

PRs119–127 were rechecked and retain their reviewed heads, drafts and unmerged state. Existing integration contains the reviewed module developments; no new compatible head was found. Production unchanged.

Hosted CI39942430910 rerun passed all quality gates including unsuppressed dependency audit and independent secret scan. Historical braces failure is retained; the advisory was withdrawn upstream. These population scripts do not change application runtime.
