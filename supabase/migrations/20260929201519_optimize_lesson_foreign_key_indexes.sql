-- Cover lesson-planning foreign keys used by validation and lifecycle queries.

create index lesson_plans_school_fk_idx on public.lesson_plans
  (school_id, organization_id);
create index lesson_plans_session_fk_idx on public.lesson_plans
  (session_id, organization_id, school_id);
create index lesson_plans_period_fk_idx on public.lesson_plans
  (academic_period_id, session_id, organization_id, school_id)
  where academic_period_id is not null;
create index lesson_plans_subject_fk_idx on public.lesson_plans
  (subject_id, organization_id, school_id);
create index lesson_plans_level_fk_idx on public.lesson_plans
  (class_level_id, organization_id, school_id);
create index lesson_plans_arm_fk_idx on public.lesson_plans
  (class_arm_id, organization_id, school_id) where class_arm_id is not null;
create index lesson_plans_created_by_idx on public.lesson_plans (created_by);
create index lesson_plans_updated_by_idx on public.lesson_plans (updated_by);
create index lesson_plans_reviewed_by_idx on public.lesson_plans (reviewed_by)
  where reviewed_by is not null;

create index lesson_deliveries_school_fk_idx on public.lesson_deliveries
  (school_id, organization_id);
create index lesson_deliveries_session_fk_idx on public.lesson_deliveries
  (session_id, organization_id, school_id);
create index lesson_deliveries_period_fk_idx on public.lesson_deliveries
  (academic_period_id, session_id, organization_id, school_id)
  where academic_period_id is not null;
create index lesson_deliveries_subject_fk_idx on public.lesson_deliveries
  (subject_id, organization_id, school_id);
create index lesson_deliveries_level_fk_idx on public.lesson_deliveries
  (class_level_id, organization_id, school_id);
create index lesson_deliveries_arm_fk_idx on public.lesson_deliveries
  (class_arm_id, organization_id, school_id) where class_arm_id is not null;
create index lesson_deliveries_recorded_by_idx on public.lesson_deliveries
  (recorded_by);
create index lesson_deliveries_updated_by_idx on public.lesson_deliveries
  (updated_by);
