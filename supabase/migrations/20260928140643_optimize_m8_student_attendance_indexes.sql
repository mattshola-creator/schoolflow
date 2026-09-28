-- Cover every M8-A2 foreign-key path used for referential checks and joins.
create index student_attendance_registers_school_fk_idx
  on public.student_attendance_registers (school_id, organization_id);
create index student_attendance_registers_session_fk_idx
  on public.student_attendance_registers (session_id, organization_id, school_id);
create index student_attendance_registers_level_fk_idx
  on public.student_attendance_registers (class_level_id, organization_id, school_id);
create index student_attendance_registers_arm_fk_idx
  on public.student_attendance_registers (class_arm_id, organization_id, school_id)
  where class_arm_id is not null;
create index student_attendance_registers_submitter_idx
  on public.student_attendance_registers (submitted_by);

create index student_attendance_entries_register_fk_idx
  on public.student_attendance_entries (register_id, organization_id, school_id);
create index student_attendance_entries_student_fk_idx
  on public.student_attendance_entries (student_id, organization_id);
create index student_attendance_entries_enrollment_fk_idx
  on public.student_attendance_entries
    (enrollment_id, student_id, organization_id, school_id);
create index student_attendance_entries_membership_fk_idx
  on public.student_attendance_entries
    (class_membership_id, organization_id, school_id);
create index student_attendance_entries_recorder_idx
  on public.student_attendance_entries (recorded_by);

create index student_attendance_corrections_register_fk_idx
  on public.student_attendance_corrections (register_id, organization_id, school_id);
create index student_attendance_corrections_entry_fk_idx
  on public.student_attendance_corrections (entry_id, organization_id, school_id);
create index student_attendance_corrections_student_fk_idx
  on public.student_attendance_corrections (student_id, organization_id);
create index student_attendance_corrections_actor_idx
  on public.student_attendance_corrections (corrected_by);
