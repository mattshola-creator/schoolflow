-- M8-E2 Manual Timetable Foundation.
-- Timetable entries are created deliberately; no automatic scheduler is added.

create table public.timetable_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  weekday smallint not null check (weekday between 1 and 7),
  name text not null check (char_length(trim(name)) between 1 and 80),
  starts_at time not null,
  ends_at time not null,
  sort_order smallint not null default 0,
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (school_id, session_id, weekday, name)
);

create table public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  period_id uuid not null,
  teaching_assignment_id uuid not null,
  conflict_acknowledged boolean not null default false,
  notes text check (notes is null or char_length(trim(notes)) between 1 and 500),
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id)
    references public.schools(id, organization_id) on delete restrict,
  foreign key (period_id, organization_id, school_id)
    references public.timetable_periods(id, organization_id, school_id) on delete restrict,
  foreign key (teaching_assignment_id, organization_id, school_id)
    references public.teaching_assignments(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (period_id, teaching_assignment_id)
);

create index timetable_periods_scope_idx on public.timetable_periods
  (organization_id, school_id, session_id, weekday, sort_order);
create index timetable_entries_scope_idx on public.timetable_entries
  (organization_id, school_id, session_id, period_id, status);

create or replace function private.validate_timetable_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.timetable_periods period
    where period.id = new.period_id
      and period.organization_id = new.organization_id
      and period.school_id = new.school_id
      and period.session_id = new.session_id
      and period.status = 'active'
  ) then
    raise exception 'Timetable period is outside the active session scope'
      using errcode = '23514';
  end if;
  if not exists (
    select 1 from public.teaching_assignments assignment
    where assignment.id = new.teaching_assignment_id
      and assignment.organization_id = new.organization_id
      and assignment.school_id = new.school_id
      and assignment.session_id = new.session_id
      and assignment.status in ('planned', 'active')
  ) then
    raise exception 'Teaching assignment is outside the timetable session scope'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger validate_timetable_entry_before_write
before insert or update on public.timetable_entries
for each row execute function private.validate_timetable_entry();

create trigger set_timetable_periods_updated_at
before update on public.timetable_periods
for each row execute function private.set_updated_at();
create trigger set_timetable_entries_updated_at
before update on public.timetable_entries
for each row execute function private.set_updated_at();
create trigger audit_timetable_periods
after insert or update or delete on public.timetable_periods
for each row execute function private.capture_audit_event();
create trigger audit_timetable_entries
after insert or update or delete on public.timetable_entries
for each row execute function private.capture_audit_event();

alter table public.timetable_periods enable row level security;
alter table public.timetable_entries enable row level security;

create policy timetable_periods_select on public.timetable_periods
for select to authenticated
using (public.can_access_teaching_management(
  organization_id, school_id, 'academics.timetable.view'));
create policy timetable_periods_insert on public.timetable_periods
for insert to authenticated
with check (
  created_by = (select auth.uid()) and updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.timetable.manage'));
create policy timetable_periods_update on public.timetable_periods
for update to authenticated
using (public.can_access_teaching_management(
  organization_id, school_id, 'academics.timetable.manage'))
with check (
  updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.timetable.manage'));

create policy timetable_entries_select on public.timetable_entries
for select to authenticated
using (public.can_access_teaching_management(
  organization_id, school_id, 'academics.timetable.view'));
create policy timetable_entries_insert on public.timetable_entries
for insert to authenticated
with check (
  created_by = (select auth.uid()) and updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.timetable.manage'));
create policy timetable_entries_update on public.timetable_entries
for update to authenticated
using (public.can_access_teaching_management(
  organization_id, school_id, 'academics.timetable.manage'))
with check (
  updated_by = (select auth.uid())
  and public.can_access_teaching_management(
    organization_id, school_id, 'academics.timetable.manage'));

revoke all on public.timetable_periods, public.timetable_entries
from anon, authenticated;
grant select on public.timetable_periods, public.timetable_entries to authenticated;
grant insert (
  organization_id, school_id, session_id, weekday, name, starts_at, ends_at,
  sort_order, status, created_by, updated_by
) on public.timetable_periods to authenticated;
grant update (
  weekday, name, starts_at, ends_at, sort_order, status, updated_by, updated_at
) on public.timetable_periods to authenticated;
grant insert (
  organization_id, school_id, session_id, period_id, teaching_assignment_id,
  conflict_acknowledged, notes, status, created_by, updated_by
) on public.timetable_entries to authenticated;
grant update (
  period_id, teaching_assignment_id, conflict_acknowledged, notes, status,
  updated_by, updated_at
) on public.timetable_entries to authenticated;

comment on table public.timetable_periods is
  'School-scoped recurring timetable periods for one academic session.';
comment on table public.timetable_entries is
  'Manual timetable allocations with explicit conflict acknowledgement.';
