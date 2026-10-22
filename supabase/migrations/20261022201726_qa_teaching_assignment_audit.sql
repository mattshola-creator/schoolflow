-- QA-only PX6 audit repair. No grants, RLS, workflow or historical-row changes.
create trigger audit_teaching_assignments
 after insert or update or delete on public.teaching_assignments
 for each row execute function private.capture_audit_event();
-- Rollback: drop trigger audit_teaching_assignments on public.teaching_assignments;
-- Retain audit_events. Do not backfill a fabricated historical actor/time.
