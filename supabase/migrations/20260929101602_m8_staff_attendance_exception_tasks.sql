-- M8-B6 Staff Attendance Summaries and Controlled Exceptions.

create type public.staff_attendance_exception_kind as enum (
  'missing_clock_in', 'missing_clock_out'
);
create type public.staff_attendance_exception_status as enum ('open', 'resolved');

alter table public.action_tasks
  add constraint action_tasks_id_organization_school_key
  unique (id, organization_id, school_id);

create table public.staff_attendance_exceptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  staff_assignment_id uuid not null,
  attendance_date date not null,
  kind public.staff_attendance_exception_kind not null,
  status public.staff_attendance_exception_status not null default 'open',
  action_task_id uuid unique,
  resolved_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'resolved' and resolved_at is not null)
    or (status = 'open' and resolved_at is null)),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (staff_assignment_id, organization_id, school_id)
    references public.staff_assignments(id, organization_id, school_id) on delete restrict,
  foreign key (action_task_id, organization_id, school_id)
    references public.action_tasks(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (organization_id, school_id, staff_assignment_id, attendance_date, kind)
);

create index staff_attendance_exceptions_queue_idx
  on public.staff_attendance_exceptions
  (organization_id, school_id, status, attendance_date desc);
create index staff_attendance_exceptions_assignment_idx
  on public.staff_attendance_exceptions
  (staff_assignment_id, attendance_date desc);

create trigger set_staff_attendance_exceptions_updated_at
before update on public.staff_attendance_exceptions
for each row execute function private.set_updated_at();

create trigger audit_staff_attendance_exceptions
after insert or update or delete on public.staff_attendance_exceptions
for each row execute function private.capture_audit_event();

alter table public.staff_attendance_exceptions enable row level security;

create policy staff_attendance_exceptions_select
on public.staff_attendance_exceptions for select to authenticated using (
  public.can_access_attendance(
    organization_id, school_id, 'attendance.summary.view', 'attendance.staff_clock'
  )
);

revoke all on public.staff_attendance_exceptions from anon, authenticated;
grant select on public.staff_attendance_exceptions to authenticated;

