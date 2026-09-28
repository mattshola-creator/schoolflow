-- M8-A3 minimal read surface for the student attendance register UI.
-- Both functions preserve the M8-A2 assignment and feature checks.

create or replace function public.list_student_attendance_scopes(
  target_organization_id uuid,
  target_school_id uuid,
  target_attendance_date date
) returns table (
  session_id uuid,
  session_name text,
  class_level_id uuid,
  class_level_name text,
  class_arm_id uuid,
  class_arm_name text,
  student_count bigint
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if target_attendance_date is null or not public.can_access_attendance(
    target_organization_id, target_school_id, 'attendance.view',
    'attendance.student_registers'
  ) then
    raise exception 'Attendance scopes are unavailable' using errcode = '42501';
  end if;

  return query
  select session.id, session.name, level.id, level.name, arm.id, arm.name,
    count(distinct membership.student_id)
  from public.class_memberships membership
  join public.student_enrollments enrollment
    on enrollment.id = membership.enrollment_id
    and enrollment.student_id = membership.student_id
    and enrollment.organization_id = membership.organization_id
    and enrollment.school_id = membership.school_id
  join public.academic_sessions session
    on session.id = membership.academic_session_id
    and session.organization_id = membership.organization_id
    and session.school_id = membership.school_id
  join public.class_levels level
    on level.id = membership.class_level_id
    and level.organization_id = membership.organization_id
    and level.school_id = membership.school_id
  left join public.class_arms arm
    on arm.id = membership.class_arm_id
    and arm.organization_id = membership.organization_id
    and arm.school_id = membership.school_id
  where membership.organization_id = target_organization_id
    and membership.school_id = target_school_id
    and target_attendance_date between session.start_date and session.end_date
    and membership.status <> 'cancelled'
    and membership.started_on <= target_attendance_date
    and (membership.ended_on is null or membership.ended_on >= target_attendance_date)
    and enrollment.status <> 'cancelled'
    and enrollment.enrolled_on <= target_attendance_date
    and (enrollment.ended_on is null or enrollment.ended_on >= target_attendance_date)
    and public.can_access_student_attendance_scope(
      target_organization_id, target_school_id, 'attendance.student.record',
      membership.academic_session_id, membership.class_level_id,
      membership.class_arm_id, target_attendance_date
    )
  group by session.id, session.name, level.id, level.name, arm.id, arm.name
  order by session.name, level.name, arm.name nulls first;
end;
$$;

create or replace function public.get_student_attendance_roster(
  target_organization_id uuid,
  target_school_id uuid,
  target_session_id uuid,
  target_class_level_id uuid,
  target_class_arm_id uuid,
  target_attendance_date date,
  target_register_type public.student_attendance_register_type
) returns table (
  student_id uuid,
  student_number text,
  first_name text,
  last_name text,
  register_id uuid,
  entry_id uuid,
  attendance_status public.attendance_status,
  attendance_note text,
  submitted_at timestamptz,
  locks_at timestamptz
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.can_access_student_attendance_scope(
    target_organization_id, target_school_id, 'attendance.student.record',
    target_session_id, target_class_level_id, target_class_arm_id,
    target_attendance_date
  ) then
    raise exception 'Attendance roster is unavailable' using errcode = '42501';
  end if;

  return query
  select profile.id, profile.student_number, person.first_name, person.last_name,
    register.id, entry.id, entry.status, entry.note,
    register.submitted_at, register.locks_at
  from public.class_memberships membership
  join public.student_enrollments enrollment
    on enrollment.id = membership.enrollment_id
    and enrollment.student_id = membership.student_id
    and enrollment.organization_id = membership.organization_id
    and enrollment.school_id = membership.school_id
  join public.student_profiles profile
    on profile.id = membership.student_id
    and profile.organization_id = membership.organization_id
  join public.people person on person.id = profile.person_id
  left join public.student_attendance_registers register
    on register.organization_id = membership.organization_id
    and register.school_id = membership.school_id
    and register.session_id = membership.academic_session_id
    and register.class_level_id = membership.class_level_id
    and register.class_arm_id is not distinct from membership.class_arm_id
    and register.attendance_date = target_attendance_date
    and register.register_type = target_register_type
  left join public.student_attendance_entries entry
    on entry.register_id = register.id
    and entry.student_id = membership.student_id
    and entry.organization_id = membership.organization_id
    and entry.school_id = membership.school_id
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
    and (enrollment.ended_on is null or enrollment.ended_on >= target_attendance_date)
  order by person.last_name, person.first_name, profile.student_number;
end;
$$;

revoke all on function public.list_student_attendance_scopes(uuid, uuid, date)
  from public, anon;
grant execute on function public.list_student_attendance_scopes(uuid, uuid, date)
  to authenticated;
revoke all on function public.get_student_attendance_roster(
  uuid, uuid, uuid, uuid, uuid, date,
  public.student_attendance_register_type
) from public, anon;
grant execute on function public.get_student_attendance_roster(
  uuid, uuid, uuid, uuid, uuid, date,
  public.student_attendance_register_type
) to authenticated;

comment on function public.list_student_attendance_scopes(uuid, uuid, date) is
  'Lists only effective class scopes the caller may record for the selected date.';
comment on function public.get_student_attendance_roster(
  uuid, uuid, uuid, uuid, uuid, date,
  public.student_attendance_register_type
) is 'Returns the minimal assigned roster and current register state for attendance entry.';
