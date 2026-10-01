-- PostgreSQL does not implicitly coerce text literals to an enum in
-- INSERT ... SELECT. Preserve the M11 functions and cast notification kind.
create or replace function public.publish_communication_notice(target_notice uuid)
returns void language plpgsql security definer set search_path='' as $$
declare n public.communication_notices; begin
 select * into n from public.communication_notices where id=target_notice for update;
 if not found or not public.can_manage_communication(n.organization_id,n.school_id,'communication.notices.manage') then raise exception 'Notice unavailable' using errcode='42501'; end if;
 if n.status<>'draft' or not exists(select 1 from public.communication_notice_audiences where notice_id=n.id) then raise exception 'Notice is not ready to publish' using errcode='23514'; end if;
 update public.communication_notices set status='published',published_by=auth.uid(),published_at=now(),publish_at=coalesce(publish_at,now()),updated_by=auth.uid(),updated_at=now() where id=n.id;
 insert into public.notifications(organization_id,school_id,recipient_user_id,kind,title,body,href,event_key)
 select distinct n.organization_id,n.school_id,pa.user_id,'system'::public.notification_kind,n.title,left(n.body,1000),'/portal/notices/'||n.id,'notice:'||n.id
 from public.portal_accounts pa where pa.organization_id=n.organization_id and pa.school_id=n.school_id and pa.is_active
 and private.portal_notice_visible((select x from public.communication_notices x where x.id=n.id),pa.user_id)
 on conflict(recipient_user_id,event_key) where event_key is not null do nothing;
end $$;
revoke all on function public.publish_communication_notice(uuid) from public,anon;
grant execute on function public.publish_communication_notice(uuid) to authenticated;

create or replace function public.send_communication_message(target_thread uuid,target_body text,target_request uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare t public.communication_threads; mid uuid; begin
 select * into t from public.communication_threads where id=target_thread for update;
 if not found or t.status<>'open' or not exists(select 1 from public.communication_thread_participants p where p.thread_id=t.id and p.user_id=auth.uid() and p.left_at is null) then raise exception 'Thread unavailable' using errcode='42501'; end if;
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
end $$;
revoke all on function public.send_communication_message(uuid,text,uuid) from public,anon;
grant execute on function public.send_communication_message(uuid,text,uuid) to authenticated;
