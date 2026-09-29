-- Cover M8-B6 staff attendance exception foreign keys.

create index staff_attendance_exceptions_action_task_fk_idx
  on public.staff_attendance_exceptions
  (action_task_id, organization_id, school_id)
  where action_task_id is not null;

create index staff_attendance_exceptions_created_by_fk_idx
  on public.staff_attendance_exceptions (created_by);

create index staff_attendance_exceptions_school_fk_idx
  on public.staff_attendance_exceptions (school_id, organization_id);

create index staff_attendance_exceptions_assignment_fk_idx
  on public.staff_attendance_exceptions
  (staff_assignment_id, organization_id, school_id);
