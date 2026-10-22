-- Validate every notification recipient, including access revoked after joining.
create or replace function private.is_thread_participant(target_thread uuid,target_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.communication_thread_participants p
  join public.communication_threads t on t.id=p.thread_id
  where p.thread_id=target_thread and p.user_id=target_user and p.left_at is null
   and private.portal_feature_enabled(t.organization_id,'communication.messaging')
   and (
    (p.participant_kind='staff' and exists(
     select 1 from public.organization_memberships om
     where om.organization_id=t.organization_id and om.user_id=target_user
      and om.status='active' and om.effective_from<=now() and (om.effective_to is null or om.effective_to>now())
      and (om.all_schools or exists(
       select 1 from public.school_memberships sm where sm.organization_id=t.organization_id
        and sm.school_id=t.school_id and sm.user_id=target_user and sm.status='active'
        and sm.effective_from<=now() and (sm.effective_to is null or sm.effective_to>now())))
      and exists(
       select 1 from public.role_assignments ra
       join public.role_permissions rp on rp.role_id=ra.role_id and rp.organization_id=ra.organization_id
       join public.permissions perm on perm.id=rp.permission_id
       where ra.organization_id=t.organization_id and ra.user_id=target_user and ra.status='active'
        and ra.effective_from<=now() and (ra.effective_to is null or ra.effective_to>now())
        and perm.key in ('communication.messages.participate','communication.messages.manage')
        and (ra.scope='organization' or (ra.scope='school' and ra.school_id=t.school_id)
         or (ra.scope='management_group' and exists(
          select 1 from public.management_group_schools gs where gs.management_group_id=ra.management_group_id
           and gs.organization_id=t.organization_id and gs.school_id=t.school_id)))
      )
    ))
    or (p.participant_kind in ('guardian','student') and exists(
     select 1 from public.portal_accounts pa
     where pa.user_id=target_user and pa.organization_id=t.organization_id
      and pa.school_id=t.school_id and pa.is_active and pa.actor_kind::text=p.participant_kind::text
      and (t.student_id is null or exists(
       select 1 from public.student_profiles sp where sp.id=t.student_id and sp.organization_id=t.organization_id
        and ((pa.actor_kind='student' and pa.person_id=sp.person_id) or
         (pa.actor_kind='guardian' and exists(
          select 1 from public.guardian_relationships gr where gr.organization_id=t.organization_id
           and gr.student_id=sp.id and gr.guardian_person_id=pa.person_id and gr.has_portal_access
           and gr.effective_from<=current_date and (gr.effective_to is null or gr.effective_to>=current_date))))
        and exists(select 1 from public.student_enrollments en where en.student_id=sp.id
         and en.organization_id=t.organization_id and en.school_id=t.school_id and en.status in ('active','completed'))
      ))
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
 from public.communication_thread_participants p where p.thread_id=t.id and p.user_id<>auth.uid() and p.left_at is null and private.is_thread_participant(t.id,p.user_id)
 on conflict(recipient_user_id,event_key) where event_key is not null do nothing;
 return mid;
end $function$;


