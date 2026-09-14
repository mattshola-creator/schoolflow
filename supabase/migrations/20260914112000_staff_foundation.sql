-- M5 Staff Foundation. A staff identity belongs to the organization;
-- employment and school assignment history remain effective-dated.
create type public.employment_status as enum (
  'onboarding', 'active', 'suspended', 'on_leave', 'ended'
);
create type public.employment_type as enum (
  'permanent', 'probationary', 'contract', 'temporary', 'part_time', 'volunteer'
);
create type public.staff_assignment_status as enum ('planned', 'active', 'ended', 'cancelled');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  name text not null check (char_length(trim(name)) between 2 and 120),
  code text check (code is null or code ~ '^[A-Z0-9][A-Z0-9_-]{0,15}$'),
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id)
);
create unique index departments_name_school_idx on public.departments (school_id, lower(name));
create unique index departments_code_school_idx on public.departments (school_id, code) where code is not null;
create index departments_school_status_idx on public.departments (organization_id, school_id, status, name);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  department_id uuid,
  name text not null check (char_length(trim(name)) between 2 and 120),
  code text check (code is null or code ~ '^[A-Z0-9][A-Z0-9_-]{0,15}$'),
  is_teaching boolean not null default false,
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (department_id, organization_id, school_id)
    references public.departments(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);
create unique index positions_name_school_idx on public.positions (school_id, lower(name));
create unique index positions_code_school_idx on public.positions (school_id, code) where code is not null;
create index positions_school_status_idx on public.positions (organization_id, school_id, status, name);

create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  person_id uuid not null references public.people(id) on delete restrict,
  staff_number text not null check (staff_number ~ '^[A-Za-z0-9][A-Za-z0-9/_-]{1,39}$'),
  work_email text check (work_email is null or work_email = lower(trim(work_email))),
  phone text check (phone is null or char_length(trim(phone)) between 7 and 30),
  emergency_contact_name text check (emergency_contact_name is null or char_length(trim(emergency_contact_name)) between 2 and 160),
  emergency_contact_phone text check (emergency_contact_phone is null or char_length(trim(emergency_contact_phone)) between 7 and 30),
  qualifications text[] not null default '{}',
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, person_id),
  unique (organization_id, staff_number)
);
create index staff_profiles_register_idx on public.staff_profiles (organization_id, status, staff_number);

create table public.employments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  staff_profile_id uuid not null,
  user_id uuid references auth.users(id) on delete restrict,
  employment_type public.employment_type not null,
  status public.employment_status not null default 'onboarding',
  started_on date not null,
  ended_on date,
  exit_reason text check (exit_reason is null or char_length(trim(exit_reason)) between 3 and 500),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on),
  check ((status = 'ended' and ended_on is not null) or status <> 'ended'),
  foreign key (staff_profile_id, organization_id)
    references public.staff_profiles(id, organization_id) on delete restrict,
  unique (id, organization_id),
  unique (id, staff_profile_id, organization_id)
);
create unique index employments_one_open_idx on public.employments (staff_profile_id)
  where status in ('onboarding', 'active', 'suspended', 'on_leave');
create index employments_org_status_idx on public.employments (organization_id, status, started_on desc);

create table public.staff_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  employment_id uuid not null,
  staff_profile_id uuid not null,
  department_id uuid,
  position_id uuid not null,
  role_assignment_id uuid references public.role_assignments(id) on delete restrict,
  reports_to_assignment_id uuid,
  is_primary boolean not null default false,
  status public.staff_assignment_status not null default 'planned',
  started_on date not null,
  ended_on date,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on),
  check ((status = 'ended' and ended_on is not null) or status <> 'ended'),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (employment_id, staff_profile_id, organization_id)
    references public.employments(id, staff_profile_id, organization_id) on delete restrict,
  foreign key (department_id, organization_id, school_id)
    references public.departments(id, organization_id, school_id) on delete restrict,
  foreign key (position_id, organization_id, school_id)
    references public.positions(id, organization_id, school_id) on delete restrict,
  foreign key (reports_to_assignment_id) references public.staff_assignments(id) on delete restrict,
  unique (id, organization_id, school_id)
);
create unique index staff_assignments_one_primary_idx on public.staff_assignments (employment_id)
  where is_primary and status in ('planned', 'active');
create index staff_assignments_school_status_idx
  on public.staff_assignments (organization_id, school_id, status, position_id);
