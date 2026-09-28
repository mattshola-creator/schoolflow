-- Cover the tenant-scoped foreign-key paths used by M8-A1 validation and joins.
create index teaching_assignments_school_fk_idx
  on public.teaching_assignments (school_id, organization_id);
create index teaching_assignments_session_fk_idx
  on public.teaching_assignments (session_id, organization_id, school_id);
create index teaching_assignments_staff_assignment_fk_idx
  on public.teaching_assignments (staff_assignment_id, organization_id, school_id);
create index teaching_assignments_subject_fk_idx
  on public.teaching_assignments (subject_id, organization_id, school_id)
  where subject_id is not null;
create index teaching_assignments_class_level_fk_idx
  on public.teaching_assignments (class_level_id, organization_id, school_id);
create index teaching_assignments_class_arm_fk_idx
  on public.teaching_assignments (class_arm_id, organization_id, school_id)
  where class_arm_id is not null;

create index school_calendar_exceptions_school_fk_idx
  on public.school_calendar_exceptions (school_id, organization_id);
create index school_calendar_exceptions_session_fk_idx
  on public.school_calendar_exceptions (session_id, organization_id, school_id);

create index staff_attendance_policies_school_fk_idx
  on public.staff_attendance_policies (school_id, organization_id);
create index staff_attendance_policies_position_fk_idx
  on public.staff_attendance_policies (position_id, organization_id, school_id)
  where position_id is not null;
