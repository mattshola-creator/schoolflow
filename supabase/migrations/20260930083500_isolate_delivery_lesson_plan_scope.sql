-- Avoid resolving delivery-only record fields when the shared scope trigger
-- runs for lesson plans.

create or replace function private.validate_lesson_scope()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  activity_date date;
begin
  if tg_table_name = 'lesson_plans' then
    activity_date := new.lesson_date;
  elsif tg_table_name = 'lesson_deliveries' then
    activity_date := new.delivered_on;
  else
    raise exception 'Lesson scope validation is attached to an unsupported table'
      using errcode = '55000';
  end if;

  if not exists (
    select 1 from public.academic_sessions session
    where session.id = new.session_id
      and session.organization_id = new.organization_id
      and session.school_id = new.school_id
      and activity_date between session.start_date and session.end_date
  ) then
    raise exception 'Lesson date is outside the academic session' using errcode = '23514';
  end if;
  if not exists (
    select 1 from public.teaching_assignments assignment
    where assignment.id = new.teaching_assignment_id
      and assignment.organization_id = new.organization_id
      and assignment.school_id = new.school_id
      and assignment.session_id = new.session_id
      and assignment.subject_id = new.subject_id
      and assignment.class_level_id = new.class_level_id
      and assignment.class_arm_id is not distinct from new.class_arm_id
      and assignment.assignment_type = 'subject_teacher'
      and assignment.status in ('planned', 'active')
  ) then
    raise exception 'Lesson is outside the subject teaching assignment scope' using errcode = '23514';
  end if;
  if new.academic_period_id is not null and not exists (
    select 1 from public.academic_periods period
    where period.id = new.academic_period_id
      and period.session_id = new.session_id
      and period.organization_id = new.organization_id
      and period.school_id = new.school_id
      and activity_date between period.start_date and period.end_date
  ) then
    raise exception 'Lesson date is outside the selected academic period' using errcode = '23514';
  end if;
  if new.curriculum_item_id is not null and not exists (
    select 1 from public.curriculum_items item
    where item.id = new.curriculum_item_id
      and item.organization_id = new.organization_id
      and item.school_id = new.school_id
      and item.session_id = new.session_id
      and item.teaching_assignment_id = new.teaching_assignment_id
  ) then
    raise exception 'Curriculum item is outside the lesson scope' using errcode = '23514';
  end if;
  if tg_table_name = 'lesson_deliveries' then
    if new.lesson_plan_id is not null and not exists (
      select 1 from public.lesson_plans plan
      where plan.id = new.lesson_plan_id
        and plan.organization_id = new.organization_id
        and plan.school_id = new.school_id
        and plan.session_id = new.session_id
        and plan.teaching_assignment_id = new.teaching_assignment_id
    ) then
      raise exception 'Lesson plan is outside the delivery scope' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.validate_lesson_scope() from public, anon, authenticated;