create index staff_assignments_staff_history_idx
  on public.staff_assignments (organization_id, staff_profile_id, started_on desc);

insert into public.product_features (module_id, key, name, description)
select id, 'staff.staff_records', 'Staff records', 'Staff identity, employment and assignment records'
from public.product_modules where key = 'staff'
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('staff.departments.manage', 'Manage staff departments'),
  ('staff.positions.manage', 'Manage staff positions'),
  ('staff.assignments.manage', 'Manage staff school assignments'),
  ('staff.access.manage', 'Manage staff-linked application access')
on conflict (key) do nothing;
insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r cross join public.permissions p
where r.key = 'organization_owner' and p.key like 'staff.%'
on conflict do nothing;

create or replace function public.can_access_staff(
  target_organization_id uuid,
  target_school_id uuid,
  permission_key text,
  feature_key text default 'staff.staff_records'
) returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and public.has_school_membership(target_organization_id, target_school_id)
    and public.has_permission(target_organization_id, target_school_id, permission_key)
    and public.has_module_entitlement(target_organization_id, 'staff')
    and public.is_feature_enabled(target_organization_id, feature_key)
$$;
revoke all on function public.can_access_staff(uuid, uuid, text, text) from public, anon;
grant execute on function public.can_access_staff(uuid, uuid, text, text) to authenticated;

create or replace function public.can_view_staff(target_staff_profile_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff_assignments a
    where a.staff_profile_id = target_staff_profile_id
      and public.can_access_staff(a.organization_id, a.school_id, 'staff.view')
  )
$$;
revoke all on function public.can_view_staff(uuid) from public, anon;
grant execute on function public.can_view_staff(uuid) to authenticated;

create or replace function private.validate_staff_assignment()
returns trigger language plpgsql set search_path = '' as $$
declare linked_user uuid; linked_role_user uuid; linked_role_org uuid; linked_role_school uuid; linked_role_scope public.assignment_scope;
begin
  select e.user_id into linked_user from public.employments e
  where e.id = new.employment_id and e.organization_id = new.organization_id;
  if new.role_assignment_id is not null then
    select ra.user_id, ra.organization_id, ra.school_id, ra.scope
      into linked_role_user, linked_role_org, linked_role_school, linked_role_scope
    from public.role_assignments ra where ra.id = new.role_assignment_id;
    if linked_user is null or linked_role_user is distinct from linked_user
      or linked_role_org is distinct from new.organization_id
      or (linked_role_scope = 'school' and linked_role_school is distinct from new.school_id)
    then raise exception 'Staff-linked role assignment is outside the employment scope' using errcode = '23514'; end if;
  end if;
  if new.reports_to_assignment_id = new.id then
    raise exception 'A staff assignment cannot report to itself' using errcode = '23514';
  end if;
  if new.reports_to_assignment_id is not null and not exists (
    select 1 from public.staff_assignments manager
    where manager.id = new.reports_to_assignment_id
      and manager.organization_id = new.organization_id and manager.school_id = new.school_id
      and manager.status in ('planned', 'active')
  ) then raise exception 'Reporting assignment is outside the school scope' using errcode = '23514'; end if;
  return new;
end $$;
create trigger validate_staff_assignment before insert or update on public.staff_assignments
for each row execute function private.validate_staff_assignment();
revoke all on function private.validate_staff_assignment() from public, anon, authenticated;

do $$ declare table_name text; begin
  foreach table_name in array array['departments','positions','staff_profiles','employments','staff_assignments']
  loop execute format(
    'create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()',
    table_name, table_name
  ); end loop;
end $$;

create or replace function public.create_staff_record(
  target_organization_id uuid,
  target_school_id uuid,
  target_department_id uuid,
  target_position_id uuid,
  staff_first_name text,
  staff_last_name text,
  target_staff_number text,
  target_employment_type public.employment_type,
  target_started_on date,
  target_work_email text default null,
  target_phone text default null,
  linked_user_id uuid default null,
  linked_role_id uuid default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); person_id uuid; profile_id uuid; employment_id uuid; role_assignment_id uuid;
