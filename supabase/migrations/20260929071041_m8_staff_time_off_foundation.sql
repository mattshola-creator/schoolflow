-- M8-B4 Staff Leave and Permission Foundation.
-- Staff/HR owns the request records; the shared approval engine owns decisions.
-- Approved outcomes are available for attendance integration in a later slice.

create type public.staff_time_request_kind as enum ('leave', 'permission');
create type public.staff_time_request_status as enum (
  'submitted', 'approved', 'rejected', 'returned', 'cancelled'
);

insert into public.product_features (module_id, key, name, description, default_enabled)
select id, 'staff.leave_permission', 'Staff leave and permission',
  'School-scoped staff leave and short permission requests with controlled approval', false
from public.product_modules where key = 'staff'
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('staff.time_off.view', 'View authorized staff leave and permission requests'),
  ('staff.time_off.request', 'Submit personal leave and permission requests'),
  ('staff.time_off.manage', 'Configure and manage school leave and permission requests')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select role.organization_id, role.id, permission.id
from public.roles role
cross join public.permissions permission
where role.key = 'organization_owner'
  and permission.key in (
    'staff.time_off.view', 'staff.time_off.request', 'staff.time_off.manage'
  )
on conflict do nothing;

create table public.staff_leave_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  name text not null check (char_length(trim(name)) between 2 and 120),
  code text not null check (code ~ '^[A-Z][A-Z0-9_]{1,19}$'),
  is_paid boolean not null default false,
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (school_id, code)
);

