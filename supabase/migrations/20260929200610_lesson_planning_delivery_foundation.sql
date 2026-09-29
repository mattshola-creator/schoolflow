-- M8-E4 Lesson planning and delivery foundation.

create type public.lesson_plan_status as enum (
  'draft', 'submitted', 'approved', 'rejected', 'withdrawn'
);
create type public.lesson_delivery_status as enum (
  'scheduled', 'delivered', 'partially_delivered', 'cancelled'
);

create table public.lesson_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  academic_period_id uuid,
  teaching_assignment_id uuid not null,
  curriculum_item_id uuid,
  subject_id uuid not null,
  class_level_id uuid not null,
  class_arm_id uuid,
  lesson_date date not null,
  topic text not null check (char_length(trim(topic)) between 2 and 160),
  objectives text not null check (char_length(trim(objectives)) between 2 and 3000),
  content_outline text not null check (char_length(trim(content_outline)) between 2 and 6000),
  teaching_resources text check (
    teaching_resources is null or char_length(trim(teaching_resources)) between 2 and 2000
  ),
  status public.lesson_plan_status not null default 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete restrict,
  review_comment text check (
    review_comment is null or char_length(trim(review_comment)) between 2 and 2000
  ),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (academic_period_id, session_id, organization_id, school_id)
    references public.academic_periods(id, session_id, organization_id, school_id) on delete restrict,
  foreign key (teaching_assignment_id, organization_id, school_id)
    references public.teaching_assignments(id, organization_id, school_id) on delete restrict,
  foreign key (curriculum_item_id, organization_id, school_id)
    references public.curriculum_items(id, organization_id, school_id) on delete restrict,
  foreign key (subject_id, organization_id, school_id)
    references public.subjects(id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (class_arm_id, organization_id, school_id)
    references public.class_arms(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (teaching_assignment_id, lesson_date, topic),
  check (
    (status = 'submitted' and submitted_at is not null)
    or status <> 'submitted'
  ),
  check (
    (status in ('approved', 'rejected') and reviewed_at is not null and reviewed_by is not null)
    or (status not in ('approved', 'rejected') and reviewed_at is null and reviewed_by is null)
  )
);

create table public.lesson_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  academic_period_id uuid,
  teaching_assignment_id uuid not null,
  lesson_plan_id uuid,
  curriculum_item_id uuid,
  subject_id uuid not null,
  class_level_id uuid not null,
  class_arm_id uuid,
  delivered_on date not null,
  topic text not null check (char_length(trim(topic)) between 2 and 160),
  coverage_notes text not null check (char_length(trim(coverage_notes)) between 2 and 4000),
  classwork text check (classwork is null or char_length(trim(classwork)) between 2 and 3000),
  homework text check (homework is null or char_length(trim(homework)) between 2 and 3000),
  reflection text check (reflection is null or char_length(trim(reflection)) between 2 and 3000),
  status public.lesson_delivery_status not null default 'delivered',
  recorded_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (academic_period_id, session_id, organization_id, school_id)
    references public.academic_periods(id, session_id, organization_id, school_id) on delete restrict,
  foreign key (teaching_assignment_id, organization_id, school_id)
    references public.teaching_assignments(id, organization_id, school_id) on delete restrict,
  foreign key (lesson_plan_id, organization_id, school_id)
    references public.lesson_plans(id, organization_id, school_id) on delete restrict,
  foreign key (curriculum_item_id, organization_id, school_id)
    references public.curriculum_items(id, organization_id, school_id) on delete restrict,
  foreign key (subject_id, organization_id, school_id)
    references public.subjects(id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (class_arm_id, organization_id, school_id)
    references public.class_arms(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (teaching_assignment_id, delivered_on, topic)
);

create index lesson_plans_scope_idx on public.lesson_plans
  (organization_id, school_id, session_id, lesson_date, status);
create index lesson_plans_assignment_idx on public.lesson_plans
  (teaching_assignment_id, organization_id, school_id);
create index lesson_plans_curriculum_idx on public.lesson_plans
  (curriculum_item_id, organization_id, school_id) where curriculum_item_id is not null;
create index lesson_deliveries_scope_idx on public.lesson_deliveries
  (organization_id, school_id, session_id, delivered_on, status);
create index lesson_deliveries_assignment_idx on public.lesson_deliveries
  (teaching_assignment_id, organization_id, school_id);
create index lesson_deliveries_plan_idx on public.lesson_deliveries
  (lesson_plan_id, organization_id, school_id) where lesson_plan_id is not null;
create index lesson_deliveries_curriculum_idx on public.lesson_deliveries
  (curriculum_item_id, organization_id, school_id) where curriculum_item_id is not null;

create or replace function private.validate_lesson_scope()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  activity_date date;
begin
  activity_date := case when tg_table_name = 'lesson_plans' then new.lesson_date else new.delivered_on end;
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
  if tg_table_name = 'lesson_deliveries' and new.lesson_plan_id is not null and not exists (
    select 1 from public.lesson_plans plan
    where plan.id = new.lesson_plan_id
      and plan.organization_id = new.organization_id
      and plan.school_id = new.school_id
      and plan.session_id = new.session_id
      and plan.teaching_assignment_id = new.teaching_assignment_id
  ) then
    raise exception 'Lesson plan is outside the delivery scope' using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function private.authorize_lesson_plan_review()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status in ('approved', 'rejected') and old.status is distinct from new.status then
    if not public.can_access_teaching_management(
      new.organization_id, new.school_id, 'academics.lesson_plans.approve'
    ) then
      raise exception 'Lesson plan review is not authorized' using errcode = '42501';
    end if;
    new.reviewed_at := now();
    new.reviewed_by := auth.uid();
  elsif new.status not in ('approved', 'rejected') then
    new.reviewed_at := null;
    new.reviewed_by := null;
    new.review_comment := null;
  end if;
  if new.status = 'submitted' and old.status is distinct from new.status then
    new.submitted_at := now();
  elsif new.status = 'draft' then
    new.submitted_at := null;
  end if;
  return new;
end;
$$;

create trigger validate_lesson_plan_scope before insert or update on public.lesson_plans
for each row execute function private.validate_lesson_scope();
create trigger authorize_lesson_plan_review before update on public.lesson_plans
for each row execute function private.authorize_lesson_plan_review();
create trigger set_lesson_plans_updated_at before update on public.lesson_plans
for each row execute function private.set_updated_at();
create trigger audit_lesson_plans after insert or update or delete on public.lesson_plans
for each row execute function private.capture_audit_event();
create trigger validate_lesson_delivery_scope before insert or update on public.lesson_deliveries
for each row execute function private.validate_lesson_scope();
create trigger set_lesson_deliveries_updated_at before update on public.lesson_deliveries
for each row execute function private.set_updated_at();
create trigger audit_lesson_deliveries after insert or update or delete on public.lesson_deliveries
for each row execute function private.capture_audit_event();

alter table public.lesson_plans enable row level security;
alter table public.lesson_deliveries enable row level security;

create policy lesson_plans_select on public.lesson_plans for select to authenticated
using (
  public.can_access_teaching_management(organization_id, school_id, 'academics.lesson_plans.manage')
  or public.can_access_teaching_management(organization_id, school_id, 'academics.lesson_plans.approve')
);
create policy lesson_plans_insert on public.lesson_plans for insert to authenticated
with check (
  created_by = (select auth.uid()) and updated_by = (select auth.uid())
  and public.can_access_teaching_management(organization_id, school_id, 'academics.lesson_plans.manage')
);
create policy lesson_plans_update on public.lesson_plans for update to authenticated
using (
  public.can_access_teaching_management(organization_id, school_id, 'academics.lesson_plans.manage')
  or public.can_access_teaching_management(organization_id, school_id, 'academics.lesson_plans.approve')
)
with check (
  updated_by = (select auth.uid()) and (
    public.can_access_teaching_management(organization_id, school_id, 'academics.lesson_plans.manage')
    or public.can_access_teaching_management(organization_id, school_id, 'academics.lesson_plans.approve')
  )
);
create policy lesson_deliveries_select on public.lesson_deliveries for select to authenticated
using (
  public.can_access_teaching_management(organization_id, school_id, 'academics.lesson_delivery.record')
  or public.can_access_teaching_management(organization_id, school_id, 'academics.curriculum.view')
);
create policy lesson_deliveries_insert on public.lesson_deliveries for insert to authenticated
with check (
  recorded_by = (select auth.uid()) and updated_by = (select auth.uid())
  and public.can_access_teaching_management(organization_id, school_id, 'academics.lesson_delivery.record')
);
create policy lesson_deliveries_update on public.lesson_deliveries for update to authenticated
using (public.can_access_teaching_management(
  organization_id, school_id, 'academics.lesson_delivery.record'))
with check (
  updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.lesson_delivery.record')
);

revoke all on public.lesson_plans, public.lesson_deliveries from anon, authenticated;
grant select on public.lesson_plans, public.lesson_deliveries to authenticated;
grant insert (
  organization_id, school_id, session_id, academic_period_id, teaching_assignment_id,
  curriculum_item_id, subject_id, class_level_id, class_arm_id, lesson_date, topic,
  objectives, content_outline, teaching_resources, status, created_by, updated_by
) on public.lesson_plans to authenticated;
grant update (
  academic_period_id, curriculum_item_id, lesson_date, topic, objectives, content_outline,
  teaching_resources, status, review_comment, updated_by, updated_at
) on public.lesson_plans to authenticated;
grant insert (
  organization_id, school_id, session_id, academic_period_id, teaching_assignment_id,
  lesson_plan_id, curriculum_item_id, subject_id, class_level_id, class_arm_id,
  delivered_on, topic, coverage_notes, classwork, homework, reflection, status,
  recorded_by, updated_by
) on public.lesson_deliveries to authenticated;
grant update (
  academic_period_id, lesson_plan_id, curriculum_item_id, delivered_on, topic,
  coverage_notes, classwork, homework, reflection, status, updated_by, updated_at
) on public.lesson_deliveries to authenticated;

comment on table public.lesson_plans is
  'Optional lesson plans scoped to an authorized subject teaching assignment.';
comment on table public.lesson_deliveries is
  'Lesson-delivery evidence recorded independently of optional lesson plans.';
