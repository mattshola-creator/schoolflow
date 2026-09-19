-- M6 Shared Services: one authoritative, tenant-aware foundation for audit,
-- documents, Action Center tasks, approvals and in-app notifications.

create type public.document_status as enum ('pending_upload', 'available', 'archived', 'quarantined');
create type public.action_task_status as enum ('open', 'in_progress', 'completed', 'cancelled');
create type public.action_task_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.approval_request_status as enum ('pending', 'approved', 'rejected', 'returned', 'cancelled');
create type public.approval_decision_kind as enum ('approved', 'rejected', 'returned');
create type public.notification_kind as enum ('system', 'action_required', 'approval', 'document');

insert into public.product_features (module_id, key, name, description)
select id, v.key, v.name, v.description
from public.product_modules m
cross join (values
  ('foundation.shared_services', 'Shared services', 'Audit, documents, tasks, approvals and notifications'),
  ('foundation.document_storage', 'Document storage', 'Secure private document upload and download'),
  ('foundation.action_center', 'Action Center', 'Scoped operational tasks and approval work')
) as v(key, name, description)
where m.key = 'foundation'
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('shared.audit.view', 'View scoped audit history'),
  ('shared.documents.view', 'View scoped documents'),
  ('shared.documents.manage', 'Upload and manage scoped documents'),
  ('shared.tasks.view', 'View scoped Action Center tasks'),
  ('shared.tasks.manage', 'Create and manage scoped Action Center tasks'),
  ('shared.approvals.view', 'View scoped approval requests'),
  ('shared.approvals.manage', 'Configure approval policies and submit requests'),
  ('shared.approvals.decide', 'Decide assigned approval requests'),
  ('shared.notifications.view', 'View own notifications')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r cross join public.permissions p
where r.key = 'organization_owner' and p.key like 'shared.%'
on conflict do nothing;

create or replace function public.can_access_shared(
  target_organization_id uuid,
  target_school_id uuid,
  permission_key text,
  feature_key text default 'foundation.shared_services'
) returns boolean
language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and public.has_school_membership(target_organization_id, target_school_id)
    and public.has_permission(target_organization_id, target_school_id, permission_key)
    and public.has_module_entitlement(target_organization_id, 'foundation')
    and public.is_feature_enabled(target_organization_id, feature_key)
$$;
revoke all on function public.can_access_shared(uuid, uuid, text, text) from public, anon;
grant execute on function public.can_access_shared(uuid, uuid, text, text) to authenticated;

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  school_id uuid references public.schools(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action ~ '^[a-z]+(?:\.[a-z_]+)+$'),
  entity_type text not null check (entity_type ~ '^[a-z][a-z0-9_]{1,79}$'),
  entity_id uuid,
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now(),
  check (school_id is null or organization_id is not null)
);
create index audit_events_scope_time_idx on public.audit_events
  (organization_id, school_id, occurred_at desc);
create index audit_events_entity_idx on public.audit_events
  (organization_id, entity_type, entity_id, occurred_at desc);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  title text not null check (char_length(trim(title)) between 2 and 160),
  original_filename text not null check (char_length(trim(original_filename)) between 1 and 240),
  object_path text not null unique check (object_path !~ '(^|/)\.\.?(/|$)'),
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png','text/csv')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  status public.document_status not null default 'pending_upload',
  entity_type text check (entity_type is null or entity_type ~ '^[a-z][a-z0-9_]{1,79}$'),
  entity_id uuid,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id),
  check ((entity_type is null) = (entity_id is null))
);
create index documents_scope_time_idx on public.documents
  (organization_id, school_id, status, created_at desc);
create index documents_entity_idx on public.documents
  (organization_id, entity_type, entity_id) where entity_id is not null;

