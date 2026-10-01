-- M11 Parent / Student / Communication. Portal access is relationship/self
-- scoped and communication remains school-owned. External delivery providers
-- are intentionally outside this milestone.

create type public.portal_actor_kind as enum ('guardian', 'student');
create type public.communication_notice_status as enum ('draft', 'published', 'unpublished', 'expired');
create type public.communication_priority as enum ('normal', 'important', 'urgent');
create type public.communication_audience_kind as enum ('school', 'guardians', 'students', 'class_level', 'class_arm', 'student', 'guardian');
create type public.communication_thread_status as enum ('open', 'closed', 'archived');
create type public.communication_participant_kind as enum ('staff', 'guardian', 'student');
create type public.communication_message_status as enum ('sent', 'withdrawn');
create type public.communication_channel as enum ('in_app', 'email', 'sms', 'whatsapp', 'push');

insert into public.product_features (module_id,key,name,description)
select m.id,v.key,v.name,v.description from public.product_modules m cross join (values
 ('communication.family_portal','Family portal','Relationship-scoped guardian access'),
 ('communication.student_portal','Student portal','Self-scoped learner access'),
 ('communication.portal_insights','Portal insights','Published results, attendance and finance visibility'),
 ('communication.information_center','Information center','Targeted notices and protected attachments'),
 ('communication.messaging','Messaging','Controlled school and family conversations')
) v(key,name,description) where m.key='communication' on conflict (key) do nothing;

insert into public.permissions (key,description) values
 ('communication.portal_accounts.manage','Link guardian and student portal accounts'),
 ('communication.notices.manage','Create and publish targeted notices'),
 ('communication.messages.manage','Create and moderate communication threads'),
 ('communication.messages.participate','Participate in authorized communication threads')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id,role_id,permission_id)
select r.organization_id,r.id,p.id from public.roles r cross join public.permissions p
where r.key='organization_owner' and p.key like 'communication.%' on conflict do nothing;

create table public.portal_accounts (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
 user_id uuid not null references auth.users(id) on delete restrict,
 person_id uuid not null references public.people(id) on delete restrict,
 actor_kind public.portal_actor_kind not null, is_active boolean not null default true,
 linked_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
 linked_at timestamptz not null default now(), deactivated_at timestamptz,
 foreign key (school_id,organization_id) references public.schools(id,organization_id) on delete restrict,
 unique (id,organization_id,school_id), unique (organization_id,school_id,user_id,actor_kind),
 unique (organization_id,school_id,person_id,actor_kind),
 check ((is_active and deactivated_at is null) or (not is_active and deactivated_at is not null))
);
create index portal_accounts_user_idx on public.portal_accounts(user_id,is_active,school_id);

create table public.communication_notices (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
 title text not null check (char_length(trim(title)) between 3 and 180),
 body text not null check (char_length(trim(body)) between 1 and 10000),
 priority public.communication_priority not null default 'normal',
 status public.communication_notice_status not null default 'draft',
 publish_at timestamptz, expires_at timestamptz,
 published_by uuid references auth.users(id) on delete restrict, published_at timestamptz,
 created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
 updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key (school_id,organization_id) references public.schools(id,organization_id) on delete restrict,
 unique(id,organization_id,school_id),
 check (expires_at is null or publish_at is null or expires_at > publish_at),
 check ((status='published' and published_by is not null and published_at is not null) or status<>'published')
);
create index communication_notices_feed_idx on public.communication_notices(organization_id,school_id,status,published_at desc);

create table public.communication_notice_audiences (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
 notice_id uuid not null, audience_kind public.communication_audience_kind not null,
 class_level_id uuid, class_arm_id uuid, student_id uuid, guardian_person_id uuid,
 snapshot jsonb not null default '{}'::jsonb check(jsonb_typeof(snapshot)='object'),
 created_at timestamptz not null default now(),
 foreign key(notice_id,organization_id,school_id) references public.communication_notices(id,organization_id,school_id) on delete cascade,
 foreign key(class_level_id,organization_id,school_id) references public.class_levels(id,organization_id,school_id) on delete restrict,
 foreign key(class_arm_id,organization_id,school_id) references public.class_arms(id,organization_id,school_id) on delete restrict,
 foreign key(student_id,organization_id) references public.student_profiles(id,organization_id) on delete restrict,
 foreign key(guardian_person_id) references public.people(id) on delete restrict,
 unique(id,organization_id,school_id),
 check ((audience_kind='class_level')=(class_level_id is not null)),
 check ((audience_kind='class_arm')=(class_arm_id is not null)),
 check ((audience_kind='student')=(student_id is not null)),
 check ((audience_kind='guardian')=(guardian_person_id is not null))
);
create index notice_audiences_target_idx on public.communication_notice_audiences(notice_id,audience_kind,class_level_id,class_arm_id,student_id,guardian_person_id);

