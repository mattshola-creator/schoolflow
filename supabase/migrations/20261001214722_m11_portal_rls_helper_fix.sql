-- RLS expressions execute as the caller. Keep private implementation helpers
-- uncallable and expose caller-bound public predicates for policy evaluation.
create or replace function public.can_access_communication_notice(target_notice uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.communication_notices n
  where n.id=target_notice and (
   public.can_manage_communication(n.organization_id,n.school_id,'communication.view')
   or private.portal_notice_visible(n,auth.uid())
  )
 )
$$;
revoke all on function public.can_access_communication_notice(uuid) from public,anon;
grant execute on function public.can_access_communication_notice(uuid) to authenticated;

create or replace function public.can_access_communication_thread(target_thread uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.communication_threads t
  where t.id=target_thread and (
   public.can_manage_communication(t.organization_id,t.school_id,'communication.messages.manage')
   or private.is_thread_participant(t.id,auth.uid())
  )
 )
$$;
revoke all on function public.can_access_communication_thread(uuid) from public,anon;
grant execute on function public.can_access_communication_thread(uuid) to authenticated;

drop policy if exists notices_select on public.communication_notices;
create policy notices_select on public.communication_notices for select to authenticated using(public.can_access_communication_notice(id));
drop policy if exists notice_audiences_select on public.communication_notice_audiences;
create policy notice_audiences_select on public.communication_notice_audiences for select to authenticated using(public.can_access_communication_notice(notice_id));
drop policy if exists notice_documents_select on public.communication_notice_documents;
create policy notice_documents_select on public.communication_notice_documents for select to authenticated using(public.can_access_communication_notice(notice_id));
drop policy if exists threads_participant_select on public.communication_threads;
create policy threads_participant_select on public.communication_threads for select to authenticated using(public.can_access_communication_thread(id));
drop policy if exists participants_select on public.communication_thread_participants;
create policy participants_select on public.communication_thread_participants for select to authenticated using(public.can_access_communication_thread(thread_id));
drop policy if exists messages_participant_select on public.communication_messages;
create policy messages_participant_select on public.communication_messages for select to authenticated using(public.can_access_communication_thread(thread_id));
drop policy if exists message_documents_select on public.communication_message_documents;
create policy message_documents_select on public.communication_message_documents for select to authenticated using(exists(select 1 from public.communication_messages m where m.id=message_id and public.can_access_communication_thread(m.thread_id)));
