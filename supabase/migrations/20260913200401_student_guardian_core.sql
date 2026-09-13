-- M4 Student & Guardian Core. Student identity belongs to the organization;
-- enrollment and placement history establish school visibility.
create type public.student_lifecycle_status as enum (
  'pending_enrollment', 'active', 'suspended', 'graduated',
  'transferred', 'withdrawn', 'expelled', 'archived'
);
create type public.enrollment_status as enum (
  'pending', 'active', 'completed', 'transferred', 'withdrawn',
  'expelled', 'cancelled'
);
create type public.class_membership_status as enum ('active', 'ended', 'cancelled');
create type public.import_batch_status as enum (
  'draft', 'validated', 'ready', 'committed', 'failed', 'cancelled'
);
create type public.import_row_status as enum ('valid', 'warning', 'invalid');

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  person_id uuid not null references public.people(id) on delete restrict,
  student_number text not null check (student_number ~ '^[A-Za-z0-9][A-Za-z0-9/_-]{1,39}$'),
  date_of_birth date,
  gender text check (gender is null or char_length(trim(gender)) between 1 and 40),
  status public.student_lifecycle_status not null default 'pending_enrollment',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, person_id),
  unique (organization_id, student_number),
  check (date_of_birth is null or date_of_birth <= current_date)
);

create table public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  student_id uuid not null,
  academic_session_id uuid not null,
  status public.enrollment_status not null default 'pending',
  enrolled_on date not null,
  ended_on date,
  exit_reason text check (exit_reason is null or char_length(trim(exit_reason)) between 3 and 500),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= enrolled_on),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (student_id, organization_id) references public.student_profiles(id, organization_id) on delete restrict,
  foreign key (academic_session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (id, student_id, organization_id, school_id),
  unique (student_id, school_id, academic_session_id)
);
create index student_enrollments_school_status_idx
  on public.student_enrollments (organization_id, school_id, status, academic_session_id);
create index student_enrollments_student_history_idx
  on public.student_enrollments (organization_id, student_id, enrolled_on desc);

create table public.class_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  student_id uuid not null,
  enrollment_id uuid not null,
  academic_session_id uuid not null,
  class_level_id uuid not null,
  class_arm_id uuid,
  started_on date not null,
  ended_on date,
  status public.class_membership_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on),
  check ((status = 'active' and ended_on is null) or status <> 'active'),
  foreign key (enrollment_id, student_id, organization_id, school_id)
    references public.student_enrollments(id, student_id, organization_id, school_id) on delete restrict,
  foreign key (academic_session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (class_arm_id, organization_id, school_id)
    references public.class_arms(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);
create unique index class_memberships_one_active_idx
  on public.class_memberships (student_id, school_id, academic_session_id)
  where status = 'active';
create index class_memberships_student_history_idx
  on public.class_memberships (organization_id, school_id, student_id, started_on desc);

create table public.guardian_relationships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  student_id uuid not null,
  guardian_person_id uuid not null references public.people(id) on delete restrict,
  relationship_type text not null check (char_length(trim(relationship_type)) between 2 and 60),
  is_primary_contact boolean not null default false,
  has_portal_access boolean not null default false,
  is_financially_responsible boolean not null default false,
  effective_from date not null default current_date,
  effective_to date,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from),
  foreign key (student_id, organization_id)
    references public.student_profiles(id, organization_id) on delete restrict,
  unique (id, organization_id)
);
create unique index guardian_relationships_active_kind_idx
  on public.guardian_relationships (student_id, guardian_person_id, lower(relationship_type))
  where effective_to is null;
