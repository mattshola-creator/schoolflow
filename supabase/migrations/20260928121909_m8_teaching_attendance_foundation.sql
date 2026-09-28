-- M8-A1 Teaching Scope and Attendance Policy Foundation.
-- This migration intentionally creates no attendance event or register tables.

create type public.teaching_assignment_type as enum ('class_teacher', 'subject_teacher');
create type public.teaching_assignment_status as enum ('planned', 'active', 'ended', 'cancelled');
create type public.attendance_status as enum ('present', 'late', 'absent', 'excused', 'left_early');

create or replace function private.has_unique_attendance_statuses(values_to_check public.attendance_status[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select cardinality(values_to_check) = (
    select count(distinct item) from unnest(values_to_check) item
  );
$$;

create or replace function private.has_unique_weekdays(values_to_check smallint[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select cardinality(values_to_check) = (
    select count(distinct item) from unnest(values_to_check) item
  );
$$;

insert into public.product_features (module_id, key, name, description, default_enabled)
select id, 'attendance.student_registers', 'Student attendance registers',
  'School-scoped morning and optional closing student attendance registers', false
from public.product_modules where key = 'attendance'
on conflict (key) do nothing;

insert into public.product_features (module_id, key, name, description, default_enabled)
select id, 'attendance.staff_clock', 'Staff attendance clock',
  'School-scoped staff clock-in, clock-out and attendance policy operations', false
from public.product_modules where key = 'attendance'
on conflict (key) do nothing;

insert into public.product_features (module_id, key, name, description, default_enabled)
select id, 'academics.teaching_management', 'Teaching management',
  'Historical teacher assignments, curriculum, timetable and lesson operations', false
from public.product_modules where key = 'academics'
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('attendance.configure', 'Configure school attendance policies'),
  ('attendance.student.record', 'Record student attendance for an assigned scope'),
  ('attendance.student.correct', 'Correct locked student attendance with an audit reason'),
  ('attendance.staff.record', 'Record staff attendance'),
  ('attendance.staff.correct', 'Correct locked staff attendance with an audit reason'),
  ('attendance.summary.view', 'View school attendance summaries'),
  ('academics.teaching_assignments.view', 'View teaching assignments'),
  ('academics.teaching_assignments.manage', 'Manage teaching assignments'),
  ('academics.timetable.view', 'View the school timetable'),
  ('academics.timetable.manage', 'Manage the school timetable'),
  ('academics.curriculum.view', 'View curriculum records'),
  ('academics.curriculum.manage', 'Manage curriculum records'),
  ('academics.lesson_plans.manage', 'Manage lesson plans'),
  ('academics.lesson_plans.approve', 'Approve lesson plans'),
  ('academics.lesson_delivery.record', 'Record lesson delivery'),
  ('academics.homework.manage', 'Manage homework records')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'organization_owner'
  and (p.key like 'attendance.%' or p.key like 'academics.%')
on conflict do nothing;

create table public.teaching_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  staff_assignment_id uuid not null,
  subject_id uuid,
  class_level_id uuid not null,
  class_arm_id uuid,
  assignment_type public.teaching_assignment_type not null,
  status public.teaching_assignment_status not null default 'planned',
  started_on date not null,
  ended_on date,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on),
  check ((assignment_type = 'subject_teacher' and subject_id is not null)
    or assignment_type = 'class_teacher'),
  check ((status = 'ended' and ended_on is not null) or status <> 'ended'),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (staff_assignment_id, organization_id, school_id)
    references public.staff_assignments(id, organization_id, school_id) on delete restrict,
  foreign key (subject_id, organization_id, school_id)
    references public.subjects(id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (class_arm_id, organization_id, school_id)
    references public.class_arms(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create index teaching_assignments_scope_idx on public.teaching_assignments
  (organization_id, school_id, session_id, class_level_id, class_arm_id, status);
create index teaching_assignments_staff_idx on public.teaching_assignments
  (staff_assignment_id, started_on, ended_on);

create table public.attendance_settings (
  school_id uuid primary key,
  organization_id uuid not null,
  morning_register_enabled boolean not null default true check (morning_register_enabled),
  closing_register_enabled boolean not null default false,
  lock_after_days smallint not null default 1 check (lock_after_days between 0 and 30),
  enabled_student_statuses public.attendance_status[] not null
    default array['present', 'late', 'absent', 'excused', 'left_early']::public.attendance_status[],
  lesson_plan_required boolean not null default false,
  lesson_plan_approval_required boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(enabled_student_statuses) > 0),
  check (private.has_unique_attendance_statuses(enabled_student_statuses)),
  check (not lesson_plan_approval_required or lesson_plan_required),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  unique (school_id, organization_id)
);

create table public.school_calendar_exceptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  calendar_date date not null,
  is_teaching_day boolean not null,
  label text not null check (char_length(trim(label)) between 2 and 120),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  unique (school_id, calendar_date),
  unique (id, organization_id, school_id)
);

create table public.staff_attendance_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  position_id uuid,
  name text not null check (char_length(trim(name)) between 2 and 120),
  working_days smallint[] not null default array[1, 2, 3, 4, 5]::smallint[],
  starts_at time not null,
  ends_at time not null,
  grace_minutes smallint not null default 0 check (grace_minutes between 0 and 240),
  effective_from date not null,
  effective_to date,
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (effective_to is null or effective_to >= effective_from),
  check (cardinality(working_days) between 1 and 7),
  check (working_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  check (private.has_unique_weekdays(working_days)),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (position_id, organization_id, school_id)
    references public.positions(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create unique index staff_attendance_policy_school_default_idx
  on public.staff_attendance_policies (school_id)
  where position_id is null and status = 'active';
create unique index staff_attendance_policy_position_idx
  on public.staff_attendance_policies (school_id, position_id)
  where position_id is not null and status = 'active';

create or replace function public.can_access_attendance(
  target_organization_id uuid,
  target_school_id uuid,
  permission_key text,
  feature_key text
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and feature_key in ('attendance.student_registers', 'attendance.staff_clock')
    and public.has_school_membership(target_organization_id, target_school_id)
    and public.has_permission(target_organization_id, target_school_id, permission_key)
    and public.has_module_entitlement(target_organization_id, 'attendance')
    and public.is_feature_enabled(target_organization_id, feature_key);
$$;

create or replace function public.can_access_teaching_management(
  target_organization_id uuid,
  target_school_id uuid,
  permission_key text
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and public.has_school_membership(target_organization_id, target_school_id)
    and public.has_permission(target_organization_id, target_school_id, permission_key)
    and public.has_module_entitlement(target_organization_id, 'academics')
    and public.is_feature_enabled(target_organization_id, 'academics.teaching_management');
$$;

create or replace function private.validate_teaching_assignment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_session public.academic_sessions%rowtype;
  target_staff_assignment public.staff_assignments%rowtype;
begin
  select * into target_session from public.academic_sessions where id = new.session_id;
  select * into target_staff_assignment from public.staff_assignments where id = new.staff_assignment_id;

  if new.started_on < target_session.start_date
    or coalesce(new.ended_on, target_session.end_date) > target_session.end_date then
    raise exception 'Teaching assignment dates must fall within the academic session'
      using errcode = '23514';
  end if;
  if new.started_on < target_staff_assignment.started_on
    or (target_staff_assignment.ended_on is not null
      and coalesce(new.ended_on, target_session.end_date) > target_staff_assignment.ended_on) then
    raise exception 'Teaching assignment dates must fall within the staff school assignment'
      using errcode = '23514';
  end if;
  if new.class_arm_id is not null and not exists (
    select 1 from public.class_arms arm
    where arm.id = new.class_arm_id
      and arm.class_level_id = new.class_level_id
      and arm.organization_id = new.organization_id
      and arm.school_id = new.school_id
  ) then
    raise exception 'Teaching assignment class arm is outside the class level'
      using errcode = '23514';
  end if;
  if exists (
    select 1 from public.teaching_assignments existing
    where existing.id <> new.id
      and existing.staff_assignment_id = new.staff_assignment_id
      and existing.session_id = new.session_id
      and existing.assignment_type = new.assignment_type
      and existing.subject_id is not distinct from new.subject_id
      and existing.class_level_id = new.class_level_id
      and existing.class_arm_id is not distinct from new.class_arm_id
      and existing.status in ('planned', 'active')
      and daterange(existing.started_on, coalesce(existing.ended_on, 'infinity'::date), '[]')
        && daterange(new.started_on, coalesce(new.ended_on, 'infinity'::date), '[]')
  ) then
    raise exception 'An overlapping teaching assignment already exists'
      using errcode = '23P01';
  end if;
  return new;
end;
$$;

create or replace function private.validate_calendar_exception()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.academic_sessions session
    where session.id = new.session_id
      and new.calendar_date between session.start_date and session.end_date
  ) then
    raise exception 'Calendar exception date must fall within the academic session'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger validate_teaching_assignment_before_write
before insert or update on public.teaching_assignments
for each row execute function private.validate_teaching_assignment();

create trigger validate_calendar_exception_before_write
before insert or update on public.school_calendar_exceptions
for each row execute function private.validate_calendar_exception();

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'teaching_assignments', 'attendance_settings', 'school_calendar_exceptions',
    'staff_attendance_policies'
  ] loop
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      table_name, table_name
    );
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

create policy teaching_assignments_select on public.teaching_assignments
for select to authenticated
using (public.can_access_teaching_management(
  organization_id, school_id, 'academics.teaching_assignments.view'));
create policy teaching_assignments_insert on public.teaching_assignments
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.teaching_assignments.manage'));
create policy teaching_assignments_update on public.teaching_assignments
for update to authenticated
using (public.can_access_teaching_management(
  organization_id, school_id, 'academics.teaching_assignments.manage'))
with check (
  updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.teaching_assignments.manage'));

create policy attendance_settings_select on public.attendance_settings
for select to authenticated
using (
  public.can_access_attendance(
    organization_id, school_id, 'attendance.view', 'attendance.student_registers')
  or public.can_access_attendance(
    organization_id, school_id, 'attendance.view', 'attendance.staff_clock')
);
create policy attendance_settings_insert on public.attendance_settings
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and public.can_access_attendance(
    organization_id, school_id, 'attendance.configure', 'attendance.student_registers'));
create policy attendance_settings_update on public.attendance_settings
for update to authenticated
using (public.can_access_attendance(
  organization_id, school_id, 'attendance.configure', 'attendance.student_registers'))
with check (
  updated_by = (select auth.uid())
  and public.can_access_attendance(
    organization_id, school_id, 'attendance.configure', 'attendance.student_registers'));

create policy school_calendar_exceptions_select on public.school_calendar_exceptions
for select to authenticated
using (public.can_access_attendance(
  organization_id, school_id, 'attendance.view', 'attendance.student_registers'));
create policy school_calendar_exceptions_insert on public.school_calendar_exceptions
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and public.can_access_attendance(
    organization_id, school_id, 'attendance.configure', 'attendance.student_registers'));
create policy school_calendar_exceptions_update on public.school_calendar_exceptions
for update to authenticated
using (public.can_access_attendance(
  organization_id, school_id, 'attendance.configure', 'attendance.student_registers'))
with check (
  updated_by = (select auth.uid())
  and public.can_access_attendance(
    organization_id, school_id, 'attendance.configure', 'attendance.student_registers'));

create policy staff_attendance_policies_select on public.staff_attendance_policies
for select to authenticated
using (public.can_access_attendance(
  organization_id, school_id, 'attendance.view', 'attendance.staff_clock'));
create policy staff_attendance_policies_insert on public.staff_attendance_policies
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and public.can_access_attendance(
    organization_id, school_id, 'attendance.configure', 'attendance.staff_clock'));
create policy staff_attendance_policies_update on public.staff_attendance_policies
for update to authenticated
using (public.can_access_attendance(
  organization_id, school_id, 'attendance.configure', 'attendance.staff_clock'))
with check (
  updated_by = (select auth.uid())
  and public.can_access_attendance(
    organization_id, school_id, 'attendance.configure', 'attendance.staff_clock'));

revoke all on public.teaching_assignments, public.attendance_settings,
  public.school_calendar_exceptions, public.staff_attendance_policies from anon, authenticated;
grant select, insert on public.teaching_assignments, public.attendance_settings,
  public.school_calendar_exceptions, public.staff_attendance_policies to authenticated;
grant update (
  session_id, staff_assignment_id, subject_id, class_level_id, class_arm_id,
  assignment_type, status, started_on, ended_on, updated_by, updated_at
) on public.teaching_assignments to authenticated;
grant update (
  closing_register_enabled, lock_after_days, enabled_student_statuses,
  lesson_plan_required, lesson_plan_approval_required, updated_by, updated_at
) on public.attendance_settings to authenticated;
grant update (
  session_id, calendar_date, is_teaching_day, label, updated_by, updated_at
) on public.school_calendar_exceptions to authenticated;
grant update (
  position_id, name, working_days, starts_at, ends_at, grace_minutes,
  effective_from, effective_to, status, updated_by, updated_at
) on public.staff_attendance_policies to authenticated;

revoke all on function public.can_access_attendance(uuid, uuid, text, text) from public, anon;
revoke all on function public.can_access_teaching_management(uuid, uuid, text) from public, anon;
grant execute on function public.can_access_attendance(uuid, uuid, text, text) to authenticated;
grant execute on function public.can_access_teaching_management(uuid, uuid, text) to authenticated;

revoke all on function private.validate_teaching_assignment() from public, anon, authenticated;
revoke all on function private.validate_calendar_exception() from public, anon, authenticated;
revoke all on function private.has_unique_attendance_statuses(public.attendance_status[])
  from public, anon, authenticated;
revoke all on function private.has_unique_weekdays(smallint[])
  from public, anon, authenticated;

comment on table public.teaching_assignments is
  'Effective-dated teacher scope by school, session, subject and class; prerequisite for contextual attendance access.';
comment on table public.attendance_settings is
  'School attendance and lesson-workflow policy; no attendance events are stored in M8-A1.';
comment on table public.school_calendar_exceptions is
  'School-day overrides that prevent weekends and holidays from producing false attendance exceptions.';
comment on table public.staff_attendance_policies is
  'School default or position-specific staff working hours and grace periods.';