begin
  if caller_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not public.can_access_staff(target_organization_id, target_school_id, 'staff.manage') then
    raise exception 'Staff management is unavailable' using errcode = '42501';
  end if;
  if char_length(trim(staff_first_name)) not between 1 and 100
    or char_length(trim(staff_last_name)) not between 1 and 100
    or target_started_on is null
    or not exists (select 1 from public.positions p where p.id = target_position_id
      and p.organization_id = target_organization_id and p.school_id = target_school_id and p.status = 'active')
    or (target_department_id is not null and not exists (
      select 1 from public.departments d where d.id = target_department_id
        and d.organization_id = target_organization_id and d.school_id = target_school_id and d.status = 'active'))
  then raise exception 'Staff details or assignment are invalid' using errcode = '22023'; end if;
  if linked_user_id is not null then
    if linked_role_id is null
      or not exists (select 1 from public.organization_memberships m where m.organization_id = target_organization_id
        and m.user_id = linked_user_id and m.status = 'active')
      or not exists (select 1 from public.roles r where r.id = linked_role_id and r.organization_id = target_organization_id)
    then raise exception 'Linked staff access is invalid' using errcode = '22023'; end if;
    if not public.can_access_staff(target_organization_id, target_school_id, 'staff.access.manage') then
      raise exception 'Staff access management is unavailable' using errcode = '42501'; end if;
    insert into public.role_assignments (
      organization_id, user_id, role_id, scope, school_id, status, effective_from
    ) values (
      target_organization_id, linked_user_id, linked_role_id, 'school', target_school_id,
      'active', target_started_on::timestamptz
    ) on conflict (user_id, role_id, scope, management_group_id, school_id)
      do update set status = 'active', effective_to = null, updated_at = now()
    returning id into role_assignment_id;
  end if;
  insert into public.people(first_name, last_name)
  values (trim(staff_first_name), trim(staff_last_name)) returning id into person_id;
  insert into public.staff_profiles(
    organization_id, person_id, staff_number, work_email, phone, created_by, updated_by
  ) values (
    target_organization_id, person_id, upper(trim(target_staff_number)),
    nullif(lower(trim(target_work_email)), ''), nullif(trim(target_phone), ''), caller_id, caller_id
  ) returning id into profile_id;
  insert into public.employments(
    organization_id, staff_profile_id, user_id, employment_type, status,
    started_on, created_by, updated_by
  ) values (
    target_organization_id, profile_id, linked_user_id, target_employment_type, 'active',
    target_started_on, caller_id, caller_id
  ) returning id into employment_id;
  insert into public.staff_assignments(
    organization_id, school_id, employment_id, staff_profile_id, department_id,
    position_id, role_assignment_id, is_primary, status, started_on, created_by, updated_by
  ) values (
    target_organization_id, target_school_id, employment_id, profile_id, target_department_id,
    target_position_id, role_assignment_id, true, 'active', target_started_on, caller_id, caller_id
  );
  return profile_id;
end $$;
revoke all on function public.create_staff_record(uuid, uuid, uuid, uuid, text, text, text, public.employment_type, date, text, text, uuid, uuid) from public, anon;
grant execute on function public.create_staff_record(uuid, uuid, uuid, uuid, text, text, text, public.employment_type, date, text, text, uuid, uuid) to authenticated;

create or replace function public.end_staff_employment(
  target_employment_id uuid,
  target_ended_on date,
  target_reason text
) returns void language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); employment_row public.employments%rowtype; assignment_role_ids uuid[];
begin
  if caller_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select * into employment_row from public.employments where id = target_employment_id for update;
  if employment_row.id is null or employment_row.status = 'ended' then
    raise exception 'Employment is unavailable' using errcode = '22023';
  end if;
  if target_ended_on < employment_row.started_on or char_length(trim(target_reason)) not between 3 and 500 then
    raise exception 'Employment exit details are invalid' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.staff_assignments a where a.employment_id = employment_row.id
      and public.can_access_staff(a.organization_id, a.school_id, 'staff.access.manage')
  ) then raise exception 'Staff access management is unavailable' using errcode = '42501'; end if;
  select array_agg(role_assignment_id) into assignment_role_ids
  from public.staff_assignments where employment_id = employment_row.id and role_assignment_id is not null;
  update public.staff_assignments set status = 'ended', ended_on = target_ended_on,
    updated_by = caller_id, updated_at = now()
  where employment_id = employment_row.id and status in ('planned', 'active');
  update public.employments set status = 'ended', ended_on = target_ended_on,
    exit_reason = trim(target_reason), updated_by = caller_id, updated_at = now()
  where id = employment_row.id;
  if assignment_role_ids is not null then
    update public.role_assignments set status = 'ended',
      effective_to = (target_ended_on + 1)::timestamptz, updated_at = now()
    where id = any(assignment_role_ids) and organization_id = employment_row.organization_id;
  end if;
