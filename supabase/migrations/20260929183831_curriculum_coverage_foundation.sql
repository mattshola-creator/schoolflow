-- M8-E3 Curriculum Coverage Foundation.

create type public.curriculum_item_status as enum (
  'planned', 'in_progress', 'completed', 'deferred', 'cancelled'
);

create table public.curriculum_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  academic_period_id uuid,
  teaching_assignment_id uuid not null,
  subject_id uuid not null,
  class_level_id uuid not null,
  class_arm_id uuid,
  sequence smallint not null check (sequence between 1 and 999),
  title text not null check (char_length(trim(title)) between 2 and 160),
  learning_objectives text check (
    learning_objectives is null
    or char_length(trim(learning_objectives)) between 2 and 2000
  ),
  planned_start date not null,
  planned_end date not null,
  status public.curriculum_item_status not null default 'planned',
  completed_on date,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (planned_end >= planned_start),
  check (
    (status = 'completed' and completed_on is not null)
    or (status <> 'completed' and completed_on is null)
  ),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (academic_period_id, session_id, organization_id, school_id)
    references public.academic_periods(id, session_id, organization_id, school_id)
    on delete restrict,
  foreign key (teaching_assignment_id, organization_id, school_id)
    references public.teaching_assignments(id, organization_id, school_id) on delete restrict,
  foreign key (subject_id, organization_id, school_id)
    references public.subjects(id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (class_arm_id, organization_id, school_id)
    references public.class_arms(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (
    teaching_assignment_id,
    sequence,
    planned_start
  )
);

create index curriculum_items_scope_idx on public.curriculum_items
  (organization_id, school_id, session_id, status, sequence);
create index curriculum_items_school_fk_idx on public.curriculum_items
  (school_id, organization_id);
create index curriculum_items_session_fk_idx on public.curriculum_items
  (session_id, organization_id, school_id);
create index curriculum_items_period_fk_idx on public.curriculum_items
  (academic_period_id, session_id, organization_id, school_id)
  where academic_period_id is not null;
create index curriculum_items_assignment_fk_idx on public.curriculum_items
  (teaching_assignment_id, organization_id, school_id);
create index curriculum_items_subject_fk_idx on public.curriculum_items
  (subject_id, organization_id, school_id);
create index curriculum_items_level_fk_idx on public.curriculum_items
  (class_level_id, organization_id, school_id);
create index curriculum_items_arm_fk_idx on public.curriculum_items
  (class_arm_id, organization_id, school_id)
  where class_arm_id is not null;

create or replace function private.validate_curriculum_item()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_session public.academic_sessions%rowtype;
begin
  select * into target_session
  from public.academic_sessions session
  where session.id = new.session_id
    and session.organization_id = new.organization_id
    and session.school_id = new.school_id;

  if target_session.id is null
    or new.planned_start < target_session.start_date
    or new.planned_end > target_session.end_date then
    raise exception 'Curriculum dates must fall within the academic session'
      using errcode = '23514';
  end if;
  if new.completed_on is not null and new.completed_on > target_session.end_date then
    raise exception 'Curriculum completion must fall within the academic session'
      using errcode = '23514';
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
    raise exception 'Curriculum item is outside the subject teaching assignment scope'
      using errcode = '23514';
  end if;
  if new.academic_period_id is not null and not exists (
    select 1 from public.academic_periods period
    where period.id = new.academic_period_id
      and period.session_id = new.session_id
      and period.organization_id = new.organization_id
      and period.school_id = new.school_id
      and new.planned_start >= period.start_date
      and new.planned_end <= period.end_date
  ) then
    raise exception 'Curriculum dates must fall within the selected academic period'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger validate_curriculum_item_before_write
before insert or update on public.curriculum_items
for each row execute function private.validate_curriculum_item();
create trigger set_curriculum_items_updated_at
before update on public.curriculum_items
for each row execute function private.set_updated_at();
create trigger audit_curriculum_items
after insert or update or delete on public.curriculum_items
for each row execute function private.capture_audit_event();

alter table public.curriculum_items enable row level security;

create policy curriculum_items_select on public.curriculum_items
for select to authenticated
using (public.can_access_teaching_management(
  organization_id, school_id, 'academics.curriculum.view'));
create policy curriculum_items_insert on public.curriculum_items
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.curriculum.manage'));
create policy curriculum_items_update on public.curriculum_items
for update to authenticated
using (public.can_access_teaching_management(
  organization_id, school_id, 'academics.curriculum.manage'))
with check (
  updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.curriculum.manage'));

revoke all on public.curriculum_items from anon, authenticated;
grant select on public.curriculum_items to authenticated;
grant insert (
  organization_id, school_id, session_id, academic_period_id,
  teaching_assignment_id, subject_id, class_level_id, class_arm_id,
  sequence, title, learning_objectives, planned_start, planned_end,
  status, completed_on, created_by, updated_by
) on public.curriculum_items to authenticated;
grant update (
  academic_period_id, sequence, title, learning_objectives,
  planned_start, planned_end, status, completed_on, updated_by, updated_at
) on public.curriculum_items to authenticated;

comment on table public.curriculum_items is
  'Ordered subject curriculum coverage linked to an authorized teaching assignment.';
