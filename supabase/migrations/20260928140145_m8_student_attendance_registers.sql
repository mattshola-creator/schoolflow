-- M8-A2 Student Attendance Register Data Foundation.
-- Features remain disabled by default; attendance writes are RPC-only.

create type public.student_attendance_register_type as enum ('morning', 'closing');

alter table public.attendance_settings
  add column student_attendance_days smallint[] not null
    default array[1, 2, 3, 4, 5]::smallint[],
  add constraint attendance_settings_student_days_count
    check (cardinality(student_attendance_days) between 1 and 7),
  add constraint attendance_settings_student_days_range
    check (student_attendance_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  add constraint attendance_settings_student_days_unique
    check (private.has_unique_weekdays(student_attendance_days));

insert into public.permissions (key, description) values
  ('attendance.student.record_all', 'Record student attendance across the school'),
  ('attendance.student.correct_all', 'Correct locked student attendance across the school')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'organization_owner'
  and p.key in ('attendance.student.record_all', 'attendance.student.correct_all')
on conflict do nothing;

create table public.student_attendance_registers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  class_level_id uuid not null,
  class_arm_id uuid,
  attendance_date date not null,
  register_type public.student_attendance_register_type not null,
  idempotency_key uuid not null,
  request_fingerprint text not null check (request_fingerprint ~ '^[a-f0-9]{32}$'),
  submitted_by uuid not null references auth.users(id) on delete restrict,
  submitted_at timestamptz not null default now(),
  locks_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (class_arm_id, organization_id, school_id)
    references public.class_arms(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (organization_id, school_id, idempotency_key),
  unique nulls not distinct (
    organization_id, school_id, session_id, class_level_id, class_arm_id,
    attendance_date, register_type
  ),
  check (locks_at > submitted_at)
);

create table public.student_attendance_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  register_id uuid not null,
  student_id uuid not null,
  enrollment_id uuid not null,
  class_membership_id uuid not null,
  status public.attendance_status not null,
  note text check (note is null or char_length(trim(note)) between 1 and 500),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (register_id, organization_id, school_id)
    references public.student_attendance_registers(id, organization_id, school_id) on delete restrict,
  foreign key (student_id, organization_id)
    references public.student_profiles(id, organization_id) on delete restrict,
  foreign key (enrollment_id, student_id, organization_id, school_id)
    references public.student_enrollments(id, student_id, organization_id, school_id) on delete restrict,
  foreign key (class_membership_id, organization_id, school_id)
    references public.class_memberships(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (register_id, student_id)
);

create table public.student_attendance_corrections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  register_id uuid not null,
  entry_id uuid not null,
  student_id uuid not null,
  previous_status public.attendance_status not null,
  new_status public.attendance_status not null,
  reason text not null check (char_length(trim(reason)) between 3 and 500),
  corrected_by uuid not null references auth.users(id) on delete restrict,
  corrected_at timestamptz not null default now(),
  foreign key (register_id, organization_id, school_id)
    references public.student_attendance_registers(id, organization_id, school_id) on delete restrict,
  foreign key (entry_id, organization_id, school_id)
    references public.student_attendance_entries(id, organization_id, school_id) on delete restrict,
  foreign key (student_id, organization_id)
    references public.student_profiles(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id),
  check (previous_status <> new_status)
);

create index student_attendance_registers_scope_idx
  on public.student_attendance_registers
    (organization_id, school_id, attendance_date desc, class_level_id, class_arm_id);
create index student_attendance_entries_register_idx
  on public.student_attendance_entries (register_id, status, student_id);
create index student_attendance_entries_student_idx
  on public.student_attendance_entries (organization_id, student_id, recorded_at desc);
create index student_attendance_corrections_entry_idx
  on public.student_attendance_corrections (entry_id, corrected_at desc);

