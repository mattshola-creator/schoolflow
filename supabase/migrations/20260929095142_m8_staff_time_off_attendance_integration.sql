-- M8-B5 Approved Staff Time-Off Attendance Integration.
-- Enriches the existing caller-bound clock workspace without creating or
-- mutating attendance records. A request excuses the whole attendance day
-- only when its approved interval covers the complete scheduled policy window.

create or replace function private.staff_time_off_covers_schedule(
  target_date date,
  target_starts_at time,
  target_ends_at time,
  target_timezone text,
  request_starts_at timestamptz,
  request_ends_at timestamptz
) returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select target_date is not null
    and target_starts_at is not null
    and target_ends_at is not null
    and target_timezone is not null
    and request_starts_at <= (target_date + target_starts_at)
      at time zone target_timezone
    and request_ends_at >= (target_date + target_ends_at)
      at time zone target_timezone;
$$;

revoke all on function private.staff_time_off_covers_schedule(
  date, time, time, text, timestamptz, timestamptz
) from public, anon, authenticated;

drop function public.list_staff_clock_assignments(uuid, uuid, date);

create function public.list_staff_clock_assignments(
  target_organization_id uuid,
  target_school_id uuid,
  target_attendance_date date
) returns table (
  staff_assignment_id uuid,
  staff_name text,
  staff_number text,
  position_name text,
  policy_name text,
  policy_starts_at time,
  policy_ends_at time,
  policy_grace_minutes smallint,
  attendance_day_id uuid,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  day_status public.staff_attendance_day_status,
  approved_time_off_kind public.staff_time_request_kind,
  approved_time_off_starts_at timestamptz,
  approved_time_off_ends_at timestamptz,
  is_excused boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select assignment.id,
    concat_ws(' ', person.first_name, person.last_name),
    profile.staff_number,
    position.name,
    policy.name,
    policy.starts_at,
    policy.ends_at,
    policy.grace_minutes,
    attendance_day.id,
    attendance_day.effective_clock_in_at,
    attendance_day.effective_clock_out_at,
    case
      when attendance_day.id is null and coalesce(time_off.is_excused, false)
        then 'excused'::public.staff_attendance_day_status
      else attendance_day.status
    end,
    time_off.kind,
    time_off.starts_at,
    time_off.ends_at,
    coalesce(time_off.is_excused, false)
  from public.staff_assignments assignment
  join public.employments employment
    on employment.id = assignment.employment_id
    and employment.organization_id = assignment.organization_id
  join public.staff_profiles profile
    on profile.id = assignment.staff_profile_id
    and profile.organization_id = assignment.organization_id
  join public.people person on person.id = profile.person_id
  join public.positions position
    on position.id = assignment.position_id
    and position.organization_id = assignment.organization_id
    and position.school_id = assignment.school_id
  join public.schools school
    on school.id = assignment.school_id
    and school.organization_id = assignment.organization_id
  join public.locations location
    on location.id = school.location_id
    and location.organization_id = school.organization_id
  left join lateral (
    select candidate.*
    from public.staff_attendance_policies candidate
    where candidate.organization_id = assignment.organization_id
      and candidate.school_id = assignment.school_id
      and candidate.status = 'active'
      and candidate.position_id is not distinct from assignment.position_id
      and candidate.effective_from <= target_attendance_date
      and (candidate.effective_to is null or candidate.effective_to >= target_attendance_date)
    order by candidate.effective_from desc
    limit 1
  ) position_policy on true
  left join lateral (
    select candidate.*
    from public.staff_attendance_policies candidate
    where candidate.organization_id = assignment.organization_id
      and candidate.school_id = assignment.school_id
      and candidate.status = 'active'
      and candidate.position_id is null
      and candidate.effective_from <= target_attendance_date
      and (candidate.effective_to is null or candidate.effective_to >= target_attendance_date)
    order by candidate.effective_from desc
    limit 1
  ) school_policy on true
  left join lateral (
    select coalesce(position_policy.id, school_policy.id) id,
      coalesce(position_policy.name, school_policy.name) name,
      coalesce(position_policy.starts_at, school_policy.starts_at) starts_at,
      coalesce(position_policy.ends_at, school_policy.ends_at) ends_at,
      coalesce(position_policy.grace_minutes, school_policy.grace_minutes) grace_minutes
  ) policy on true
  left join lateral (
    select request.kind,
      request.starts_at,
      request.ends_at,
      policy.id is not null and private.staff_time_off_covers_schedule(
        target_attendance_date, policy.starts_at, policy.ends_at,
        location.timezone, request.starts_at, request.ends_at
      ) as is_excused
    from public.staff_time_requests request
    where request.organization_id = assignment.organization_id
      and request.school_id = assignment.school_id
      and request.staff_assignment_id = assignment.id
      and request.status = 'approved'
      and request.starts_at < ((target_attendance_date + interval '1 day')::date::timestamp)
        at time zone location.timezone
      and request.ends_at > target_attendance_date::timestamp
        at time zone location.timezone
    order by
      (policy.id is not null and private.staff_time_off_covers_schedule(
        target_attendance_date, policy.starts_at, policy.ends_at,
        location.timezone, request.starts_at, request.ends_at
      )) desc,
      request.starts_at
    limit 1
  ) time_off on true
  left join public.staff_attendance_days attendance_day
    on attendance_day.staff_assignment_id = assignment.id
    and attendance_day.organization_id = assignment.organization_id
    and attendance_day.school_id = assignment.school_id
    and attendance_day.attendance_date = target_attendance_date
  where assignment.organization_id = target_organization_id
    and assignment.school_id = target_school_id
    and assignment.status = 'active'
    and assignment.started_on <= target_attendance_date
    and (assignment.ended_on is null or assignment.ended_on >= target_attendance_date)
    and employment.status in ('active', 'on_leave')
    and employment.started_on <= target_attendance_date
    and (employment.ended_on is null or employment.ended_on >= target_attendance_date)
    and public.can_access_staff_attendance_assignment(
      target_organization_id, target_school_id, assignment.id,
      'attendance.staff.record', target_attendance_date
    )
  order by person.last_name, person.first_name, profile.staff_number;
$$;

revoke all on function public.list_staff_clock_assignments(uuid, uuid, date)
  from public, anon;
grant execute on function public.list_staff_clock_assignments(uuid, uuid, date)
  to authenticated;

comment on function public.list_staff_clock_assignments(uuid, uuid, date) is
  'Caller-bound staff clock workspace enriched with approved time-off coverage; performs no writes.';
