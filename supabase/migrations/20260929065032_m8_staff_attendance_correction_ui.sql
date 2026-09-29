-- M8-B3 Controlled Staff Attendance Corrections.
-- Exposes a caller-bound, read-only event list for the existing immutable
-- correction workflow. The existing correction RPC remains the only write path.

create or replace function public.list_staff_clock_correction_events(
  target_organization_id uuid,
  target_school_id uuid,
  target_attendance_date date
) returns table (
  clock_event_id uuid,
  staff_assignment_id uuid,
  staff_name text,
  staff_number text,
  position_name text,
  event_type public.staff_clock_event_type,
  effective_occurred_at timestamptz,
  attendance_date date
)
language sql
stable
security definer
set search_path = ''
as $$
  select event.id,
    day.staff_assignment_id,
    concat_ws(' ', person.first_name, person.last_name),
    profile.staff_number,
    position.name,
    event.event_type,
    case event.event_type
      when 'clock_in' then day.effective_clock_in_at
      else day.effective_clock_out_at
    end,
    day.attendance_date
  from public.staff_clock_events event
  join public.staff_attendance_days day
    on day.id = event.attendance_day_id
    and day.organization_id = event.organization_id
    and day.school_id = event.school_id
  join public.staff_assignments assignment
    on assignment.id = day.staff_assignment_id
    and assignment.organization_id = day.organization_id
    and assignment.school_id = day.school_id
  join public.staff_profiles profile
    on profile.id = assignment.staff_profile_id
    and profile.organization_id = assignment.organization_id
  join public.people person on person.id = profile.person_id
  join public.positions position
    on position.id = assignment.position_id
    and position.organization_id = assignment.organization_id
    and position.school_id = assignment.school_id
  where day.organization_id = target_organization_id
    and day.school_id = target_school_id
    and day.attendance_date = target_attendance_date
    and public.can_access_staff_attendance_assignment(
      target_organization_id,
      target_school_id,
      day.staff_assignment_id,
      'attendance.staff.correct',
      target_attendance_date
    )
  order by person.last_name, person.first_name, event.event_type;
$$;

revoke all on function public.list_staff_clock_correction_events(uuid, uuid, date)
  from public, anon;
grant execute on function public.list_staff_clock_correction_events(uuid, uuid, date)
  to authenticated;

comment on function public.list_staff_clock_correction_events(uuid, uuid, date) is
  'Caller-bound read-only staff clock events available to the controlled correction workflow.';