create or replace function public.can_access_student_attendance_scope(
  target_organization_id uuid,
  target_school_id uuid,
  permission_key text,
  target_session_id uuid,
  target_class_level_id uuid,
  target_class_arm_id uuid,
  target_attendance_date date
) returns boolean
language sql stable security definer set search_path = ''
as $$
  select permission_key in (
      'attendance.view', 'attendance.student.record', 'attendance.student.correct'
    )
    and public.can_access_attendance(
      target_organization_id, target_school_id, permission_key,
      'attendance.student_registers'
    )
    and (
      (permission_key = 'attendance.view' and public.has_permission(
        target_organization_id, target_school_id, 'attendance.summary.view'))
      or (permission_key = 'attendance.student.record' and public.has_permission(
        target_organization_id, target_school_id, 'attendance.student.record_all'))
      or (permission_key = 'attendance.student.correct' and public.has_permission(
        target_organization_id, target_school_id, 'attendance.student.correct_all'))
      or exists (
        select 1
        from public.employments employment
        join public.staff_assignments staff_assignment
          on staff_assignment.employment_id = employment.id
          and staff_assignment.organization_id = employment.organization_id
        join public.teaching_assignments teaching_assignment
          on teaching_assignment.staff_assignment_id = staff_assignment.id
          and teaching_assignment.organization_id = staff_assignment.organization_id
          and teaching_assignment.school_id = staff_assignment.school_id
        where employment.user_id = (select auth.uid())
          and employment.organization_id = target_organization_id
          and employment.status = 'active'
          and employment.started_on <= target_attendance_date
          and (employment.ended_on is null or employment.ended_on >= target_attendance_date)
          and staff_assignment.school_id = target_school_id
          and staff_assignment.status = 'active'
          and staff_assignment.started_on <= target_attendance_date
          and (staff_assignment.ended_on is null or staff_assignment.ended_on >= target_attendance_date)
          and teaching_assignment.session_id = target_session_id
          and teaching_assignment.class_level_id = target_class_level_id
          and (teaching_assignment.class_arm_id is null
            or teaching_assignment.class_arm_id = target_class_arm_id)
          and teaching_assignment.status = 'active'
          and teaching_assignment.started_on <= target_attendance_date
          and (teaching_assignment.ended_on is null
            or teaching_assignment.ended_on >= target_attendance_date)
      )
    );
$$;

