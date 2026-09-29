-- M8-B2 Staff Attendance UI Support.
-- Adds read-only caller-bound RPCs for the clock and policy setup screens.

create or replace function public.list_staff_clock_assignments(
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
  day_status public.staff_attendance_day_status
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
    attendance_day.status
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
    and employment.status = 'active'
    and employment.started_on <= target_attendance_date
    and (employment.ended_on is null or employment.ended_on >= target_attendance_date)
    and public.can_access_staff_attendance_assignment(
      target_organization_id, target_school_id, assignment.id,
      'attendance.staff.record', target_attendance_date
    )
  order by person.last_name, person.first_name, profile.staff_number;
$$;

create or replace function public.list_staff_attendance_positions(
  target_organization_id uuid,
  target_school_id uuid
) returns table (position_id uuid, position_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select position.id, position.name
  from public.positions position
  where position.organization_id = target_organization_id
    and position.school_id = target_school_id
    and position.status = 'active'
    and public.can_access_attendance(
      target_organization_id, target_school_id,
      'attendance.configure', 'attendance.staff_clock'
    )
  order by position.name;
$$;

revoke all on function public.list_staff_clock_assignments(uuid, uuid, date)
  from public, anon;
revoke all on function public.list_staff_attendance_positions(uuid, uuid)
  from public, anon;
grant execute on function public.list_staff_clock_assignments(uuid, uuid, date)
  to authenticated;
grant execute on function public.list_staff_attendance_positions(uuid, uuid)
  to authenticated;

comment on function public.list_staff_clock_assignments(uuid, uuid, date) is
  'Caller-bound staff clock workspace; returns only assignments the actor may record.';
comment on function public.list_staff_attendance_positions(uuid, uuid) is
  'Caller-bound active position list for authorized staff attendance policy setup.';
