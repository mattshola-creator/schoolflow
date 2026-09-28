-- M8-B1 Staff Attendance Foundation.
-- Adds caller-bound clock mutations and immutable corrections without UI or
-- production feature enablement.

create type public.staff_clock_event_type as enum ('clock_in', 'clock_out');
create type public.staff_clock_source as enum ('self_service', 'authorized_operator');
create type public.staff_attendance_day_status as enum (
  'present', 'late', 'left_early', 'incomplete', 'excused'
);

insert into public.permissions (key, description) values
  ('attendance.staff.record_all', 'Record staff attendance across the school'),
  ('attendance.staff.correct_all', 'Correct staff attendance across the school')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'organization_owner'
  and p.key in ('attendance.staff.record_all', 'attendance.staff.correct_all')
on conflict do nothing;

create table public.staff_attendance_days (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  staff_assignment_id uuid not null,
  employment_id uuid not null,
  staff_profile_id uuid not null,
  position_id uuid not null,
  attendance_date date not null,
  policy_id uuid not null,
  policy_starts_at time not null,
  policy_ends_at time not null,
  policy_grace_minutes smallint not null check (policy_grace_minutes between 0 and 240),
  effective_clock_in_at timestamptz,
  effective_clock_out_at timestamptz,
  status public.staff_attendance_day_status not null default 'incomplete',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_clock_out_at is null or effective_clock_in_at is not null),
  check (effective_clock_out_at is null or effective_clock_out_at > effective_clock_in_at),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (staff_assignment_id, organization_id, school_id)
    references public.staff_assignments(id, organization_id, school_id) on delete restrict,
  foreign key (employment_id, staff_profile_id, organization_id)
    references public.employments(id, staff_profile_id, organization_id) on delete restrict,
  foreign key (position_id, organization_id, school_id)
    references public.positions(id, organization_id, school_id) on delete restrict,
  foreign key (policy_id, organization_id, school_id)
    references public.staff_attendance_policies(id, organization_id, school_id) on delete restrict,
  unique (organization_id, school_id, staff_assignment_id, attendance_date),
  unique (id, organization_id, school_id)
);

create table public.staff_clock_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  attendance_day_id uuid not null,
  staff_assignment_id uuid not null,
  event_type public.staff_clock_event_type not null,
  occurred_at timestamptz not null,
  source public.staff_clock_source not null,
  idempotency_key uuid not null,
  request_fingerprint text not null check (request_fingerprint ~ '^[a-f0-9]{32}$'),
  note text check (note is null or char_length(trim(note)) between 1 and 500),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (attendance_day_id, organization_id, school_id)
    references public.staff_attendance_days(id, organization_id, school_id) on delete restrict,
  foreign key (staff_assignment_id, organization_id, school_id)
    references public.staff_assignments(id, organization_id, school_id) on delete restrict,
  unique (organization_id, school_id, idempotency_key),
  unique (attendance_day_id, event_type),
  unique (id, organization_id, school_id)
);