create table public.staff_time_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  staff_assignment_id uuid not null,
  kind public.staff_time_request_kind not null,
  leave_type_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null check (char_length(trim(reason)) between 3 and 1000),
  status public.staff_time_request_status not null default 'submitted',
  approval_request_id uuid unique references public.approval_requests(id) on delete restrict,
  requested_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check ((kind = 'leave' and leave_type_id is not null)
    or (kind = 'permission' and leave_type_id is null)),
  check ((status in ('approved', 'rejected', 'cancelled') and decided_at is not null)
    or (status in ('submitted', 'returned') and decided_at is null)),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (staff_assignment_id, organization_id, school_id)
    references public.staff_assignments(id, organization_id, school_id) on delete restrict,
  foreign key (leave_type_id, organization_id, school_id)
    references public.staff_leave_types(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create index staff_time_requests_assignment_idx on public.staff_time_requests
  (staff_assignment_id, starts_at desc);
create index staff_time_requests_school_status_idx on public.staff_time_requests
  (organization_id, school_id, status, starts_at);

create or replace function public.can_access_staff_time_request_assignment(
  target_organization_id uuid,
  target_school_id uuid,
  target_staff_assignment_id uuid,
  permission_key text
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select permission_key in (
      'staff.time_off.view', 'staff.time_off.request', 'staff.time_off.manage'
    )
    and public.can_access_staff(
      target_organization_id,
      target_school_id,
      permission_key,
      'staff.leave_permission'
    )
    and exists (
      select 1
      from public.staff_assignments assignment
      join public.employments employment
        on employment.id = assignment.employment_id
        and employment.organization_id = assignment.organization_id
      where assignment.id = target_staff_assignment_id
        and assignment.organization_id = target_organization_id
        and assignment.school_id = target_school_id
        and assignment.status = 'active'
        and employment.status in ('active', 'on_leave')
        and (
          employment.user_id = (select auth.uid())
          or public.has_permission(
            target_organization_id,
            target_school_id,
            'staff.time_off.manage'
          )
        )
    );
$$;

create or replace function public.submit_staff_time_request(
  target_organization_id uuid,
  target_school_id uuid,
  target_staff_assignment_id uuid,
  target_kind public.staff_time_request_kind,
  target_leave_type_id uuid,
  target_starts_at timestamptz,
  target_ends_at timestamptz,
  target_reason text,
  target_policy_id uuid
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  request_id uuid;
  shared_request_id uuid;
  policy_key text;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if target_kind is null or target_starts_at is null or target_ends_at is null
    or target_ends_at <= target_starts_at
    or target_reason is null
    or char_length(trim(target_reason)) not between 3 and 1000 then
    raise exception 'Staff time request is invalid' using errcode = '22023';
  end if;
  if not public.can_access_staff_time_request_assignment(
    target_organization_id,
    target_school_id,
    target_staff_assignment_id,
    'staff.time_off.request'
  ) then
    raise exception 'Staff time request is unavailable' using errcode = '42501';
  end if;
  if target_kind = 'leave' then
    if target_leave_type_id is null or not exists (
      select 1 from public.staff_leave_types leave_type
      where leave_type.id = target_leave_type_id
        and leave_type.organization_id = target_organization_id
        and leave_type.school_id = target_school_id
        and leave_type.status = 'active'
    ) then
      raise exception 'Staff time request is invalid' using errcode = '22023';
    end if;
  elsif target_leave_type_id is not null then
    raise exception 'Staff time request is invalid' using errcode = '22023';
  end if;

  select policy.key into policy_key
  from public.approval_policies policy
  where policy.id = target_policy_id
    and policy.organization_id = target_organization_id
    and policy.school_id = target_school_id
    and policy.is_active;
  if policy_key is distinct from (case target_kind
      when 'leave' then 'staff.leave'
      else 'staff.permission'
    end) then
    raise exception 'Approval policy is unavailable' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.approval_policy_steps step
    where step.policy_id = target_policy_id and step.sequence = 1
  ) then
    raise exception 'Approval policy is unavailable' using errcode = '42501';
  end if;

  insert into public.staff_time_requests (
    organization_id,
    school_id,
    staff_assignment_id,
    kind,
    leave_type_id,
    starts_at,
    ends_at,
    reason,
    requested_by
  ) values (
    target_organization_id,
    target_school_id,
    target_staff_assignment_id,
    target_kind,
    target_leave_type_id,
    target_starts_at,
    target_ends_at,
    trim(target_reason),
    caller_id
  ) returning id into request_id;

  insert into public.approval_requests (
    organization_id,
    school_id,
    policy_id,
    subject_type,
    subject_id,
    title,
    requested_by
  ) values (
    target_organization_id,
    target_school_id,
    target_policy_id,
    'staff_time_request',
    request_id,
    case target_kind
      when 'leave' then 'Staff leave request'
      else 'Staff permission request'
    end,
    caller_id
  ) returning id into shared_request_id;

  update public.staff_time_requests
  set approval_request_id = shared_request_id
  where id = request_id;
  return request_id;
end;
$$;

create or replace function private.sync_staff_time_request_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.subject_type = 'staff_time_request'
    and new.status is distinct from old.status then
    update public.staff_time_requests
    set status = case new.status
          when 'approved' then 'approved'::public.staff_time_request_status
          when 'rejected' then 'rejected'::public.staff_time_request_status
          when 'returned' then 'returned'::public.staff_time_request_status
          when 'cancelled' then 'cancelled'::public.staff_time_request_status
          else status
        end,
        decided_at = case
          when new.status in ('approved', 'rejected', 'cancelled') then new.decided_at
          else null
        end,
        updated_at = now()
    where id = new.subject_id
      and organization_id = new.organization_id
      and school_id = new.school_id
      and approval_request_id = new.id;
  end if;
  return new;
end;
$$;

create trigger sync_staff_time_request_approval
after update of status on public.approval_requests
for each row execute function private.sync_staff_time_request_approval();

create trigger set_staff_leave_types_updated_at
before update on public.staff_leave_types
for each row execute function private.set_updated_at();
create trigger set_staff_time_requests_updated_at
before update on public.staff_time_requests
for each row execute function private.set_updated_at();
create trigger audit_staff_leave_types
after insert or update or delete on public.staff_leave_types
for each row execute function private.capture_audit_event();
create trigger audit_staff_time_requests
after insert or update or delete on public.staff_time_requests
for each row execute function private.capture_audit_event();

alter table public.staff_leave_types enable row level security;
alter table public.staff_time_requests enable row level security;

create policy staff_leave_types_select on public.staff_leave_types
for select to authenticated
using (
  public.can_access_staff(organization_id, school_id, 'staff.time_off.view', 'staff.leave_permission')
  or public.can_access_staff(organization_id, school_id, 'staff.time_off.request', 'staff.leave_permission')
  or public.can_access_staff(organization_id, school_id, 'staff.time_off.manage', 'staff.leave_permission')
);
create policy staff_leave_types_insert on public.staff_leave_types
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and public.can_access_staff(
    organization_id, school_id, 'staff.time_off.manage', 'staff.leave_permission'
  )
);
create policy staff_leave_types_update on public.staff_leave_types
for update to authenticated
using (public.can_access_staff(
  organization_id, school_id, 'staff.time_off.manage', 'staff.leave_permission'
))
with check (
  updated_by = (select auth.uid())
  and public.can_access_staff(
    organization_id, school_id, 'staff.time_off.manage', 'staff.leave_permission'
  )
);
create policy staff_time_requests_select on public.staff_time_requests
for select to authenticated
using (
  requested_by = (select auth.uid())
  or public.can_access_staff_time_request_assignment(
    organization_id, school_id, staff_assignment_id, 'staff.time_off.view'
  )
);

revoke all on public.staff_leave_types, public.staff_time_requests
  from public, anon, authenticated;
grant select on public.staff_leave_types, public.staff_time_requests
  to authenticated;
grant insert, update (name, code, is_paid, status, updated_by)
  on public.staff_leave_types to authenticated;

revoke all on function public.can_access_staff_time_request_assignment(uuid, uuid, uuid, text)
  from public, anon;
revoke all on function public.submit_staff_time_request(
  uuid, uuid, uuid, public.staff_time_request_kind, uuid,
  timestamptz, timestamptz, text, uuid
) from public, anon;
revoke all on function private.sync_staff_time_request_approval()
  from public, anon, authenticated;
grant execute on function public.can_access_staff_time_request_assignment(uuid, uuid, uuid, text)
  to authenticated;
grant execute on function public.submit_staff_time_request(
  uuid, uuid, uuid, public.staff_time_request_kind, uuid,
  timestamptz, timestamptz, text, uuid
) to authenticated;

comment on table public.staff_leave_types is
  'School-configured leave categories owned by Staff/HR.';
comment on table public.staff_time_requests is
  'Staff leave and short-permission requests linked to the shared approval engine.';
comment on function public.submit_staff_time_request(
  uuid, uuid, uuid, public.staff_time_request_kind, uuid,
  timestamptz, timestamptz, text, uuid
) is 'Caller-bound atomic staff leave/permission submission and approval linkage.';
