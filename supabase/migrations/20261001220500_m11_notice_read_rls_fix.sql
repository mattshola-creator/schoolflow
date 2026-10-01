-- Route notice read-state authorization through the caller-bound public predicate.
-- The original policy invoked a private helper whose EXECUTE privilege is
-- intentionally revoked from authenticated users.
drop policy if exists notice_reads_self on public.communication_notice_reads;
create policy notice_reads_self
on public.communication_notice_reads
for all
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and public.can_access_communication_notice(notice_id)
);