create index guardian_relationships_student_idx
  on public.guardian_relationships (organization_id, student_id, effective_to);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  kind text not null check (kind in ('student_guardian')),
  source_name text not null check (char_length(trim(source_name)) between 1 and 160),
  status public.import_batch_status not null default 'draft',
  total_rows integer not null default 0 check (total_rows between 0 and 500),
  valid_rows integer not null default 0 check (valid_rows between 0 and total_rows),
  warning_rows integer not null default 0 check (warning_rows between 0 and total_rows),
  invalid_rows integer not null default 0 check (invalid_rows between 0 and total_rows),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create table public.import_rows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  batch_id uuid not null,
  row_number integer not null check (row_number between 1 and 500),
  raw_data jsonb not null,
  normalized_data jsonb not null,
  validation_messages jsonb not null default '[]'::jsonb check (jsonb_typeof(validation_messages) = 'array'),
  status public.import_row_status not null,
  created_at timestamptz not null default now(),
  foreign key (batch_id, organization_id, school_id)
    references public.import_batches(id, organization_id, school_id) on delete cascade,
  unique (batch_id, row_number)
);
create index import_batches_school_created_idx
  on public.import_batches (organization_id, school_id, created_at desc);
create index import_rows_batch_status_idx on public.import_rows (batch_id, status, row_number);

insert into public.product_features (module_id, key, name, description)
select id, 'students.student_records', 'Student records', 'Student identity, enrollment and guardian management'
from public.product_modules where key = 'students'
on conflict (key) do nothing;
insert into public.product_features (module_id, key, name, description)
select id, 'students.import_preview', 'Student import preview', 'Validate and review student and guardian imports'
from public.product_modules where key = 'students'
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('students.manage', 'Create and manage student records'),
  ('students.guardians.manage', 'Manage student guardian relationships'),
  ('students.enrollments.manage', 'Manage student enrollments and class history'),
  ('students.import', 'Validate and preview student and guardian imports')
on conflict (key) do nothing;
insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r cross join public.permissions p
where r.key = 'organization_owner' and p.key like 'students.%'
on conflict do nothing;

create or replace function public.can_access_students(
  target_organization_id uuid,
  target_school_id uuid,
  permission_key text,
  feature_key text default 'students.student_records'
) returns boolean
language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null
    and public.has_school_membership(target_organization_id, target_school_id)
    and public.has_permission(target_organization_id, target_school_id, permission_key)
    and public.has_module_entitlement(target_organization_id, 'students')
    and public.is_feature_enabled(target_organization_id, feature_key)
$$;
revoke all on function public.can_access_students(uuid, uuid, text, text) from public, anon;
grant execute on function public.can_access_students(uuid, uuid, text, text) to authenticated;

create or replace function public.can_view_student(target_student_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.student_enrollments e
    where e.student_id = target_student_id
      and public.can_access_students(e.organization_id, e.school_id, 'students.view')
  )
$$;
revoke all on function public.can_view_student(uuid) from public, anon;
grant execute on function public.can_view_student(uuid) to authenticated;

create or replace function private.validate_class_membership()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.class_arm_id is not null and not exists (
    select 1 from public.class_arms a where a.id = new.class_arm_id
      and a.class_level_id = new.class_level_id
      and a.organization_id = new.organization_id and a.school_id = new.school_id
  ) then raise exception 'Class arm does not belong to the selected level' using errcode = '23514'; end if;
  if not exists (
    select 1 from public.academic_sessions s where s.id = new.academic_session_id
      and new.started_on between s.start_date and s.end_date
      and (new.ended_on is null or new.ended_on between s.start_date and s.end_date)
  ) then raise exception 'Class membership dates must be inside the academic session' using errcode = '23514'; end if;
  return new;
end $$;
create trigger validate_class_membership before insert or update on public.class_memberships
for each row execute function private.validate_class_membership();
revoke all on function private.validate_class_membership() from public, anon, authenticated;