create table public.action_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  title text not null check (char_length(trim(title)) between 3 and 160),
  description text check (description is null or char_length(trim(description)) <= 2000),
  status public.action_task_status not null default 'open',
  priority public.action_task_priority not null default 'normal',
  owner_user_id uuid references auth.users(id) on delete restrict,
  due_at timestamptz,
  source_type text check (source_type is null or source_type ~ '^[a-z][a-z0-9_]{1,79}$'),
  source_id uuid,
  completed_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  check ((source_type is null) = (source_id is null)),
  check ((status = 'completed' and completed_at is not null) or (status <> 'completed' and completed_at is null))
);
create index action_tasks_queue_idx on public.action_tasks
  (organization_id, school_id, status, priority, due_at);
create index action_tasks_owner_idx on public.action_tasks
  (owner_user_id, status, due_at) where owner_user_id is not null;

create table public.approval_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  key text not null check (key ~ '^[a-z]+(?:[._][a-z]+)*$'),
  name text not null check (char_length(trim(name)) between 3 and 120),
  description text check (description is null or char_length(trim(description)) <= 500),
  is_active boolean not null default true,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (school_id, key)
);

create table public.approval_policy_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  policy_id uuid not null,
  sequence integer not null check (sequence between 1 and 20),
  approver_role_id uuid not null,
  created_at timestamptz not null default now(),
  foreign key (policy_id, organization_id, school_id)
    references public.approval_policies(id, organization_id, school_id) on delete restrict,
  foreign key (approver_role_id, organization_id)
    references public.roles(id, organization_id) on delete restrict,
  unique (policy_id, sequence)
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  policy_id uuid not null,
  subject_type text not null check (subject_type ~ '^[a-z][a-z0-9_]{1,79}$'),
  subject_id uuid not null,
  title text not null check (char_length(trim(title)) between 3 and 160),
  status public.approval_request_status not null default 'pending',
  current_step integer not null default 1 check (current_step between 1 and 20),
  requested_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (policy_id, organization_id, school_id)
    references public.approval_policies(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  check ((status in ('approved','rejected','cancelled') and decided_at is not null) or
         (status in ('pending','returned') and decided_at is null))
);
create index approval_requests_inbox_idx on public.approval_requests
  (organization_id, school_id, status, current_step, created_at);
create unique index approval_requests_open_subject_idx on public.approval_requests
  (policy_id, subject_type, subject_id) where status = 'pending';

create table public.approval_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  request_id uuid not null,
  step integer not null check (step between 1 and 20),
  decision public.approval_decision_kind not null,
  comment text check (comment is null or char_length(trim(comment)) between 2 and 1000),
  decided_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  decided_at timestamptz not null default now(),
  foreign key (request_id, organization_id, school_id)
    references public.approval_requests(id, organization_id, school_id) on delete restrict,
  unique (request_id, step)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  school_id uuid references public.schools(id) on delete restrict,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  kind public.notification_kind not null default 'system',
  title text not null check (char_length(trim(title)) between 2 and 160),
  body text check (body is null or char_length(trim(body)) <= 1000),
  href text check (href is null or href ~ '^/'),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict
);
create index notifications_recipient_idx on public.notifications
  (recipient_user_id, read_at, created_at desc);