create table public.communication_notice_reads (
 notice_id uuid not null, user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 read_at timestamptz not null default now(), primary key(notice_id,user_id),
 foreign key(notice_id) references public.communication_notices(id) on delete cascade
);

create table public.communication_notice_documents (
 notice_id uuid not null, document_id uuid not null, organization_id uuid not null, school_id uuid not null,
 attached_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
 attached_at timestamptz not null default now(), primary key(notice_id,document_id),
 foreign key(notice_id,organization_id,school_id) references public.communication_notices(id,organization_id,school_id) on delete cascade,
 foreign key(document_id,organization_id,school_id) references public.documents(id,organization_id,school_id) on delete restrict
);

create table public.communication_threads (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
 subject text not null check(char_length(trim(subject)) between 3 and 180),
 student_id uuid, status public.communication_thread_status not null default 'open',
 created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(school_id,organization_id) references public.schools(id,organization_id) on delete restrict,
 foreign key(student_id,organization_id) references public.student_profiles(id,organization_id) on delete restrict,
 unique(id,organization_id,school_id)
);
create index communication_threads_scope_idx on public.communication_threads(organization_id,school_id,status,updated_at desc);

create table public.communication_thread_participants (
 thread_id uuid not null, organization_id uuid not null, school_id uuid not null,
 user_id uuid not null references auth.users(id) on delete restrict,
 participant_kind public.communication_participant_kind not null, joined_at timestamptz not null default now(),
 left_at timestamptz, last_read_at timestamptz, primary key(thread_id,user_id),
 foreign key(thread_id,organization_id,school_id) references public.communication_threads(id,organization_id,school_id) on delete cascade
);
create index communication_participants_user_idx on public.communication_thread_participants(user_id,left_at,thread_id);

create table public.communication_messages (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
 thread_id uuid not null, sender_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
 body text not null check(char_length(trim(body)) between 1 and 5000),
 status public.communication_message_status not null default 'sent', client_request_id uuid not null,
 sent_at timestamptz not null default now(), withdrawn_at timestamptz,
 foreign key(thread_id,organization_id,school_id) references public.communication_threads(id,organization_id,school_id) on delete restrict,
 unique(id,organization_id,school_id), unique(thread_id,sender_user_id,client_request_id),
 check((status='withdrawn')=(withdrawn_at is not null))
);
create index communication_messages_thread_idx on public.communication_messages(thread_id,sent_at,id);

create table public.communication_message_documents (
 message_id uuid not null, document_id uuid not null, organization_id uuid not null, school_id uuid not null,
 attached_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
 attached_at timestamptz not null default now(), primary key(message_id,document_id),
 foreign key(message_id,organization_id,school_id) references public.communication_messages(id,organization_id,school_id) on delete cascade,
 foreign key(document_id,organization_id,school_id) references public.documents(id,organization_id,school_id) on delete restrict
);

create table public.communication_preferences (
 user_id uuid not null references auth.users(id) on delete cascade, organization_id uuid not null,
 optional_in_app boolean not null default true, email_enabled boolean not null default false,
 sms_enabled boolean not null default false, whatsapp_enabled boolean not null default false,
 push_enabled boolean not null default false, updated_at timestamptz not null default now(),
 primary key(user_id,organization_id), foreign key(organization_id) references public.organizations(id) on delete restrict
);

alter table public.notifications add column if not exists event_key text;
create unique index notifications_recipient_event_key_idx on public.notifications(recipient_user_id,event_key) where event_key is not null;

create or replace function public.can_manage_communication(org uuid,school uuid,perm text)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and public.has_school_membership(org,school)
 and public.has_permission(org,school,perm) and public.has_module_entitlement(org,'communication')
$$;
revoke all on function public.can_manage_communication(uuid,uuid,text) from public,anon;
grant execute on function public.can_manage_communication(uuid,uuid,text) to authenticated;