create or replace function private.staff_attendance_exception_required(
  target_organization_id uuid,
  target_school_id uuid,
  target_staff_assignment_id uuid,
  target_attendance_date date,
  target_kind public.staff_attendance_exception_kind,
  evaluation_time timestamptz
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with assignment_policy as (
    select assignment.id,
      coalesce(position_policy.working_days, school_policy.working_days) working_days,
      coalesce(position_policy.starts_at, school_policy.starts_at) starts_at,
      coalesce(position_policy.ends_at, school_policy.ends_at) ends_at,
      location.timezone
    from public.staff_assignments assignment
    join public.employments employment
      on employment.id = assignment.employment_id
      and employment.organization_id = assignment.organization_id
    join public.schools school
      on school.id = assignment.school_id
      and school.organization_id = assignment.organization_id
    join public.locations location
      on location.id = school.location_id
      and location.organization_id = school.organization_id
    left join lateral (
      select candidate.* from public.staff_attendance_policies candidate
      where candidate.organization_id = assignment.organization_id
        and candidate.school_id = assignment.school_id
        and candidate.position_id = assignment.position_id
        and candidate.status = 'active'
        and candidate.effective_from <= target_attendance_date
        and (candidate.effective_to is null or candidate.effective_to >= target_attendance_date)
      order by candidate.effective_from desc limit 1
    ) position_policy on true
    left join lateral (
      select candidate.* from public.staff_attendance_policies candidate
      where candidate.organization_id = assignment.organization_id
        and candidate.school_id = assignment.school_id
        and candidate.position_id is null
        and candidate.status = 'active'
        and candidate.effective_from <= target_attendance_date
        and (candidate.effective_to is null or candidate.effective_to >= target_attendance_date)
      order by candidate.effective_from desc limit 1
    ) school_policy on true
    where assignment.id = target_staff_assignment_id
      and assignment.organization_id = target_organization_id
      and assignment.school_id = target_school_id
      and assignment.status = 'active'
      and assignment.started_on <= target_attendance_date
      and (assignment.ended_on is null or assignment.ended_on >= target_attendance_date)
      and employment.status in ('active', 'on_leave')
      and employment.started_on <= target_attendance_date
      and (employment.ended_on is null or employment.ended_on >= target_attendance_date)
  ), state as (
    select policy.*,
      day.effective_clock_in_at,
      day.effective_clock_out_at,
      exists (
        select 1 from public.staff_time_requests request
        where request.organization_id = target_organization_id
          and request.school_id = target_school_id
          and request.staff_assignment_id = target_staff_assignment_id
          and request.status = 'approved'
          and private.staff_time_off_covers_schedule(
            target_attendance_date, policy.starts_at, policy.ends_at,
            policy.timezone, request.starts_at, request.ends_at
          )
      ) is_excused,
      exists (
        select 1 from public.school_calendar_exceptions exception
        where exception.organization_id = target_organization_id
          and exception.school_id = target_school_id
          and exception.calendar_date = target_attendance_date
          and not exception.is_teaching_day
      ) is_non_teaching_day
    from assignment_policy policy
    left join public.staff_attendance_days day
      on day.organization_id = target_organization_id
      and day.school_id = target_school_id
      and day.staff_assignment_id = target_staff_assignment_id
      and day.attendance_date = target_attendance_date
  )
  select starts_at is not null
    and extract(dow from target_attendance_date)::smallint = any(working_days)
    and not is_excused
    and not is_non_teaching_day
    and evaluation_time >= (target_attendance_date + ends_at) at time zone timezone
    and case target_kind
      when 'missing_clock_in' then effective_clock_in_at is null
      when 'missing_clock_out' then effective_clock_in_at is not null
        and effective_clock_out_at is null
    end
  from state;
$$;

revoke all on function private.staff_attendance_exception_required(
  uuid, uuid, uuid, date, public.staff_attendance_exception_kind, timestamptz
) from public, anon, authenticated;

create or replace function public.refresh_staff_attendance_exceptions(
  target_organization_id uuid,
  target_school_id uuid,
  target_attendance_date date
) returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  school_timezone text;
  evaluation_time timestamptz := now();
  candidate record;
  exception_id uuid;
  task_id uuid;
  affected integer := 0;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if target_attendance_date is null
    or not public.can_access_attendance(
      target_organization_id, target_school_id,
      'attendance.summary.view', 'attendance.staff_clock'
    )
    or not public.can_access_shared(
      target_organization_id, target_school_id,
      'shared.tasks.manage', 'foundation.action_center'
    ) then
    raise exception 'Attendance exceptions are unavailable' using errcode = '42501';
  end if;

  select location.timezone into school_timezone
  from public.schools school
  join public.locations location
    on location.id = school.location_id
    and location.organization_id = school.organization_id
  where school.id = target_school_id
    and school.organization_id = target_organization_id;
  if school_timezone is null
    or target_attendance_date > (evaluation_time at time zone school_timezone)::date then
    raise exception 'Attendance exception date is invalid' using errcode = '22023';
  end if;

  for candidate in
    select assignment.id staff_assignment_id,
      concat_ws(' ', person.first_name, person.last_name) staff_name,
      profile.staff_number,
      kind.value exception_kind
    from public.staff_assignments assignment
    join public.employments employment
      on employment.id = assignment.employment_id
      and employment.organization_id = assignment.organization_id
    join public.staff_profiles profile
      on profile.id = assignment.staff_profile_id
      and profile.organization_id = assignment.organization_id
    join public.people person on person.id = profile.person_id
    cross join (values
      ('missing_clock_in'::public.staff_attendance_exception_kind),
      ('missing_clock_out'::public.staff_attendance_exception_kind)
    ) kind(value)
    where assignment.organization_id = target_organization_id
      and assignment.school_id = target_school_id
      and private.staff_attendance_exception_required(
        target_organization_id, target_school_id, assignment.id,
        target_attendance_date, kind.value, evaluation_time
      )
  loop
    exception_id := null;
    task_id := null;
    insert into public.staff_attendance_exceptions (
      organization_id, school_id, staff_assignment_id,
      attendance_date, kind, created_by
    ) values (
      target_organization_id, target_school_id, candidate.staff_assignment_id,
      target_attendance_date, candidate.exception_kind, caller_id
    ) on conflict (organization_id, school_id, staff_assignment_id, attendance_date, kind)
    do nothing
    returning id, action_task_id into exception_id, task_id;

    if exception_id is null then
      select exception.id, exception.action_task_id into exception_id, task_id
      from public.staff_attendance_exceptions exception
      where exception.organization_id = target_organization_id
        and exception.school_id = target_school_id
        and exception.staff_assignment_id = candidate.staff_assignment_id
        and exception.attendance_date = target_attendance_date
        and exception.kind = candidate.exception_kind;
    end if;

    if task_id is null then
      insert into public.action_tasks (
        organization_id, school_id, title, description, priority,
        due_at, source_type, source_id, created_by
      ) values (
        target_organization_id, target_school_id,
        case candidate.exception_kind
          when 'missing_clock_in' then 'Missing staff clock-in'
          else 'Missing staff clock-out'
        end || ': ' || candidate.staff_name,
        candidate.staff_number || ' · ' || target_attendance_date::text,
        'high',
        (target_attendance_date + interval '1 day')::date::timestamp
          at time zone school_timezone,
        'staff_attendance_exception', exception_id, caller_id
      ) returning id into task_id;
      update public.staff_attendance_exceptions
      set action_task_id = task_id where id = exception_id;
      affected := affected + 1;
    end if;
  end loop;

  with resolved as (
    update public.staff_attendance_exceptions exception
    set status = 'resolved', resolved_at = evaluation_time
    where exception.organization_id = target_organization_id
      and exception.school_id = target_school_id
      and exception.attendance_date = target_attendance_date
      and exception.status = 'open'
      and not private.staff_attendance_exception_required(
        exception.organization_id, exception.school_id,
        exception.staff_assignment_id, exception.attendance_date,
        exception.kind, evaluation_time
      )
    returning exception.action_task_id
  )
  update public.action_tasks task
  set status = 'completed', completed_at = evaluation_time
  where task.id in (select action_task_id from resolved where action_task_id is not null)
    and task.status in ('open', 'in_progress');

  return affected;
end;
$$;

create or replace function public.get_staff_attendance_summary(
  target_organization_id uuid,
  target_school_id uuid,
  target_attendance_date date
) returns table (
  scheduled_staff bigint,
  present_staff bigint,
  incomplete_staff bigint,
  excused_staff bigint,
  open_exceptions bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with permitted as (
    select public.can_access_attendance(
      target_organization_id, target_school_id,
      'attendance.summary.view', 'attendance.staff_clock'
    ) allowed
  ), authorized as (
    select assignment.id,
      coalesce(position_policy.working_days, school_policy.working_days) working_days,
      coalesce(position_policy.starts_at, school_policy.starts_at) starts_at,
      coalesce(position_policy.ends_at, school_policy.ends_at) ends_at,
      location.timezone,
      day.status day_status,
      exists (
        select 1 from public.staff_time_requests request
        where request.organization_id = assignment.organization_id
          and request.school_id = assignment.school_id
          and request.staff_assignment_id = assignment.id
          and request.status = 'approved'
          and private.staff_time_off_covers_schedule(
            target_attendance_date,
            coalesce(position_policy.starts_at, school_policy.starts_at),
            coalesce(position_policy.ends_at, school_policy.ends_at),
            location.timezone, request.starts_at, request.ends_at
          )
      ) is_excused
    from public.staff_assignments assignment
    join public.employments employment
      on employment.id = assignment.employment_id
      and employment.organization_id = assignment.organization_id
    join public.schools school
      on school.id = assignment.school_id
      and school.organization_id = assignment.organization_id
    join public.locations location
      on location.id = school.location_id
      and location.organization_id = school.organization_id
    left join lateral (
      select candidate.* from public.staff_attendance_policies candidate
      where candidate.organization_id = assignment.organization_id
        and candidate.school_id = assignment.school_id
        and candidate.position_id = assignment.position_id
        and candidate.status = 'active'
        and candidate.effective_from <= target_attendance_date
        and (candidate.effective_to is null or candidate.effective_to >= target_attendance_date)
      order by candidate.effective_from desc limit 1
    ) position_policy on true
    left join lateral (
      select candidate.* from public.staff_attendance_policies candidate
      where candidate.organization_id = assignment.organization_id
        and candidate.school_id = assignment.school_id
        and candidate.position_id is null
        and candidate.status = 'active'
        and candidate.effective_from <= target_attendance_date
        and (candidate.effective_to is null or candidate.effective_to >= target_attendance_date)
      order by candidate.effective_from desc limit 1
    ) school_policy on true
    left join public.staff_attendance_days day
      on day.organization_id = assignment.organization_id
      and day.school_id = assignment.school_id
      and day.staff_assignment_id = assignment.id
      and day.attendance_date = target_attendance_date
    cross join permitted
    where assignment.organization_id = target_organization_id
      and assignment.school_id = target_school_id
      and assignment.status = 'active'
      and assignment.started_on <= target_attendance_date
      and (assignment.ended_on is null or assignment.ended_on >= target_attendance_date)
      and employment.status in ('active', 'on_leave')
      and employment.started_on <= target_attendance_date
      and (employment.ended_on is null or employment.ended_on >= target_attendance_date)
      and permitted.allowed
      and public.can_access_staff_attendance_assignment(
        target_organization_id, target_school_id, assignment.id,
        'attendance.view', target_attendance_date
      )
      and coalesce(position_policy.starts_at, school_policy.starts_at) is not null
      and extract(dow from target_attendance_date)::smallint = any(
        coalesce(position_policy.working_days, school_policy.working_days)
      )
      and not exists (
        select 1 from public.school_calendar_exceptions exception
        where exception.organization_id = target_organization_id
          and exception.school_id = target_school_id
          and exception.calendar_date = target_attendance_date
          and not exception.is_teaching_day
      )
  )
  select count(*)::bigint,
    count(*) filter (where authorized.day_status in ('present', 'late', 'left_early'))::bigint,
    count(*) filter (
      where not authorized.is_excused
        and (authorized.day_status is null or authorized.day_status = 'incomplete')
    )::bigint,
    count(*) filter (where authorized.is_excused)::bigint,
    (select count(*) from public.staff_attendance_exceptions exception
      where exception.organization_id = target_organization_id
        and exception.school_id = target_school_id
        and exception.attendance_date = target_attendance_date
        and exception.status = 'open'
        and (select allowed from permitted))::bigint
  from authorized;
$$;

revoke all on function public.refresh_staff_attendance_exceptions(uuid, uuid, date)
  from public, anon;
revoke all on function public.get_staff_attendance_summary(uuid, uuid, date)
  from public, anon;
grant execute on function public.refresh_staff_attendance_exceptions(uuid, uuid, date)
  to authenticated;
grant execute on function public.get_staff_attendance_summary(uuid, uuid, date)
  to authenticated;

comment on function public.refresh_staff_attendance_exceptions(uuid, uuid, date) is
  'Idempotently materializes authorized missing-clock exceptions and Action Center tasks.';
comment on function public.get_staff_attendance_summary(uuid, uuid, date) is
  'Caller-bound staff attendance summary for one school date.';