end $$;
revoke all on function public.end_staff_employment(uuid, date, text) from public, anon;
grant execute on function public.end_staff_employment(uuid, date, text) to authenticated;

do $$ declare table_name text; begin
  foreach table_name in array array['departments','positions','staff_profiles','employments','staff_assignments']
  loop execute format('alter table public.%I enable row level security', table_name); end loop;
end $$;

create policy departments_select on public.departments for select to authenticated
using (public.can_access_staff(organization_id, school_id, 'staff.view'));
create policy departments_insert on public.departments for insert to authenticated
with check (created_by = (select auth.uid()) and public.can_access_staff(organization_id, school_id, 'staff.departments.manage'));
create policy departments_update on public.departments for update to authenticated
using (public.can_access_staff(organization_id, school_id, 'staff.departments.manage'))
with check (public.can_access_staff(organization_id, school_id, 'staff.departments.manage'));

create policy positions_select on public.positions for select to authenticated
using (public.can_access_staff(organization_id, school_id, 'staff.view'));
create policy positions_insert on public.positions for insert to authenticated
with check (created_by = (select auth.uid()) and public.can_access_staff(organization_id, school_id, 'staff.positions.manage'));
create policy positions_update on public.positions for update to authenticated
using (public.can_access_staff(organization_id, school_id, 'staff.positions.manage'))
with check (public.can_access_staff(organization_id, school_id, 'staff.positions.manage'));

create policy staff_profiles_select on public.staff_profiles for select to authenticated
using (public.can_view_staff(id));
create policy staff_profiles_update on public.staff_profiles for update to authenticated
using (exists (select 1 from public.staff_assignments a where a.staff_profile_id = id
  and public.can_access_staff(a.organization_id, a.school_id, 'staff.manage')))
with check (exists (select 1 from public.staff_assignments a where a.staff_profile_id = id
  and a.organization_id = organization_id and public.can_access_staff(a.organization_id, a.school_id, 'staff.manage')));

create policy employments_select on public.employments for select to authenticated
using (public.can_view_staff(staff_profile_id));
create policy employments_update on public.employments for update to authenticated
using (exists (select 1 from public.staff_assignments a where a.employment_id = id
  and public.can_access_staff(a.organization_id, a.school_id, 'staff.manage')))
with check (exists (select 1 from public.staff_assignments a where a.employment_id = id
  and a.organization_id = organization_id and public.can_access_staff(a.organization_id, a.school_id, 'staff.manage')));

create policy staff_assignments_select on public.staff_assignments for select to authenticated
using (public.can_access_staff(organization_id, school_id, 'staff.view'));
create policy staff_assignments_insert on public.staff_assignments for insert to authenticated
with check (created_by = (select auth.uid()) and public.can_access_staff(organization_id, school_id, 'staff.assignments.manage'));
create policy staff_assignments_update on public.staff_assignments for update to authenticated
using (public.can_access_staff(organization_id, school_id, 'staff.assignments.manage'))
with check (public.can_access_staff(organization_id, school_id, 'staff.assignments.manage'));

grant select, insert, update on public.departments, public.positions to authenticated;
grant select, update on public.staff_profiles, public.employments to authenticated;
grant select, insert, update on public.staff_assignments to authenticated;

revoke update on public.departments, public.positions, public.staff_profiles, public.employments, public.staff_assignments from authenticated;
grant update (name, code, status, updated_by, updated_at) on public.departments to authenticated;
grant update (department_id, name, code, is_teaching, status, updated_by, updated_at)
  on public.positions to authenticated;
grant update (work_email, phone, emergency_contact_name, emergency_contact_phone, qualifications, status, updated_by, updated_at)
  on public.staff_profiles to authenticated;
grant update (status, ended_on, exit_reason, updated_by, updated_at) on public.employments to authenticated;
grant update (department_id, position_id, reports_to_assignment_id, is_primary, status, ended_on, updated_by, updated_at)
  on public.staff_assignments to authenticated;

comment on table public.staff_profiles is 'Organization-level staff identity linked to a Person.';
comment on table public.employments is 'Historical employment relationship, optionally linked to a user account.';
comment on table public.staff_assignments is 'Dated school assignment and reporting-line history.';