create or replace function private.portal_feature_enabled(org uuid,feature text)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.organization_plans op
  join public.plan_module_entitlements pme on pme.plan_id=op.plan_id and pme.enabled
  join public.product_modules pm on pm.id=pme.module_id and pm.key='communication' and pm.is_active
  join public.product_features pf on pf.module_id=pm.id and pf.key=feature and pf.is_active
  left join public.organization_feature_flags off on off.organization_id=org and off.feature_id=pf.id
  where op.organization_id=org and op.status in ('trialing','active') and op.starts_at<=now()
   and (op.ends_at is null or op.ends_at>now()) and coalesce(off.enabled,pf.default_enabled)
 );
$$;
revoke all on function private.portal_feature_enabled(uuid,text) from public,anon,authenticated;

create or replace function public.portal_can_access_student(target_student uuid,target_school uuid,feature text default 'communication.family_portal')
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.portal_accounts pa join public.student_profiles sp on sp.organization_id=pa.organization_id
  where pa.user_id=auth.uid() and pa.school_id=target_school and pa.is_active
   and private.portal_feature_enabled(pa.organization_id,feature)
   and ((pa.actor_kind='student' and pa.person_id=sp.person_id and sp.id=target_student)
    or (pa.actor_kind='guardian' and exists(select 1 from public.guardian_relationships gr where gr.organization_id=pa.organization_id
      and gr.student_id=target_student and gr.guardian_person_id=pa.person_id and gr.has_portal_access
      and gr.effective_from<=current_date and (gr.effective_to is null or gr.effective_to>=current_date))))
   and exists(select 1 from public.student_enrollments e where e.student_id=sp.id and e.school_id=target_school and e.status in ('active','completed'))
 )
$$;
revoke all on function public.portal_can_access_student(uuid,uuid,text) from public,anon;
grant execute on function public.portal_can_access_student(uuid,uuid,text) to authenticated;

create or replace function private.portal_notice_visible(n public.communication_notices,target_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select n.status='published'
  and coalesce(n.publish_at,n.published_at)<=now()
  and (n.expires_at is null or n.expires_at>now())
  and exists(
   select 1
   from public.portal_accounts pa
   join public.communication_notice_audiences a on a.notice_id=n.id
   where pa.user_id=target_user and pa.organization_id=n.organization_id
    and pa.school_id=n.school_id and pa.is_active
    and private.portal_feature_enabled(pa.organization_id,'communication.information_center')
    and (
     a.audience_kind='school'
     or (a.audience_kind='guardians' and pa.actor_kind='guardian')
     or (a.audience_kind='students' and pa.actor_kind='student')
     or (a.audience_kind='guardian' and a.guardian_person_id=pa.person_id)
     or exists(
      select 1 from public.student_profiles sp
      where (
       (pa.actor_kind='student' and sp.person_id=pa.person_id)
       or (pa.actor_kind='guardian' and exists(
        select 1 from public.guardian_relationships gr
        where gr.student_id=sp.id and gr.guardian_person_id=pa.person_id
         and gr.has_portal_access and gr.effective_from<=current_date
         and (gr.effective_to is null or gr.effective_to>=current_date)
       ))
      ) and (
       (a.audience_kind='student' and a.student_id=sp.id)
       or (a.audience_kind='class_level' and exists(
        select 1 from public.class_memberships cm where cm.student_id=sp.id
         and cm.school_id=n.school_id and cm.status='active' and cm.class_level_id=a.class_level_id
       ))
       or (a.audience_kind='class_arm' and exists(
        select 1 from public.class_memberships cm where cm.student_id=sp.id
         and cm.school_id=n.school_id and cm.status='active' and cm.class_arm_id=a.class_arm_id
       ))
      )
     )
    )
  );
$$;
revoke all on function private.portal_notice_visible(public.communication_notices,uuid) from public,anon,authenticated;

create or replace function public.portal_dashboard(target_student uuid,target_school uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; begin
 if not public.portal_can_access_student(target_student,target_school,'communication.portal_insights') then raise exception 'Portal resource unavailable' using errcode='42501'; end if;
 select jsonb_build_object(
  'student',jsonb_build_object('id',sp.id,'studentNumber',sp.student_number,'firstName',p.first_name,'lastName',p.last_name),
  'publishedResults',coalesce((
   select jsonb_agg(
    jsonb_build_object(
     'publicationId',rp.id,
     'publishedAt',rp.published_at,
     'snapshot',jsonb_build_object(
      'batch',rp.snapshot->'batch',
      'results',(
       select coalesce(jsonb_agg(item),'[]'::jsonb)
       from jsonb_array_elements(coalesce(rp.snapshot->'results','[]'::jsonb)) item
       where item->>'student_id'=target_student::text
      )
     )
    ) order by rp.published_at desc
   )
   from public.result_publications rp
   where rp.school_id=target_school
    and exists(
     select 1 from jsonb_array_elements(coalesce(rp.snapshot->'results','[]'::jsonb)) item
     where item->>'student_id'=target_student::text
    )
  ),'[]'::jsonb),
  'attendance',coalesce((select jsonb_build_object('total',count(*),'present',count(*) filter(where ae.status='present'),'absent',count(*) filter(where ae.status='absent'),'late',count(*) filter(where ae.status='late')) from public.student_attendance_entries ae where ae.school_id=target_school and ae.student_id=target_student),'{}'::jsonb),
  'finance',coalesce((select jsonb_build_object('invoices',count(distinct i.id),'billed',coalesce(sum(c.original_amount),0),'paid',coalesce((select sum(pa.amount) from public.payment_allocations pa join public.student_charges pc on pc.id=pa.student_charge_id where pc.student_id=target_student and pc.school_id=target_school),0)) from public.student_invoices i left join public.student_charges c on c.invoice_id=i.id where i.student_id=target_student and i.school_id=target_school),'{}'::jsonb)
 ) into result from public.student_profiles sp join public.people p on p.id=sp.person_id where sp.id=target_student;
 return result;
end $$;
revoke all on function public.portal_dashboard(uuid,uuid) from public,anon;
grant execute on function public.portal_dashboard(uuid,uuid) to authenticated;

create or replace function public.portal_context()
returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object(
  'accountId',pa.id,'organizationId',pa.organization_id,'schoolId',pa.school_id,
  'schoolName',s.name,'actorKind',pa.actor_kind,
  'learners',coalesce((select jsonb_agg(jsonb_build_object('studentId',sp.id,'studentNumber',sp.student_number,'firstName',p.first_name,'lastName',p.last_name) order by p.first_name,p.last_name)
   from public.student_profiles sp join public.people p on p.id=sp.person_id
   where (pa.actor_kind='student' and sp.person_id=pa.person_id)
    or (pa.actor_kind='guardian' and exists(select 1 from public.guardian_relationships gr where gr.organization_id=pa.organization_id and gr.student_id=sp.id and gr.guardian_person_id=pa.person_id and gr.has_portal_access and gr.effective_from<=current_date and (gr.effective_to is null or gr.effective_to>=current_date))
     and exists(select 1 from public.student_enrollments e where e.student_id=sp.id and e.school_id=pa.school_id and e.status in ('active','completed')))),'[]'::jsonb)
  )),'[]'::jsonb)
 from public.portal_accounts pa join public.schools s on s.id=pa.school_id
 where pa.user_id=auth.uid() and pa.is_active
  and (private.portal_feature_enabled(pa.organization_id,'communication.family_portal')
   or private.portal_feature_enabled(pa.organization_id,'communication.student_portal'))
