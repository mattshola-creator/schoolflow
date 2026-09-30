-- M8-E6 Standalone homework workflow foundation.

create type public.homework_status as enum (
  'draft', 'published', 'closed', 'cancelled'
);

create table public.homework_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  academic_period_id uuid,
  teaching_assignment_id uuid not null,
  lesson_delivery_id uuid,
  curriculum_item_id uuid,
  subject_id uuid not null,
  class_level_id uuid not null,
  class_arm_id uuid,
  title text not null check (char_length(trim(title)) between 2 and 160),
  instructions text not null check (char_length(trim(instructions)) between 2 and 6000),
  assigned_on date not null,
  due_on date not null,
  status public.homework_status not null default 'draft',
  published_at timestamptz,
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
  foreign key (lesson_delivery_id, organization_id, school_id)
    references public.lesson_deliveries(id, organization_id, school_id) on delete restrict,
  foreign key (curriculum_item_id, organization_id, school_id)
    references public.curriculum_items(id, organization_id, school_id) on delete restrict,
  foreign key (subject_id, organization_id, school_id)
    references public.subjects(id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (class_arm_id, organization_id, school_id)
    references public.class_arms(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (teaching_assignment_id, assigned_on, title),
  check (due_on >= assigned_on),
  check (
    (status = 'published' and published_at is not null)
    or status <> 'published'
  )
);

create index homework_assignments_scope_idx on public.homework_assignments
  (organization_id, school_id, session_id, due_on, status);
create index homework_assignments_assignment_idx on public.homework_assignments
  (teaching_assignment_id, organization_id, school_id);
create index homework_assignments_period_idx on public.homework_assignments
  (academic_period_id, organization_id, school_id) where academic_period_id is not null;
create index homework_assignments_delivery_idx on public.homework_assignments
  (lesson_delivery_id, organization_id, school_id) where lesson_delivery_id is not null;
create index homework_assignments_curriculum_idx on public.homework_assignments
  (curriculum_item_id, organization_id, school_id) where curriculum_item_id is not null;
create index homework_assignments_created_by_idx on public.homework_assignments (created_by);
create index homework_assignments_updated_by_idx on public.homework_assignments (updated_by);

create or replace function private.validate_homework_scope()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.academic_sessions session
    where session.id = new.session_id
      and session.organization_id = new.organization_id
      and session.school_id = new.school_id
      and new.assigned_on between session.start_date and session.end_date
      and new.due_on between session.start_date and session.end_date
  ) then
    raise exception 'Homework dates are outside the academic session' using errcode = '23514';
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
    raise exception 'Homework is outside the subject teaching assignment scope' using errcode = '23514';
  end if;
  if new.academic_period_id is not null and not exists (
    select 1 from public.academic_periods period
    where period.id = new.academic_period_id
      and period.session_id = new.session_id
      and period.organization_id = new.organization_id
      and period.school_id = new.school_id
      and new.assigned_on between period.start_date and period.end_date
      and new.due_on between period.start_date and period.end_date
  ) then
    raise exception 'Homework dates are outside the selected academic period' using errcode = '23514';
  end if;
  if new.lesson_delivery_id is not null and not exists (
    select 1 from public.lesson_deliveries delivery
    where delivery.id = new.lesson_delivery_id
      and delivery.organization_id = new.organization_id
      and delivery.school_id = new.school_id
      and delivery.session_id = new.session_id
      and delivery.teaching_assignment_id = new.teaching_assignment_id
  ) then
    raise exception 'Lesson delivery is outside the homework scope' using errcode = '23514';
  end if;
  if new.curriculum_item_id is not null and not exists (
    select 1 from public.curriculum_items item
    where item.id = new.curriculum_item_id
      and item.organization_id = new.organization_id
      and item.school_id = new.school_id
      and item.session_id = new.session_id
      and item.teaching_assignment_id = new.teaching_assignment_id
  ) then
    raise exception 'Curriculum item is outside the homework scope' using errcode = '23514';
  end if;
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    new.published_at := now();
  elsif new.status = 'draft' then
    new.published_at := null;
  end if;
  return new;
end;
$$;

create trigger validate_homework_assignment_scope before insert or update
on public.homework_assignments for each row execute function private.validate_homework_scope();
create trigger set_homework_assignments_updated_at before update
on public.homework_assignments for each row execute function private.set_updated_at();
create trigger audit_homework_assignments after insert or update or delete
on public.homework_assignments for each row execute function private.capture_audit_event();

alter table public.homework_assignments enable row level security;

create policy homework_assignments_select on public.homework_assignments
for select to authenticated using (
  public.can_access_teaching_management(
    organization_id, school_id, 'academics.homework.manage'
  )
);
create policy homework_assignments_insert on public.homework_assignments
for insert to authenticated with check (
  created_by = (select auth.uid()) and updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.homework.manage'
  )
);
create policy homework_assignments_update on public.homework_assignments
for update to authenticated using (
  public.can_access_teaching_management(
    organization_id, school_id, 'academics.homework.manage'
  )
) with check (
  updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.homework.manage'
  )
);

revoke all on public.homework_assignments from anon, authenticated;
grant select on public.homework_assignments to authenticated;
grant insert (
  organization_id, school_id, session_id, academic_period_id, teaching_assignment_id,
  lesson_delivery_id, curriculum_item_id, subject_id, class_level_id, class_arm_id,
  title, instructions, assigned_on, due_on, status, created_by, updated_by
) on public.homework_assignments to authenticated;
grant update (
  academic_period_id, lesson_delivery_id, curriculum_item_id, title, instructions,
  assigned_on, due_on, status, updated_by, updated_at
) on public.homework_assignments to authenticated;

comment on table public.homework_assignments is
  'Standalone homework assigned to a class through an authorized subject teaching assignment.';