create table public.staff_clock_corrections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  attendance_day_id uuid not null,
  clock_event_id uuid not null,
  previous_occurred_at timestamptz not null,
  corrected_occurred_at timestamptz not null,
  reason text not null check (char_length(trim(reason)) between 3 and 500),
  corrected_by uuid not null references auth.users(id) on delete restrict,
  corrected_at timestamptz not null default now(),
  check (corrected_occurred_at <> previous_occurred_at),
  foreign key (attendance_day_id, organization_id, school_id)
    references public.staff_attendance_days(id, organization_id, school_id) on delete restrict,
  foreign key (clock_event_id, organization_id, school_id)
    references public.staff_clock_events(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create index staff_attendance_days_scope_idx on public.staff_attendance_days
  (organization_id, school_id, attendance_date desc, status);
create index staff_attendance_days_assignment_idx on public.staff_attendance_days
  (staff_assignment_id, attendance_date desc);
create index staff_attendance_days_employment_fk_idx on public.staff_attendance_days
  (employment_id, staff_profile_id, organization_id);
create index staff_attendance_days_position_fk_idx on public.staff_attendance_days
  (position_id, organization_id, school_id);
create index staff_attendance_days_policy_fk_idx on public.staff_attendance_days
  (policy_id, organization_id, school_id);
create index staff_clock_events_day_idx on public.staff_clock_events
  (attendance_day_id, occurred_at);
create index staff_clock_events_assignment_fk_idx on public.staff_clock_events
  (staff_assignment_id, organization_id, school_id);
create index staff_clock_events_recorder_idx on public.staff_clock_events
  (recorded_by, created_at desc);
create index staff_clock_corrections_day_idx on public.staff_clock_corrections
  (attendance_day_id, corrected_at desc);
create index staff_clock_corrections_event_fk_idx on public.staff_clock_corrections
  (clock_event_id, organization_id, school_id);
create index staff_clock_corrections_actor_idx on public.staff_clock_corrections
  (corrected_by, corrected_at desc);

create or replace function public.can_access_staff_attendance_assignment(
  target_organization_id uuid,
  target_school_id uuid,
  target_staff_assignment_id uuid,
  permission_key text,
  target_attendance_date date
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select permission_key in (
      'attendance.view', 'attendance.staff.record', 'attendance.staff.correct'
    )
    and target_attendance_date is not null
    and public.can_access_attendance(
      target_organization_id, target_school_id, permission_key,
      'attendance.staff_clock'
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
        and assignment.started_on <= target_attendance_date
        and (assignment.ended_on is null or assignment.ended_on >= target_attendance_date)
        and employment.status = 'active'
        and employment.started_on <= target_attendance_date
        and (employment.ended_on is null or employment.ended_on >= target_attendance_date)
        and (
          (permission_key = 'attendance.view' and public.has_permission(
            target_organization_id, target_school_id, 'attendance.summary.view'))
          or (permission_key = 'attendance.staff.record' and public.has_permission(
            target_organization_id, target_school_id, 'attendance.staff.record_all'))
          or (permission_key = 'attendance.staff.correct' and public.has_permission(
            target_organization_id, target_school_id, 'attendance.staff.correct_all'))
          or (
            permission_key in ('attendance.view', 'attendance.staff.record')
            and employment.user_id = (select auth.uid())
          )
        )
    );
$$;

create or replace function private.staff_attendance_status(
  target_date date,
  target_clock_in timestamptz,
  target_clock_out timestamptz,
  target_starts_at time,
  target_ends_at time,
  target_grace_minutes smallint,
  target_timezone text
) returns public.staff_attendance_day_status
language sql
immutable
set search_path = ''
as $$
  select case
    when target_clock_in is null then 'incomplete'::public.staff_attendance_day_status
    when target_clock_out is not null
      and (target_clock_out at time zone target_timezone)::time < target_ends_at
      then 'left_early'::public.staff_attendance_day_status
    when (target_clock_in at time zone target_timezone)::time
      > target_starts_at + make_interval(mins => target_grace_minutes)
      then 'late'::public.staff_attendance_day_status
    else 'present'::public.staff_attendance_day_status
  end;
$$;

create or replace function public.record_staff_clock_event(
  target_organization_id uuid,
  target_school_id uuid,
  target_staff_assignment_id uuid,
  target_event_type public.staff_clock_event_type,
  target_occurred_at timestamptz,
  target_idempotency_key uuid,
  target_note text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  assignment public.staff_assignments%rowtype;
  policy public.staff_attendance_policies%rowtype;
  day_record public.staff_attendance_days%rowtype;
  existing_event public.staff_clock_events%rowtype;
  school_timezone text;
  local_date date;
  local_today date;
  fingerprint text;
  event_id uuid;
  source_value public.staff_clock_source;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if target_event_type is null or target_occurred_at is null
    or target_idempotency_key is null
    or (target_note is not null and char_length(trim(target_note)) not between 1 and 500) then
    raise exception 'Staff clock input is invalid' using errcode = '22023';
  end if;

  select location.timezone into school_timezone
  from public.schools school
  join public.locations location on location.id = school.location_id
  where school.id = target_school_id
    and school.organization_id = target_organization_id;
  if school_timezone is null then
    raise exception 'Staff clock scope is unavailable' using errcode = '42501';
  end if;
  local_date := (target_occurred_at at time zone school_timezone)::date;
  local_today := (now() at time zone school_timezone)::date;
  if local_date <> local_today or target_occurred_at > now() + interval '5 minutes' then
    raise exception 'Staff clock time is invalid' using errcode = '22023';
  end if;
  if not public.can_access_staff_attendance_assignment(
    target_organization_id, target_school_id, target_staff_assignment_id,
    'attendance.staff.record', local_date
  ) then
    raise exception 'Staff clock scope is unavailable' using errcode = '42501';
  end if;

  select * into assignment from public.staff_assignments
  where id = target_staff_assignment_id
    and organization_id = target_organization_id
    and school_id = target_school_id;
  select * into policy from public.staff_attendance_policies
  where organization_id = target_organization_id
    and school_id = target_school_id
    and status = 'active'
    and effective_from <= local_date
    and (effective_to is null or effective_to >= local_date)
    and (position_id = assignment.position_id or position_id is null)
  order by (position_id is not null) desc
  limit 1;
  if policy.id is null or not extract(dow from local_date)::smallint = any(policy.working_days) then
    raise exception 'Staff clock policy is unavailable' using errcode = '42501';
  end if;

  fingerprint := md5(jsonb_build_object(
    'organizationId', target_organization_id,
    'schoolId', target_school_id,
    'staffAssignmentId', target_staff_assignment_id,
    'eventType', target_event_type,
    'occurredAt', target_occurred_at,
    'note', nullif(trim(target_note), '')
  )::text);
  select * into existing_event from public.staff_clock_events
  where organization_id = target_organization_id
    and school_id = target_school_id
    and idempotency_key = target_idempotency_key;
  if existing_event.id is not null then
    if existing_event.request_fingerprint <> fingerprint then
      raise exception 'Idempotency key was already used for another request' using errcode = '22023';
    end if;
    return existing_event.id;
  end if;

  insert into public.staff_attendance_days (
    organization_id, school_id, staff_assignment_id, employment_id,
    staff_profile_id, position_id, attendance_date, policy_id,
    policy_starts_at, policy_ends_at, policy_grace_minutes
  ) values (
    target_organization_id, target_school_id, assignment.id,
    assignment.employment_id, assignment.staff_profile_id,
    assignment.position_id, local_date, policy.id, policy.starts_at,
    policy.ends_at, policy.grace_minutes
  ) on conflict (organization_id, school_id, staff_assignment_id, attendance_date)
  do nothing;

  select * into day_record from public.staff_attendance_days
  where organization_id = target_organization_id
    and school_id = target_school_id
    and staff_assignment_id = target_staff_assignment_id
    and attendance_date = local_date
  for update;
  if target_event_type = 'clock_in' and day_record.effective_clock_in_at is not null
    or target_event_type = 'clock_out' and day_record.effective_clock_out_at is not null then
    raise exception 'Staff clock event already exists' using errcode = '23505';
  end if;
  if target_event_type = 'clock_out'
    and (day_record.effective_clock_in_at is null
      or target_occurred_at <= day_record.effective_clock_in_at) then
    raise exception 'Clock-out requires an earlier clock-in' using errcode = '22023';
  end if;

  source_value := case when exists (
    select 1 from public.employments employment
    where employment.id = assignment.employment_id
      and employment.user_id = caller_id
  ) then 'self_service'::public.staff_clock_source
  else 'authorized_operator'::public.staff_clock_source end;
  insert into public.staff_clock_events (
    organization_id, school_id, attendance_day_id, staff_assignment_id,
    event_type, occurred_at, source, idempotency_key, request_fingerprint,
    note, recorded_by
  ) values (
    target_organization_id, target_school_id, day_record.id,
    target_staff_assignment_id, target_event_type, target_occurred_at,
    source_value, target_idempotency_key, fingerprint,
    nullif(trim(target_note), ''), caller_id
  ) returning id into event_id;

  update public.staff_attendance_days
  set effective_clock_in_at = case when target_event_type = 'clock_in'
        then target_occurred_at else effective_clock_in_at end,
      effective_clock_out_at = case when target_event_type = 'clock_out'
        then target_occurred_at else effective_clock_out_at end,
      status = private.staff_attendance_status(
        local_date,
        case when target_event_type = 'clock_in' then target_occurred_at
          else effective_clock_in_at end,
        case when target_event_type = 'clock_out' then target_occurred_at
          else effective_clock_out_at end,
        policy_starts_at, policy_ends_at, policy_grace_minutes, school_timezone
      )
  where id = day_record.id;
  return event_id;
exception
  when unique_violation then
    select * into existing_event from public.staff_clock_events
    where organization_id = target_organization_id
      and school_id = target_school_id
      and idempotency_key = target_idempotency_key;
    if existing_event.id is not null
      and existing_event.request_fingerprint = fingerprint then
      return existing_event.id;
    end if;
    raise;
end;
$$;

create or replace function public.correct_staff_clock_event(
  target_clock_event_id uuid,
  target_corrected_occurred_at timestamptz,
  target_reason text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  event_record public.staff_clock_events%rowtype;
  day_record public.staff_attendance_days%rowtype;
  other_time timestamptz;
  previous_time timestamptz;
  school_timezone text;
  correction_id uuid;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if target_clock_event_id is null or target_corrected_occurred_at is null
    or target_reason is null or char_length(trim(target_reason)) not between 3 and 500 then
    raise exception 'Staff clock correction is invalid' using errcode = '22023';
  end if;
  select * into event_record from public.staff_clock_events
    where id = target_clock_event_id;
  if event_record.id is null then
    raise exception 'Staff clock event is unavailable' using errcode = '42501';
  end if;
  select * into day_record from public.staff_attendance_days
    where id = event_record.attendance_day_id for update;
  if not public.can_access_staff_attendance_assignment(
    day_record.organization_id, day_record.school_id,
    day_record.staff_assignment_id, 'attendance.staff.correct',
    day_record.attendance_date
  ) then
    raise exception 'Staff clock event is unavailable' using errcode = '42501';
  end if;
  select location.timezone into school_timezone
  from public.schools school
  join public.locations location on location.id = school.location_id
  where school.id = day_record.school_id
    and school.organization_id = day_record.organization_id;
  if school_timezone is null
    or (target_corrected_occurred_at at time zone school_timezone)::date
      <> day_record.attendance_date
    or target_corrected_occurred_at > now() + interval '5 minutes' then
    raise exception 'Staff clock correction time is invalid' using errcode = '22023';
  end if;

  if event_record.event_type = 'clock_in' then
    previous_time := day_record.effective_clock_in_at;
    other_time := day_record.effective_clock_out_at;
    if other_time is not null and target_corrected_occurred_at >= other_time then
      raise exception 'Corrected clock-in must precede clock-out' using errcode = '22023';
    end if;
  else
    previous_time := day_record.effective_clock_out_at;
    other_time := day_record.effective_clock_in_at;
    if other_time is null or target_corrected_occurred_at <= other_time then
      raise exception 'Corrected clock-out must follow clock-in' using errcode = '22023';
    end if;
  end if;
  if previous_time = target_corrected_occurred_at then
    raise exception 'Staff clock correction does not change the event' using errcode = '22023';
  end if;

  insert into public.staff_clock_corrections (
    organization_id, school_id, attendance_day_id, clock_event_id,
    previous_occurred_at, corrected_occurred_at, reason, corrected_by
  ) values (
    day_record.organization_id, day_record.school_id, day_record.id,
    event_record.id, previous_time, target_corrected_occurred_at,
    trim(target_reason), caller_id
  ) returning id into correction_id;

  update public.staff_attendance_days
  set effective_clock_in_at = case when event_record.event_type = 'clock_in'
        then target_corrected_occurred_at else effective_clock_in_at end,
      effective_clock_out_at = case when event_record.event_type = 'clock_out'
        then target_corrected_occurred_at else effective_clock_out_at end,
      status = private.staff_attendance_status(
        attendance_date,
        case when event_record.event_type = 'clock_in' then target_corrected_occurred_at
          else effective_clock_in_at end,
        case when event_record.event_type = 'clock_out' then target_corrected_occurred_at
          else effective_clock_out_at end,
        policy_starts_at, policy_ends_at, policy_grace_minutes, school_timezone
      )
  where id = day_record.id;
  return correction_id;
end;
$$;

create or replace function private.prevent_staff_clock_history_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Staff clock history is immutable' using errcode = '55000';
end;
$$;

create trigger prevent_staff_clock_event_mutation
before update or delete on public.staff_clock_events
for each row execute function private.prevent_staff_clock_history_mutation();
create trigger prevent_staff_clock_correction_mutation
before update or delete on public.staff_clock_corrections
for each row execute function private.prevent_staff_clock_history_mutation();
create trigger set_staff_attendance_days_updated_at
before update on public.staff_attendance_days
for each row execute function private.set_updated_at();
create trigger audit_staff_attendance_days
after insert or update or delete on public.staff_attendance_days
for each row execute function private.capture_audit_event();
create trigger audit_staff_clock_events
after insert or update or delete on public.staff_clock_events
for each row execute function private.capture_audit_event();
create trigger audit_staff_clock_corrections
after insert on public.staff_clock_corrections
for each row execute function private.capture_audit_event();

alter table public.staff_attendance_days enable row level security;
alter table public.staff_clock_events enable row level security;
alter table public.staff_clock_corrections enable row level security;

create policy staff_attendance_days_select on public.staff_attendance_days
for select to authenticated
using (public.can_access_staff_attendance_assignment(
  organization_id, school_id, staff_assignment_id,
  'attendance.view', attendance_date));
create policy staff_clock_events_select on public.staff_clock_events
for select to authenticated
using (exists (
  select 1 from public.staff_attendance_days day
  where day.id = attendance_day_id
    and public.can_access_staff_attendance_assignment(
      day.organization_id, day.school_id, day.staff_assignment_id,
      'attendance.view', day.attendance_date)
));
create policy staff_clock_corrections_select on public.staff_clock_corrections
for select to authenticated
using (exists (
  select 1 from public.staff_attendance_days day
  where day.id = attendance_day_id
    and public.can_access_staff_attendance_assignment(
      day.organization_id, day.school_id, day.staff_assignment_id,
      'attendance.view', day.attendance_date)
));

revoke all on public.staff_attendance_days, public.staff_clock_events,
  public.staff_clock_corrections from anon, authenticated;
grant select on public.staff_attendance_days, public.staff_clock_events,
  public.staff_clock_corrections to authenticated;

revoke all on function public.can_access_staff_attendance_assignment(
  uuid, uuid, uuid, text, date) from public, anon;
revoke all on function public.record_staff_clock_event(
  uuid, uuid, uuid, public.staff_clock_event_type, timestamptz, uuid, text)
  from public, anon;
revoke all on function public.correct_staff_clock_event(uuid, timestamptz, text)
  from public, anon;
grant execute on function public.can_access_staff_attendance_assignment(
  uuid, uuid, uuid, text, date) to authenticated;
grant execute on function public.record_staff_clock_event(
  uuid, uuid, uuid, public.staff_clock_event_type, timestamptz, uuid, text)
  to authenticated;
grant execute on function public.correct_staff_clock_event(uuid, timestamptz, text)
  to authenticated;

revoke all on function private.staff_attendance_status(
  date, timestamptz, timestamptz, time, time, smallint, text)
  from public, anon, authenticated;
revoke all on function private.prevent_staff_clock_history_mutation()
  from public, anon, authenticated;

comment on table public.staff_attendance_days is
  'One policy-snapshotted effective staff attendance summary per school assignment and local date.';
comment on table public.staff_clock_events is
  'Append-only original staff clock events; effective corrections never rewrite source history.';
comment on table public.staff_clock_corrections is
  'Append-only staff clock correction history with mandatory actor and reason.';
