-- Keep class-teacher and subject-teacher scopes mutually exclusive.

alter table public.teaching_assignments
  drop constraint teaching_assignments_check1;

alter table public.teaching_assignments
  add constraint teaching_assignments_kind_subject_check check (
    (assignment_type = 'subject_teacher' and subject_id is not null)
    or (assignment_type = 'class_teacher' and subject_id is null)
  );