create or replace function public.create_student_record(
  target_organization_id uuid,
  target_school_id uuid,
  target_session_id uuid,
  target_level_id uuid,
  target_arm_id uuid,
  student_first_name text,
  student_last_name text,
  target_student_number text,
  target_date_of_birth date,
  target_gender text,
  enrollment_date date,
  guardian_first_name text default null,
  guardian_last_name text default null,
  guardian_relationship text default null,
  guardian_primary boolean default false,
  guardian_financial boolean default false
) returns uuid language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); student_person uuid; student_id uuid; enrollment_id uuid; guardian_person uuid;
begin
  if caller_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not public.can_access_students(target_organization_id, target_school_id, 'students.manage') then
    raise exception 'Student management is unavailable' using errcode = '42501';
  end if;
  if char_length(trim(student_first_name)) not between 1 and 100
    or char_length(trim(student_last_name)) not between 1 and 100
    or target_date_of_birth is null or target_date_of_birth > current_date
    or not exists (select 1 from public.academic_sessions s where s.id = target_session_id
      and s.organization_id = target_organization_id and s.school_id = target_school_id)
    or not exists (select 1 from public.class_levels l where l.id = target_level_id
      and l.organization_id = target_organization_id and l.school_id = target_school_id and l.status = 'active')
  then raise exception 'Student details or academic placement are invalid' using errcode = '22023'; end if;

  insert into public.people (first_name, last_name)
  values (trim(student_first_name), trim(student_last_name)) returning id into student_person;
  insert into public.student_profiles (
    organization_id, person_id, student_number, date_of_birth, gender,
    status, created_by, updated_by
  ) values (
    target_organization_id, student_person, upper(trim(target_student_number)),
    target_date_of_birth, nullif(trim(target_gender), ''), 'active', caller_id, caller_id
  ) returning id into student_id;
  insert into public.student_enrollments (
    organization_id, school_id, student_id, academic_session_id,
    status, enrolled_on, created_by, updated_by
  ) values (
    target_organization_id, target_school_id, student_id, target_session_id,
    'active', enrollment_date, caller_id, caller_id
  ) returning id into enrollment_id;
  insert into public.class_memberships (
    organization_id, school_id, student_id, enrollment_id, academic_session_id,
    class_level_id, class_arm_id, started_on, created_by, updated_by
  ) values (
    target_organization_id, target_school_id, student_id, enrollment_id,
    target_session_id, target_level_id, target_arm_id, enrollment_date, caller_id, caller_id
  );

  if nullif(trim(guardian_first_name), '') is not null or nullif(trim(guardian_last_name), '') is not null then
    if nullif(trim(guardian_first_name), '') is null or nullif(trim(guardian_last_name), '') is null
      or nullif(trim(guardian_relationship), '') is null then
      raise exception 'Guardian name and relationship must be complete' using errcode = '22023';
    end if;
    insert into public.people (first_name, last_name)
    values (trim(guardian_first_name), trim(guardian_last_name)) returning id into guardian_person;
    insert into public.guardian_relationships (
      organization_id, student_id, guardian_person_id, relationship_type,
      is_primary_contact, is_financially_responsible, created_by, updated_by
    ) values (
      target_organization_id, student_id, guardian_person, trim(guardian_relationship),
      guardian_primary, guardian_financial, caller_id, caller_id
    );
  end if;
  return student_id;
end $$;
revoke all on function public.create_student_record(uuid, uuid, uuid, uuid, uuid, text, text, text, date, text, date, text, text, text, boolean, boolean) from public, anon;
grant execute on function public.create_student_record(uuid, uuid, uuid, uuid, uuid, text, text, text, date, text, date, text, text, text, boolean, boolean) to authenticated;

do $$ declare table_name text; begin
  foreach table_name in array array['student_profiles','student_enrollments','class_memberships','guardian_relationships','import_batches','import_rows']
  loop execute format('alter table public.%I enable row level security', table_name); end loop;
end $$;

create policy student_profiles_select on public.student_profiles for select to authenticated
using (public.can_view_student(id));
create policy student_profiles_update on public.student_profiles for update to authenticated
using (exists (select 1 from public.student_enrollments e where e.student_id = id
  and public.can_access_students(e.organization_id, e.school_id, 'students.manage')))
with check (exists (select 1 from public.student_enrollments e where e.student_id = id
  and e.organization_id = organization_id
  and public.can_access_students(e.organization_id, e.school_id, 'students.manage')));

