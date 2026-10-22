-- Reauthorize retained thread participants against current school/portal access.
create or replace function private.is_thread_participant(target_thread uuid,target_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select target_user=auth.uid() and exists(
  select 1 from public.communication_thread_participants p
  join public.communication_threads t on t.id=p.thread_id
  where p.thread_id=target_thread and p.user_id=target_user and p.left_at is null
   and private.portal_feature_enabled(t.organization_id,'communication.messaging')
   and (
    (p.participant_kind='staff' and (
     public.can_manage_communication(t.organization_id,t.school_id,'communication.messages.participate')
     or public.can_manage_communication(t.organization_id,t.school_id,'communication.messages.manage')
    ))
    or (p.participant_kind in ('guardian','student') and exists(
     select 1 from public.portal_accounts pa
     where pa.user_id=target_user and pa.organization_id=t.organization_id
      and pa.school_id=t.school_id and pa.is_active
      and pa.actor_kind::text=p.participant_kind::text
      and (t.student_id is null or public.portal_can_access_student(t.student_id,t.school_id,'communication.messaging'))
    ))
   )
 )
$$;
revoke all on function private.is_thread_participant(uuid,uuid) from public,anon,authenticated;

CREATE OR REPLACE FUNCTION public.send_communication_message(target_thread uuid, target_body text, target_request uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare t public.communication_threads; mid uuid; begin
 select * into t from public.communication_threads where id=target_thread for update;
 if not found or t.status<>'open' or not private.is_thread_participant(t.id,auth.uid()) then raise exception 'Thread unavailable' using errcode='42501'; end if;
 if char_length(trim(target_body)) not between 1 and 5000 then raise exception 'Message is invalid' using errcode='22023'; end if;
 insert into public.communication_messages(organization_id,school_id,thread_id,body,client_request_id)
 values(t.organization_id,t.school_id,t.id,trim(target_body),target_request)
 on conflict(thread_id,sender_user_id,client_request_id) do update set body=public.communication_messages.body returning id into mid;
 update public.communication_threads set updated_at=now() where id=t.id;
 insert into public.notifications(organization_id,school_id,recipient_user_id,kind,title,body,href,event_key)
 select t.organization_id,t.school_id,p.user_id,'system'::public.notification_kind,t.subject,left(trim(target_body),1000),'/portal/messages/'||t.id,'message:'||mid
 from public.communication_thread_participants p where p.thread_id=t.id and p.user_id<>auth.uid() and p.left_at is null
 on conflict(recipient_user_id,event_key) where event_key is not null do nothing;
 return mid;
end $function$;

CREATE OR REPLACE FUNCTION public.can_access_communication_thread(target_thread uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists(
  select 1 from public.communication_threads t
  where t.id=target_thread and private.portal_feature_enabled(t.organization_id,'communication.messaging') and (
   public.can_manage_communication(t.organization_id,t.school_id,'communication.messages.manage')
   or private.is_thread_participant(t.id,auth.uid())
  )
 )
$function$;

revoke all on function public.send_communication_message(uuid,text,uuid),public.can_access_communication_thread(uuid) from public,anon;
grant execute on function public.send_communication_message(uuid,text,uuid),public.can_access_communication_thread(uuid) to authenticated;