$$;
revoke all on function public.portal_context() from public,anon;
grant execute on function public.portal_context() to authenticated;

create or replace function public.portal_notice_feed()
returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',n.id,'schoolId',n.school_id,'title',n.title,'body',n.body,'priority',n.priority,'publishedAt',n.published_at,'expiresAt',n.expires_at,'readAt',r.read_at) order by n.published_at desc),'[]'::jsonb)
 from public.communication_notices n left join public.communication_notice_reads r on r.notice_id=n.id and r.user_id=auth.uid()
 where private.portal_notice_visible(n,auth.uid())
$$;
revoke all on function public.portal_notice_feed() from public,anon;
grant execute on function public.portal_notice_feed() to authenticated;

create or replace function private.is_thread_participant(target_thread uuid,target_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.communication_thread_participants p where p.thread_id=target_thread and p.user_id=target_user and p.left_at is null)
$$;
revoke all on function private.is_thread_participant(uuid,uuid) from public,anon,authenticated;

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

alter table public.portal_accounts enable row level security;
alter table public.communication_notices enable row level security;
alter table public.communication_notice_audiences enable row level security;
alter table public.communication_notice_reads enable row level security;
alter table public.communication_notice_documents enable row level security;
alter table public.communication_threads enable row level security;
alter table public.communication_thread_participants enable row level security;
alter table public.communication_messages enable row level security;
alter table public.communication_message_documents enable row level security;
alter table public.communication_preferences enable row level security;

