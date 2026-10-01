# M12 durable continuation checkpoint

- Current phase: M12-I/J — release, production QA, and closeout.
- Completed: authoritative reconciliation; operational read-model inventory; permissions; five feature gates; per-school and management-group-compatible scope; RLS event evidence; dashboard; student/admissions/attendance/staff/teaching/Finance/published-results/promotion/communication/operations reporting; filters; contextual global search; CSV/browser print; locked close; idempotent draft rollover; responsive implementation; unit/contract regression.
- Branch: `feat/m12-management-reporting`.
- Local HEAD: pending M12 checkpoint commit (parent `7e25a85`).
- Migration: `20261001230144_m12_management_reporting.sql`; rollback rehearsal passed; production migration recorded as `20261001231631 m12_management_reporting`.
- Tests: 276 passing across 62 files. TypeScript, lint, and production build passed before documentation closeout.
- Supabase: five M12 features and 11 new granular permissions present; event table exists; anon dashboard execution denied. Established SECURITY DEFINER/performance warning classes remain; no missing-RLS or M12 critical finding observed.
- Production QA: not yet performed.
- Feature overrides: M12 defaults disabled; no M12 override enabled yet. M9/M10/M11 safe states must be reverified after QA.
- Synthetic fixtures: none created yet.
- Known issues: established advisor warnings only; release evidence pending.
- Exact next task: rerun final local gate, commit, publish PR, pass CI/merge/deploy exact revision, then run minimal scoped production acceptance and close documentation.