create or replace function private.capture_audit_event()
returns trigger language plpgsql security definer set search_path = '' as $$
declare row_data jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
declare old_data jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
declare org_id uuid; school uuid; entity uuid; changed text[];
begin
  org_id := nullif(row_data->>'organization_id','')::uuid;
  school := nullif(row_data->>'school_id','')::uuid;
  entity := nullif(row_data->>'id','')::uuid;
  if tg_op = 'UPDATE' then
    select coalesce(array_agg(k order by k), '{}') into changed
    from jsonb_object_keys(row_data) k where row_data->k is distinct from old_data->k;
  end if;
  insert into public.audit_events
    (organization_id, school_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (org_id, school, auth.uid(), lower(tg_op) || '.' || tg_table_name, tg_table_name, entity,
    jsonb_strip_nulls(jsonb_build_object('changedColumns', changed)));
  return coalesce(new, old);
end $$;
revoke all on function private.capture_audit_event() from public, anon, authenticated;

do $$ declare table_name text; begin
  foreach table_name in array array[
    'organizations','schools','organization_memberships','school_memberships','role_assignments','organization_plans',
    'organization_feature_flags','academic_sessions','academic_periods','academic_locks',
    'student_profiles','student_enrollments','class_memberships','staff_profiles','employments',
    'staff_assignments','documents','action_tasks','approval_policies','approval_requests'
  ] loop
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.capture_audit_event()', table_name, table_name);
  end loop;
end $$;

create or replace function public.decide_approval_request(
  target_request_id uuid,
  target_decision public.approval_decision_kind,
  target_comment text default null
) returns public.approval_request_status
language plpgsql security definer set search_path = '' as $$
declare req public.approval_requests; step_role uuid; final_step integer; next_status public.approval_request_status;
begin
  select * into req from public.approval_requests where id = target_request_id for update;
  if req.id is null or req.status <> 'pending' then raise exception 'Approval request is unavailable' using errcode = '42501'; end if;
  if not public.can_access_shared(req.organization_id, req.school_id, 'shared.approvals.decide', 'foundation.action_center') then
    raise exception 'Approval request is unavailable' using errcode = '42501';
  end if;
  select approver_role_id into step_role from public.approval_policy_steps
    where policy_id = req.policy_id and sequence = req.current_step;
  if step_role is null or not exists (
    select 1 from public.role_assignments ra where ra.organization_id = req.organization_id
      and ra.user_id = auth.uid() and ra.role_id = step_role and ra.status = 'active'
      and ra.effective_from <= now() and (ra.effective_to is null or ra.effective_to > now())
      and (ra.scope = 'organization' or (ra.scope = 'school' and ra.school_id = req.school_id)
        or (ra.scope = 'management_group' and exists (
          select 1 from public.management_group_schools mgs
          where mgs.management_group_id = ra.management_group_id and mgs.school_id = req.school_id
        )))
  ) then raise exception 'Approval request is unavailable' using errcode = '42501'; end if;
  insert into public.approval_decisions
    (organization_id, school_id, request_id, step, decision, comment)
  values (req.organization_id, req.school_id, req.id, req.current_step, target_decision, nullif(trim(target_comment),''));
  select max(sequence) into final_step from public.approval_policy_steps where policy_id = req.policy_id;
  if target_decision = 'approved' and req.current_step < final_step then
    update public.approval_requests set current_step = current_step + 1, updated_at = now() where id = req.id;
    next_status := 'pending';
  else
    next_status := case target_decision when 'approved' then 'approved' when 'rejected' then 'rejected' else 'returned' end;
    update public.approval_requests set status = next_status,
      decided_at = case when next_status in ('approved','rejected') then now() else null end,
      updated_at = now() where id = req.id;
  end if;
  insert into public.notifications (organization_id, school_id, recipient_user_id, kind, title, body, href)
  values (req.organization_id, req.school_id, req.requested_by, 'approval', 'Approval request updated',
    'A decision was recorded for ' || req.title, '/action-center');
  return next_status;
end $$;
revoke all on function public.decide_approval_request(uuid, public.approval_decision_kind, text) from public, anon;
grant execute on function public.decide_approval_request(uuid, public.approval_decision_kind, text) to authenticated;

do $$ declare table_name text; begin
  foreach table_name in array array['documents','action_tasks','approval_policies','approval_requests']
  loop execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name, table_name); end loop;
end $$;

alter table public.audit_events enable row level security;
alter table public.documents enable row level security;
alter table public.action_tasks enable row level security;
alter table public.approval_policies enable row level security;
alter table public.approval_policy_steps enable row level security;
alter table public.approval_requests enable row level security;
alter table public.approval_decisions enable row level security;
alter table public.notifications enable row level security;