create policy portal_accounts_self_select on public.portal_accounts for select to authenticated using(user_id=(select auth.uid()) or public.can_manage_communication(organization_id,school_id,'communication.portal_accounts.manage'));
create policy portal_accounts_manage on public.portal_accounts for all to authenticated using(public.can_manage_communication(organization_id,school_id,'communication.portal_accounts.manage')) with check(public.can_manage_communication(organization_id,school_id,'communication.portal_accounts.manage'));
create policy notices_select on public.communication_notices for select to authenticated using(public.can_manage_communication(organization_id,school_id,'communication.view') or private.portal_notice_visible(communication_notices,(select auth.uid())));
create policy notices_manage on public.communication_notices for all to authenticated using(public.can_manage_communication(organization_id,school_id,'communication.notices.manage')) with check(public.can_manage_communication(organization_id,school_id,'communication.notices.manage'));
create policy notice_audiences_select on public.communication_notice_audiences for select to authenticated using(exists(select 1 from public.communication_notices n where n.id=notice_id and (public.can_manage_communication(n.organization_id,n.school_id,'communication.view') or private.portal_notice_visible(n,(select auth.uid())))));
create policy notice_audiences_manage on public.communication_notice_audiences for all to authenticated using(public.can_manage_communication(organization_id,school_id,'communication.notices.manage')) with check(public.can_manage_communication(organization_id,school_id,'communication.notices.manage'));
create policy notice_reads_self on public.communication_notice_reads for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and exists(select 1 from public.communication_notices n where n.id=notice_id and private.portal_notice_visible(n,(select auth.uid()))));
create policy notice_documents_select on public.communication_notice_documents for select to authenticated using(exists(select 1 from public.communication_notices n where n.id=notice_id and (public.can_manage_communication(n.organization_id,n.school_id,'communication.view') or private.portal_notice_visible(n,(select auth.uid())))));
create policy notice_documents_manage on public.communication_notice_documents for all to authenticated using(public.can_manage_communication(organization_id,school_id,'communication.notices.manage')) with check(public.can_manage_communication(organization_id,school_id,'communication.notices.manage'));
create policy threads_participant_select on public.communication_threads for select to authenticated using(public.can_manage_communication(organization_id,school_id,'communication.messages.manage') or private.is_thread_participant(id,(select auth.uid())));
create policy threads_manage on public.communication_threads for all to authenticated using(public.can_manage_communication(organization_id,school_id,'communication.messages.manage')) with check(public.can_manage_communication(organization_id,school_id,'communication.messages.manage'));
create policy participants_select on public.communication_thread_participants for select to authenticated using(user_id=(select auth.uid()) or private.is_thread_participant(thread_id,(select auth.uid())) or public.can_manage_communication(organization_id,school_id,'communication.messages.manage'));
create policy participants_manage on public.communication_thread_participants for all to authenticated using(public.can_manage_communication(organization_id,school_id,'communication.messages.manage')) with check(public.can_manage_communication(organization_id,school_id,'communication.messages.manage'));
create policy messages_participant_select on public.communication_messages for select to authenticated using(private.is_thread_participant(thread_id,(select auth.uid())) or public.can_manage_communication(organization_id,school_id,'communication.messages.manage'));
create policy message_documents_select on public.communication_message_documents for select to authenticated using(exists(select 1 from public.communication_messages m join public.communication_thread_participants p on p.thread_id=m.thread_id where m.id=message_id and p.user_id=(select auth.uid()) and p.left_at is null) or public.can_manage_communication(organization_id,school_id,'communication.messages.manage'));
create policy message_documents_manage on public.communication_message_documents for all to authenticated using(public.can_manage_communication(organization_id,school_id,'communication.messages.manage')) with check(public.can_manage_communication(organization_id,school_id,'communication.messages.manage'));
create policy preferences_self on public.communication_preferences for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

do $$ declare t text; begin foreach t in array array['portal_accounts','communication_notices','communication_notice_audiences','communication_threads','communication_messages'] loop execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.capture_audit_event()',t,t); end loop; end $$;

grant select,insert,update on public.portal_accounts,public.communication_notices,public.communication_notice_audiences,public.communication_notice_reads,public.communication_notice_documents,public.communication_threads,public.communication_thread_participants,public.communication_preferences to authenticated;
grant select on public.communication_messages,public.communication_message_documents to authenticated;

comment on table public.portal_accounts is 'Authenticated portal identities linked to existing people; learner access remains relationship/self derived.';
comment on table public.communication_notices is 'School-owned information-center notices with immutable audience intent at publication.';
comment on table public.communication_threads is 'Controlled school/family/student conversation threads; not unrestricted chat.';