create or replace function public.submit_student_attendance_register(
  target_organization_id uuid,
  target_school_id uuid,
  target_session_id uuid,
  target_class_level_id uuid,
  target_class_arm_id uuid,
  target_attendance_date date,
  target_register_type public.student_attendance_register_type,
  target_idempotency_key uuid,
  target_entries jsonb
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  settings public.attendance_settings%rowtype;
  existing_register public.student_attendance_registers%rowtype;
  register_id uuid;
  fingerprint text;
  school_timezone text;
  local_today date;
  is_teaching_day boolean;
  roster_count integer;
  payload_count integer;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if target_idempotency_key is null or jsonb_typeof(target_entries) <> 'array'
    or jsonb_array_length(target_entries) = 0 then
    raise exception 'Attendance register input is invalid' using errcode = '22023';
  end if;
  if not public.can_access_student_attendance_scope(
    target_organization_id, target_school_id, 'attendance.student.record',
    target_session_id, target_class_level_id, target_class_arm_id,
    target_attendance_date
  ) then
    raise exception 'Attendance register is unavailable' using errcode = '42501';
  end if;

  select location.timezone into school_timezone
  from public.schools school
  join public.locations location on location.id = school.location_id
  where school.id = target_school_id
    and school.organization_id = target_organization_id;
  select * into settings from public.attendance_settings
  where organization_id = target_organization_id and school_id = target_school_id;
  if settings.school_id is null or school_timezone is null then
    raise exception 'Attendance configuration is unavailable' using errcode = '42501';
  end if;

  local_today := (now() at time zone school_timezone)::date;
  if target_attendance_date is null or target_attendance_date > local_today
    or not exists (
      select 1 from public.academic_sessions session
      where session.id = target_session_id
        and session.organization_id = target_organization_id
        and session.school_id = target_school_id
        and target_attendance_date between session.start_date and session.end_date
    )
    or not exists (
      select 1 from public.class_levels level
      where level.id = target_class_level_id
        and level.organization_id = target_organization_id
        and level.school_id = target_school_id
        and level.status = 'active'
    )
    or (target_class_arm_id is not null and not exists (
      select 1 from public.class_arms arm
      where arm.id = target_class_arm_id
        and arm.organization_id = target_organization_id
        and arm.school_id = target_school_id
        and arm.class_level_id = target_class_level_id
        and arm.status = 'active'
    )) then
    raise exception 'Attendance scope is invalid' using errcode = '22023';
  end if;
  if target_register_type = 'morning' and not settings.morning_register_enabled
    or target_register_type = 'closing' and not settings.closing_register_enabled then
    raise exception 'Attendance register type is disabled' using errcode = '42501';
  end if;
  if now() >= ((target_attendance_date + settings.lock_after_days + 1)::timestamp
    at time zone school_timezone) then
    raise exception 'Attendance register is locked' using errcode = '42501';
  end if;

  select coalesce(exception.is_teaching_day,
    extract(dow from target_attendance_date)::smallint = any(settings.student_attendance_days))
  into is_teaching_day
  from (select 1) seed
  left join public.school_calendar_exceptions exception
    on exception.organization_id = target_organization_id
    and exception.school_id = target_school_id
    and exception.session_id = target_session_id
    and exception.calendar_date = target_attendance_date;
  if not is_teaching_day then
    raise exception 'Attendance date is not a teaching day' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements(target_entries) item
    where jsonb_typeof(item) <> 'object'
      or not (item ? 'studentId' and item ? 'status')
      or (item - array['studentId', 'status', 'note']) <> '{}'::jsonb
      or not ((item->>'studentId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
      or not ((item->>'status') = any(settings.enabled_student_statuses::text[]))
      or (item ? 'note' and item->>'note' is not null
        and char_length(trim(item->>'note')) not between 1 and 500)
  ) then
    raise exception 'Attendance entries are invalid' using errcode = '22023';
  end if;
  select count(*), count(distinct item->>'studentId')
  into payload_count, roster_count
  from jsonb_array_elements(target_entries) item;
  if payload_count <> roster_count then
    raise exception 'Attendance entries contain duplicates' using errcode = '22023';
  end if;

  select count(*) into roster_count
  from public.class_memberships membership
  join public.student_enrollments enrollment on enrollment.id = membership.enrollment_id
  where membership.organization_id = target_organization_id
    and membership.school_id = target_school_id
    and membership.academic_session_id = target_session_id
    and membership.class_level_id = target_class_level_id
    and membership.class_arm_id is not distinct from target_class_arm_id
    and membership.status <> 'cancelled'
    and membership.started_on <= target_attendance_date
    and (membership.ended_on is null or membership.ended_on >= target_attendance_date)
    and enrollment.status <> 'cancelled'
    and enrollment.enrolled_on <= target_attendance_date
    and (enrollment.ended_on is null or enrollment.ended_on >= target_attendance_date);
  if roster_count = 0 or payload_count <> roster_count or exists (
    select 1 from jsonb_array_elements(target_entries) item
    where not exists (
      select 1 from public.class_memberships membership
      join public.student_enrollments enrollment on enrollment.id = membership.enrollment_id
      where membership.organization_id = target_organization_id
        and membership.school_id = target_school_id
        and membership.academic_session_id = target_session_id
        and membership.class_level_id = target_class_level_id
        and membership.class_arm_id is not distinct from target_class_arm_id
        and membership.student_id = (item->>'studentId')::uuid
        and membership.status <> 'cancelled'
        and membership.started_on <= target_attendance_date
        and (membership.ended_on is null or membership.ended_on >= target_attendance_date)
        and enrollment.status <> 'cancelled'
        and enrollment.enrolled_on <= target_attendance_date
        and (enrollment.ended_on is null or enrollment.ended_on >= target_attendance_date)
    )
  ) then
    raise exception 'Attendance entries do not match the class roster' using errcode = '22023';
  end if;

  fingerprint := md5(jsonb_build_object(
    'organizationId', target_organization_id,
    'schoolId', target_school_id,
    'sessionId', target_session_id,
    'classLevelId', target_class_level_id,
    'classArmId', target_class_arm_id,
    'attendanceDate', target_attendance_date,
    'registerType', target_register_type,
    'entries', target_entries
  )::text);
  select * into existing_register from public.student_attendance_registers
  where organization_id = target_organization_id
    and school_id = target_school_id and idempotency_key = target_idempotency_key;
  if existing_register.id is not null then
    if existing_register.request_fingerprint <> fingerprint then
      raise exception 'Idempotency key was already used for another request' using errcode = '22023';
    end if;
    return existing_register.id;
  end if;

  insert into public.student_attendance_registers (
    organization_id, school_id, session_id, class_level_id, class_arm_id,
    attendance_date, register_type, idempotency_key, request_fingerprint,
    submitted_by, locks_at
  ) values (
    target_organization_id, target_school_id, target_session_id,
    target_class_level_id, target_class_arm_id, target_attendance_date,
    target_register_type, target_idempotency_key, fingerprint, caller_id,
    ((target_attendance_date + settings.lock_after_days + 1)::timestamp
      at time zone school_timezone)
  ) returning id into register_id;

  insert into public.student_attendance_entries (
    organization_id, school_id, register_id, student_id, enrollment_id,
    class_membership_id, status, note, recorded_by
  )
  select target_organization_id, target_school_id, register_id,
    membership.student_id, membership.enrollment_id, membership.id,
    (item->>'status')::public.attendance_status,
    nullif(trim(item->>'note'), ''), caller_id
  from jsonb_array_elements(target_entries) item
  join public.class_memberships membership
    on membership.organization_id = target_organization_id
    and membership.school_id = target_school_id
    and membership.academic_session_id = target_session_id
    and membership.class_level_id = target_class_level_id
    and membership.class_arm_id is not distinct from target_class_arm_id
    and membership.student_id = (item->>'studentId')::uuid
    and membership.status <> 'cancelled'
    and membership.started_on <= target_attendance_date
    and (membership.ended_on is null or membership.ended_on >= target_attendance_date);
  return register_id;
exception
  when unique_violation then
    select * into existing_register from public.student_attendance_registers
    where organization_id = target_organization_id
      and school_id = target_school_id and idempotency_key = target_idempotency_key;
    if existing_register.id is not null
      and existing_register.request_fingerprint = fingerprint then
      return existing_register.id;
    end if;
    raise;
end;
$$;

create or replace function public.correct_student_attendance_entry(
  target_entry_id uuid,
  target_new_status public.attendance_status,
  target_reason text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  entry_record public.student_attendance_entries%rowtype;
  register_record public.student_attendance_registers%rowtype;
  settings public.attendance_settings%rowtype;
  required_permission text;
  correction_id uuid;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  select * into entry_record from public.student_attendance_entries
    where id = target_entry_id for update;
  if entry_record.id is null then
    raise exception 'Attendance entry is unavailable' using errcode = '42501';
  end if;
  select * into register_record from public.student_attendance_registers
    where id = entry_record.register_id;
  select * into settings from public.attendance_settings
    where organization_id = entry_record.organization_id
      and school_id = entry_record.school_id;
  required_permission := case when now() >= register_record.locks_at
    then 'attendance.student.correct' else 'attendance.student.record' end;
  if not public.can_access_student_attendance_scope(
    entry_record.organization_id, entry_record.school_id, required_permission,
    register_record.session_id, register_record.class_level_id,
    register_record.class_arm_id, register_record.attendance_date
  ) then
    raise exception 'Attendance entry is unavailable' using errcode = '42501';
  end if;
  if settings.school_id is null
    or target_new_status is null
    or not (target_new_status = any(settings.enabled_student_statuses))
    or target_new_status = entry_record.status
    or target_reason is null
    or char_length(trim(target_reason)) not between 3 and 500 then
    raise exception 'Attendance correction is invalid' using errcode = '22023';
  end if;
  insert into public.student_attendance_corrections (
    organization_id, school_id, register_id, entry_id, student_id,
    previous_status, new_status, reason, corrected_by
  ) values (
    entry_record.organization_id, entry_record.school_id,
    entry_record.register_id, entry_record.id, entry_record.student_id,
    entry_record.status, target_new_status, trim(target_reason), caller_id
  ) returning id into correction_id;
  update public.student_attendance_entries
    set status = target_new_status, updated_at = now()
    where id = entry_record.id;
  return correction_id;
end;
$$;

create or replace function private.prevent_student_attendance_correction_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Attendance correction history is immutable' using errcode = '55000';
end;
$$;

create trigger prevent_student_attendance_correction_mutation
before update or delete on public.student_attendance_corrections
for each row execute function private.prevent_student_attendance_correction_mutation();

create trigger set_student_attendance_entries_updated_at
before update on public.student_attendance_entries
for each row execute function private.set_updated_at();

create trigger audit_student_attendance_registers
after insert or update or delete on public.student_attendance_registers
for each row execute function private.capture_audit_event();
create trigger audit_student_attendance_entries
after insert or update or delete on public.student_attendance_entries
for each row execute function private.capture_audit_event();
create trigger audit_student_attendance_corrections
after insert on public.student_attendance_corrections
for each row execute function private.capture_audit_event();

alter table public.student_attendance_registers enable row level security;
alter table public.student_attendance_entries enable row level security;
alter table public.student_attendance_corrections enable row level security;

create policy student_attendance_registers_select
on public.student_attendance_registers for select to authenticated
using (public.can_access_student_attendance_scope(
  organization_id, school_id, 'attendance.view', session_id,
  class_level_id, class_arm_id, attendance_date));

create policy student_attendance_entries_select
on public.student_attendance_entries for select to authenticated
using (exists (
  select 1 from public.student_attendance_registers register
  where register.id = register_id
    and register.organization_id = organization_id
    and register.school_id = school_id
    and public.can_access_student_attendance_scope(
      register.organization_id, register.school_id, 'attendance.view',
      register.session_id, register.class_level_id, register.class_arm_id,
      register.attendance_date)
));

create policy student_attendance_corrections_select
on public.student_attendance_corrections for select to authenticated
using (exists (
  select 1 from public.student_attendance_registers register
  where register.id = register_id
    and register.organization_id = organization_id
    and register.school_id = school_id
    and public.can_access_student_attendance_scope(
      register.organization_id, register.school_id, 'attendance.view',
      register.session_id, register.class_level_id, register.class_arm_id,
      register.attendance_date)
));

revoke all on public.student_attendance_registers,
  public.student_attendance_entries, public.student_attendance_corrections
  from public, anon, authenticated;
grant select on public.student_attendance_registers,
  public.student_attendance_entries, public.student_attendance_corrections
  to authenticated;
grant update (student_attendance_days, updated_by, updated_at)
  on public.attendance_settings to authenticated;

revoke all on function public.can_access_student_attendance_scope(
  uuid, uuid, text, uuid, uuid, uuid, date) from public, anon;
grant execute on function public.can_access_student_attendance_scope(
  uuid, uuid, text, uuid, uuid, uuid, date) to authenticated;
revoke all on function public.submit_student_attendance_register(
  uuid, uuid, uuid, uuid, uuid, date,
  public.student_attendance_register_type, uuid, jsonb) from public, anon;
grant execute on function public.submit_student_attendance_register(
  uuid, uuid, uuid, uuid, uuid, date,
  public.student_attendance_register_type, uuid, jsonb) to authenticated;
revoke all on function public.correct_student_attendance_entry(
  uuid, public.attendance_status, text) from public, anon;
grant execute on function public.correct_student_attendance_entry(
  uuid, public.attendance_status, text) to authenticated;
revoke all on function private.prevent_student_attendance_correction_mutation()
  from public, anon, authenticated;

comment on table public.student_attendance_registers is
  'One atomic morning or closing register per class scope and teaching day.';
comment on table public.student_attendance_entries is
  'Current student attendance state, writable only through caller-bound RPCs.';
comment on table public.student_attendance_corrections is
  'Immutable status correction history with actor, reason, and prior value.';