create policy audit_events_select on public.audit_events for select to authenticated using (
  school_id is not null and public.can_access_shared(organization_id, school_id, 'shared.audit.view')
);
create policy documents_select on public.documents for select to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.documents.view', 'foundation.document_storage')
);
create policy documents_insert on public.documents for insert to authenticated with check (
  created_by = auth.uid() and public.can_access_shared(organization_id, school_id, 'shared.documents.manage', 'foundation.document_storage')
  and object_path like organization_id::text || '/' || school_id::text || '/' || id::text || '/%'
);
create policy documents_update on public.documents for update to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.documents.manage', 'foundation.document_storage')
) with check (
  public.can_access_shared(organization_id, school_id, 'shared.documents.manage', 'foundation.document_storage')
);
create policy action_tasks_select on public.action_tasks for select to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.tasks.view', 'foundation.action_center')
  and (owner_user_id is null or owner_user_id = auth.uid() or public.has_permission(organization_id, school_id, 'shared.tasks.manage'))
);
create policy action_tasks_insert on public.action_tasks for insert to authenticated with check (
  created_by = auth.uid() and public.can_access_shared(organization_id, school_id, 'shared.tasks.manage', 'foundation.action_center')
);
create policy action_tasks_update on public.action_tasks for update to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.tasks.manage', 'foundation.action_center')
) with check (public.can_access_shared(organization_id, school_id, 'shared.tasks.manage', 'foundation.action_center'));
create policy approval_policies_select on public.approval_policies for select to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.view', 'foundation.action_center')
);
create policy approval_policies_manage on public.approval_policies for all to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
) with check (public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center'));
create policy approval_steps_select on public.approval_policy_steps for select to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.view', 'foundation.action_center')
);
create policy approval_steps_manage on public.approval_policy_steps for all to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
) with check (public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center'));
create policy approval_requests_select on public.approval_requests for select to authenticated using (
  requested_by = auth.uid() or public.can_access_shared(organization_id, school_id, 'shared.approvals.view', 'foundation.action_center')
);
create policy approval_requests_insert on public.approval_requests for insert to authenticated with check (
  requested_by = auth.uid() and public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
);
create policy approval_decisions_select on public.approval_decisions for select to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.view', 'foundation.action_center')
);
create policy notifications_select on public.notifications for select to authenticated using (recipient_user_id = auth.uid());
create policy notifications_update on public.notifications for update to authenticated using (recipient_user_id = auth.uid())
  with check (recipient_user_id = auth.uid());

revoke all on public.audit_events, public.documents, public.action_tasks, public.approval_policies,
  public.approval_policy_steps, public.approval_requests, public.approval_decisions, public.notifications from anon, authenticated;
grant select on public.audit_events to authenticated;
grant select, insert, update (title, status, entity_type, entity_id) on public.documents to authenticated;
grant select, insert, update (title, description, status, priority, owner_user_id, due_at, completed_at) on public.action_tasks to authenticated;
grant select, insert, update on public.approval_policies to authenticated;
grant select, insert, update on public.approval_policy_steps to authenticated;
grant select, insert on public.approval_requests to authenticated;
grant select on public.approval_decisions to authenticated;
grant select, update (read_at) on public.notifications to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('schoolflow-documents', 'schoolflow-documents', false, 10485760,
  array['application/pdf','image/jpeg','image/png','text/csv'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy schoolflow_documents_select on storage.objects for select to authenticated using (
  bucket_id = 'schoolflow-documents' and exists (
    select 1 from public.documents d where d.object_path = name
      and public.can_access_shared(d.organization_id, d.school_id, 'shared.documents.view', 'foundation.document_storage')
  )
);
create policy schoolflow_documents_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'schoolflow-documents' and exists (
    select 1 from public.documents d where d.object_path = name and d.created_by = auth.uid()
      and d.status = 'pending_upload'
      and public.can_access_shared(d.organization_id, d.school_id, 'shared.documents.manage', 'foundation.document_storage')
  )
);
create policy schoolflow_documents_delete on storage.objects for delete to authenticated using (
  bucket_id = 'schoolflow-documents' and exists (
    select 1 from public.documents d where d.object_path = name
      and public.can_access_shared(d.organization_id, d.school_id, 'shared.documents.manage', 'foundation.document_storage')
  )
);

comment on table public.audit_events is 'Append-only protected operational/security history; API roles have no mutation grant.';
comment on table public.documents is 'Authoritative metadata for private shared documents; object bytes remain in Supabase Storage.';