create policy student_enrollments_select on public.student_enrollments for select to authenticated
using (public.can_access_students(organization_id, school_id, 'students.view'));
create policy student_enrollments_insert on public.student_enrollments for insert to authenticated
with check (public.can_access_students(organization_id, school_id, 'students.enrollments.manage'));
create policy student_enrollments_update on public.student_enrollments for update to authenticated
using (public.can_access_students(organization_id, school_id, 'students.enrollments.manage'))
with check (public.can_access_students(organization_id, school_id, 'students.enrollments.manage'));

create policy class_memberships_select on public.class_memberships for select to authenticated
using (public.can_access_students(organization_id, school_id, 'students.view'));
create policy class_memberships_insert on public.class_memberships for insert to authenticated
with check (public.can_access_students(organization_id, school_id, 'students.enrollments.manage'));
create policy class_memberships_update on public.class_memberships for update to authenticated
using (public.can_access_students(organization_id, school_id, 'students.enrollments.manage'))
with check (public.can_access_students(organization_id, school_id, 'students.enrollments.manage'));

create policy guardian_relationships_select on public.guardian_relationships for select to authenticated
using (public.can_view_student(student_id));
create policy guardian_relationships_insert on public.guardian_relationships for insert to authenticated
with check (exists (select 1 from public.student_enrollments e where e.student_id = guardian_relationships.student_id
  and public.can_access_students(e.organization_id, e.school_id, 'students.guardians.manage')));
create policy guardian_relationships_update on public.guardian_relationships for update to authenticated
using (exists (select 1 from public.student_enrollments e where e.student_id = guardian_relationships.student_id
  and public.can_access_students(e.organization_id, e.school_id, 'students.guardians.manage')))
with check (exists (select 1 from public.student_enrollments e where e.student_id = guardian_relationships.student_id
  and e.organization_id = guardian_relationships.organization_id
  and public.can_access_students(e.organization_id, e.school_id, 'students.guardians.manage')));

create policy import_batches_select on public.import_batches for select to authenticated
using (public.can_access_students(organization_id, school_id, 'students.import', 'students.import_preview'));
create policy import_batches_manage on public.import_batches for all to authenticated
using (created_by = (select auth.uid()) and public.can_access_students(organization_id, school_id, 'students.import', 'students.import_preview'))
with check (created_by = (select auth.uid()) and public.can_access_students(organization_id, school_id, 'students.import', 'students.import_preview'));
create policy import_rows_select on public.import_rows for select to authenticated
using (exists (select 1 from public.import_batches b where b.id = batch_id and b.created_by = (select auth.uid())
  and public.can_access_students(b.organization_id, b.school_id, 'students.import', 'students.import_preview')));
create policy import_rows_manage on public.import_rows for all to authenticated
using (exists (select 1 from public.import_batches b where b.id = batch_id and b.created_by = (select auth.uid())
  and public.can_access_students(b.organization_id, b.school_id, 'students.import', 'students.import_preview')))
with check (exists (select 1 from public.import_batches b where b.id = batch_id and b.created_by = (select auth.uid())
  and b.organization_id = import_rows.organization_id and b.school_id = import_rows.school_id
  and public.can_access_students(b.organization_id, b.school_id, 'students.import', 'students.import_preview')));

create policy people_select_student_guardian on public.people for select to authenticated
using (
  exists (select 1 from public.student_profiles s where s.person_id = people.id and public.can_view_student(s.id))
  or exists (select 1 from public.guardian_relationships g where g.guardian_person_id = people.id and public.can_view_student(g.student_id))
);

grant select, update on public.student_profiles to authenticated;
grant select, insert, update on public.student_enrollments, public.class_memberships, public.guardian_relationships to authenticated;
grant select, insert, update, delete on public.import_batches, public.import_rows to authenticated;

comment on table public.student_profiles is 'Permanent organization-level student identity linked to a Person.';
comment on table public.student_enrollments is 'Historical student participation in a school and academic session.';
comment on table public.class_memberships is 'Dated placement history; class changes create rows instead of overwriting history.';
comment on table public.guardian_relationships is 'Historical many-to-many guardian relationship with access and responsibility attributes.';
