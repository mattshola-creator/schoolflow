-- M3 Academic Foundation. Academic configuration is intrinsically school-scoped.
create extension if not exists btree_gist with schema extensions;

create type public.academic_session_status as enum ('planned', 'current', 'closed', 'archived');
create type public.academic_period_status as enum ('planned', 'current', 'closed', 'archived');
create type public.academic_lock_scope as enum ('school_setup', 'session', 'period');
create type public.subject_classification as enum ('core', 'elective');

create table public.school_academic_settings (
  school_id uuid primary key,
  organization_id uuid not null,
  period_label text not null default 'Term' check (char_length(trim(period_label)) between 2 and 40),
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (school_id, organization_id)
);

create table public.academic_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  name text not null check (char_length(trim(name)) between 3 and 40),
  start_date date not null,
  end_date date not null,
  status public.academic_session_status not null default 'planned',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date > start_date),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create unique index academic_sessions_name_school_idx
  on public.academic_sessions (school_id, lower(name));
create unique index academic_sessions_one_current_idx
  on public.academic_sessions (school_id) where status = 'current';
alter table public.academic_sessions add constraint academic_sessions_no_overlap
  exclude using gist (school_id with =, daterange(start_date, end_date, '[]') with &&)
  where (status <> 'archived');

create table public.academic_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  name text not null check (char_length(trim(name)) between 2 and 60),
  sequence smallint not null check (sequence between 1 and 24),
  start_date date not null,
  end_date date not null,
  status public.academic_period_status not null default 'planned',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  foreign key (session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (id, session_id, organization_id, school_id),
  unique (session_id, sequence)
);

create unique index academic_periods_name_session_idx
  on public.academic_periods (session_id, lower(name));
create unique index academic_periods_one_current_school_idx
  on public.academic_periods (school_id) where status = 'current';
create index academic_periods_school_session_idx
  on public.academic_periods (organization_id, school_id, session_id, sequence);
alter table public.academic_periods add constraint academic_periods_no_overlap
  exclude using gist (session_id with =, daterange(start_date, end_date, '[]') with &&)
  where (status <> 'archived');

create table public.academic_sections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  name text not null check (char_length(trim(name)) between 2 and 80),
  code text check (code is null or code ~ '^[A-Z0-9][A-Z0-9_-]{0,15}$'),
  sort_order smallint not null default 1 check (sort_order between 1 and 999),
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create unique index academic_sections_name_school_idx
  on public.academic_sections (school_id, lower(name));
create unique index academic_sections_code_school_idx
  on public.academic_sections (school_id, code) where code is not null;
create index academic_sections_order_idx
  on public.academic_sections (organization_id, school_id, status, sort_order);

create table public.class_levels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  section_id uuid,
  name text not null check (char_length(trim(name)) between 1 and 80),
  code text check (code is null or code ~ '^[A-Z0-9][A-Z0-9_-]{0,15}$'),
  sort_order smallint not null check (sort_order between 1 and 999),
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (section_id, organization_id, school_id)
    references public.academic_sections(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create unique index class_levels_name_school_idx
  on public.class_levels (school_id, lower(name));
create unique index class_levels_code_school_idx
  on public.class_levels (school_id, code) where code is not null;
create unique index class_levels_order_school_idx
  on public.class_levels (school_id, sort_order) where status <> 'archived';
create index class_levels_school_status_idx
  on public.class_levels (organization_id, school_id, status, sort_order);

create table public.class_arms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  class_level_id uuid not null,
  name text not null check (char_length(trim(name)) between 1 and 80),
  code text check (code is null or code ~ '^[A-Z0-9][A-Z0-9_-]{0,15}$'),
  sort_order smallint not null default 1 check (sort_order between 1 and 999),
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create unique index class_arms_name_level_idx
  on public.class_arms (class_level_id, lower(name));
create unique index class_arms_code_level_idx
  on public.class_arms (class_level_id, code) where code is not null;
create index class_arms_level_status_idx
  on public.class_arms (organization_id, school_id, class_level_id, status, sort_order);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  name text not null check (char_length(trim(name)) between 2 and 120),
  code text check (code is null or code ~ '^[A-Z0-9][A-Z0-9_-]{0,23}$'),
  description text check (description is null or char_length(trim(description)) between 2 and 500),
  sort_order smallint not null default 1 check (sort_order between 1 and 999),
  status public.lifecycle_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id)
);

create unique index subjects_name_school_idx on public.subjects (school_id, lower(name));
create unique index subjects_code_school_idx on public.subjects (school_id, code) where code is not null;
create index subjects_school_status_idx on public.subjects (organization_id, school_id, status, sort_order);

create table public.subject_level_applicability (
  organization_id uuid not null,
  school_id uuid not null,
  subject_id uuid not null,
  class_level_id uuid not null,
  classification public.subject_classification not null default 'core',
  sort_order smallint not null default 1 check (sort_order between 1 and 999),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (subject_id, class_level_id),
  foreign key (subject_id, organization_id, school_id)
    references public.subjects(id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict
);

create index subject_applicability_level_idx
  on public.subject_level_applicability (organization_id, school_id, class_level_id, classification, sort_order);

create table public.academic_locks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  scope public.academic_lock_scope not null,
  session_id uuid,
  period_id uuid,
  reason text not null check (char_length(trim(reason)) between 3 and 500),
  locked_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  locked_at timestamptz not null default now(),
  unlocked_by uuid references auth.users(id) on delete restrict,
  unlocked_at timestamptz,
  unlock_reason text check (unlock_reason is null or char_length(trim(unlock_reason)) between 3 and 500),
  check (
    (scope = 'school_setup' and session_id is null and period_id is null) or
    (scope = 'session' and session_id is not null and period_id is null) or
    (scope = 'period' and session_id is not null and period_id is not null)
  ),
  check ((unlocked_at is null and unlocked_by is null and unlock_reason is null) or
    (unlocked_at is not null and unlocked_by is not null and unlock_reason is not null)),
  check (unlocked_at is null or unlocked_at >= locked_at),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (period_id, session_id, organization_id, school_id)
    references public.academic_periods(id, session_id, organization_id, school_id) on delete restrict
);

create unique index academic_locks_one_active_school_setup_idx
  on public.academic_locks (school_id, scope) where scope = 'school_setup' and unlocked_at is null;
create unique index academic_locks_one_active_session_idx
  on public.academic_locks (session_id, scope) where scope = 'session' and unlocked_at is null;
create unique index academic_locks_one_active_period_idx
  on public.academic_locks (period_id, scope) where scope = 'period' and unlocked_at is null;
create index academic_locks_school_active_idx
  on public.academic_locks (organization_id, school_id, scope, locked_at) where unlocked_at is null;

insert into public.product_features (module_id, key, name, description)
select id, 'academics.academic_setup', 'Academic setup', 'School academic structure and calendar configuration'
from public.product_modules where key = 'academics'
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('academics.setup.view', 'View school academic setup'),
  ('academics.sessions.manage', 'Manage academic sessions'),
  ('academics.periods.manage', 'Manage academic periods'),
  ('academics.structure.manage', 'Manage sections, class levels and class arms'),
  ('academics.subjects.manage', 'Manage subjects and level applicability'),
  ('academics.locks.manage', 'Apply and release academic locks')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r cross join public.permissions p
where r.key = 'organization_owner'
  and p.key like 'academics.%'
on conflict do nothing;

create or replace function public.has_module_entitlement(target_organization_id uuid, module_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_org_membership(target_organization_id) and exists (
    select 1
    from public.organization_plans op
    join public.plan_module_entitlements pme on pme.plan_id = op.plan_id and pme.enabled
    join public.product_modules pm on pm.id = pme.module_id and pm.is_active
    where op.organization_id = target_organization_id
      and pm.key = module_key
      and op.status in ('trialing', 'active')
      and op.starts_at <= now()
      and (op.ends_at is null or op.ends_at > now())
  );
$$;

create or replace function public.is_feature_enabled(target_organization_id uuid, feature_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_org_membership(target_organization_id) and exists (
    select 1
    from public.product_features pf
    join public.product_modules pm on pm.id = pf.module_id and pm.is_active
    left join public.organization_feature_flags off
      on off.organization_id = target_organization_id and off.feature_id = pf.id
    where pf.key = feature_key and pf.is_active
      and coalesce(off.enabled, pf.default_enabled)
  );
$$;

create or replace function public.can_access_academic_setup(
  target_organization_id uuid,
  target_school_id uuid,
  permission_key text
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_school_membership(target_organization_id, target_school_id)
    and public.has_permission(target_organization_id, target_school_id, permission_key)
    and public.has_module_entitlement(target_organization_id, 'academics')
    and public.is_feature_enabled(target_organization_id, 'academics.academic_setup');
$$;

revoke all on function public.has_module_entitlement(uuid, text) from public, anon;
revoke all on function public.is_feature_enabled(uuid, text) from public, anon;
revoke all on function public.can_access_academic_setup(uuid, uuid, text) from public, anon;
grant execute on function public.has_module_entitlement(uuid, text) to authenticated;
grant execute on function public.is_feature_enabled(uuid, text) to authenticated;
grant execute on function public.can_access_academic_setup(uuid, uuid, text) to authenticated;

create or replace function private.validate_academic_period()
returns trigger
language plpgsql
set search_path = ''
as $$
declare parent_session public.academic_sessions%rowtype;
begin
  select * into parent_session from public.academic_sessions where id = new.session_id;
  if not found or parent_session.organization_id <> new.organization_id or parent_session.school_id <> new.school_id then
    raise exception 'Academic period context is invalid' using errcode = '23514';
  end if;
  if new.start_date < parent_session.start_date or new.end_date > parent_session.end_date then
    raise exception 'Academic period dates must fall within the session' using errcode = '23514';
  end if;
  if new.status = 'current' and parent_session.status <> 'current' then
    raise exception 'A current period must belong to the current session' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger validate_academic_period_before_write
before insert or update on public.academic_periods
for each row execute function private.validate_academic_period();

create or replace function private.assert_academic_mutation_unlocked()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  target_organization uuid := (row_data ->> 'organization_id')::uuid;
  target_school uuid := (row_data ->> 'school_id')::uuid;
  target_session uuid;
  target_period uuid;
begin
  if tg_table_name = 'academic_sessions' then
    target_session := (row_data ->> 'id')::uuid;
  elsif tg_table_name = 'academic_periods' then
    target_session := (row_data ->> 'session_id')::uuid;
    target_period := (row_data ->> 'id')::uuid;
  end if;

  if exists (
    select 1 from public.academic_locks l
    where l.organization_id = target_organization
      and l.school_id = target_school
      and l.unlocked_at is null
      and (
        l.scope = 'school_setup'
        or (l.scope = 'session' and l.session_id = target_session)
        or (l.scope = 'period' and l.period_id = target_period)
      )
  ) then
    raise exception 'Academic configuration is locked' using errcode = '55000';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'school_academic_settings','academic_sessions','academic_periods','academic_sections',
    'class_levels','class_arms','subjects','subject_level_applicability'
  ] loop
    execute format(
      'create trigger enforce_%I_lock before insert or update or delete on public.%I for each row execute function private.assert_academic_mutation_unlocked()',
      table_name, table_name
    );
  end loop;
end $$;

create or replace function public.set_current_academic_session(target_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare target public.academic_sessions%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select * into target from public.academic_sessions where id = target_session_id for update;
  if not found or not public.can_access_academic_setup(target.organization_id, target.school_id, 'academics.sessions.manage') then
    raise exception 'Academic session is unavailable' using errcode = '42501';
  end if;
  if target.status in ('closed', 'archived') then raise exception 'Closed sessions cannot become current'; end if;
  update public.academic_sessions set status = 'planned', updated_by = (select auth.uid())
    where school_id = target.school_id and status = 'current' and id <> target.id;
  update public.academic_sessions set status = 'current', updated_by = (select auth.uid()) where id = target.id;
end;
$$;

create or replace function public.set_current_academic_period(target_period_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare target public.academic_periods%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select * into target from public.academic_periods where id = target_period_id for update;
  if not found or not public.can_access_academic_setup(target.organization_id, target.school_id, 'academics.periods.manage') then
    raise exception 'Academic period is unavailable' using errcode = '42501';
  end if;
  if target.status in ('closed', 'archived') then raise exception 'Closed periods cannot become current'; end if;
  if not exists (select 1 from public.academic_sessions s where s.id = target.session_id and s.status = 'current') then
    raise exception 'A current period must belong to the current session';
  end if;
  update public.academic_periods set status = 'planned', updated_by = (select auth.uid())
    where school_id = target.school_id and status = 'current' and id <> target.id;
  update public.academic_periods set status = 'current', updated_by = (select auth.uid()) where id = target.id;
end;
$$;

revoke all on function public.set_current_academic_session(uuid) from public, anon;
revoke all on function public.set_current_academic_period(uuid) from public, anon;
grant execute on function public.set_current_academic_session(uuid) to authenticated;
grant execute on function public.set_current_academic_period(uuid) to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'school_academic_settings','academic_sessions','academic_periods','academic_sections',
    'class_levels','class_arms','subjects'
  ] loop
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      table_name, table_name
    );
  end loop;
end $$;

alter table public.school_academic_settings enable row level security;
alter table public.academic_sessions enable row level security;
alter table public.academic_periods enable row level security;
alter table public.academic_sections enable row level security;
alter table public.class_levels enable row level security;
alter table public.class_arms enable row level security;
alter table public.subjects enable row level security;
alter table public.subject_level_applicability enable row level security;
alter table public.academic_locks enable row level security;

create policy academic_settings_select on public.school_academic_settings for select to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.setup.view'));
create policy academic_settings_manage on public.school_academic_settings for all to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.structure.manage'))
  with check (public.can_access_academic_setup(organization_id, school_id, 'academics.structure.manage'));

create policy academic_sessions_select on public.academic_sessions for select to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.setup.view'));
create policy academic_sessions_manage on public.academic_sessions for all to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.sessions.manage'))
  with check (public.can_access_academic_setup(organization_id, school_id, 'academics.sessions.manage'));

create policy academic_periods_select on public.academic_periods for select to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.setup.view'));
create policy academic_periods_manage on public.academic_periods for all to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.periods.manage'))
  with check (public.can_access_academic_setup(organization_id, school_id, 'academics.periods.manage'));

do $$
declare table_name text;
begin
  foreach table_name in array array['academic_sections','class_levels','class_arms'] loop
    execute format('create policy %I_select on public.%I for select to authenticated using (public.can_access_academic_setup(organization_id, school_id, ''academics.setup.view''))', table_name, table_name);
    execute format('create policy %I_manage on public.%I for all to authenticated using (public.can_access_academic_setup(organization_id, school_id, ''academics.structure.manage'')) with check (public.can_access_academic_setup(organization_id, school_id, ''academics.structure.manage''))', table_name, table_name);
  end loop;
end $$;

create policy subjects_select on public.subjects for select to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.setup.view'));
create policy subjects_manage on public.subjects for all to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.subjects.manage'))
  with check (public.can_access_academic_setup(organization_id, school_id, 'academics.subjects.manage'));
create policy subject_level_applicability_select on public.subject_level_applicability for select to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.setup.view'));
create policy subject_level_applicability_manage on public.subject_level_applicability for all to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.subjects.manage'))
  with check (public.can_access_academic_setup(organization_id, school_id, 'academics.subjects.manage'));

create policy academic_locks_select on public.academic_locks for select to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.setup.view'));
create policy academic_locks_insert on public.academic_locks for insert to authenticated
  with check (
    locked_by = (select auth.uid())
    and unlocked_at is null
    and public.can_access_academic_setup(organization_id, school_id, 'academics.locks.manage')
  );
create policy academic_locks_update on public.academic_locks for update to authenticated
  using (public.can_access_academic_setup(organization_id, school_id, 'academics.locks.manage'))
  with check (
    public.can_access_academic_setup(organization_id, school_id, 'academics.locks.manage')
    and unlocked_by = (select auth.uid())
    and unlocked_at is not null
  );

grant select, insert, update, delete on public.school_academic_settings, public.academic_sessions,
  public.academic_periods, public.academic_sections, public.class_levels, public.class_arms,
  public.subjects, public.subject_level_applicability to authenticated;
grant select, insert, update on public.academic_locks to authenticated;
revoke all on public.school_academic_settings, public.academic_sessions, public.academic_periods,
  public.academic_sections, public.class_levels, public.class_arms, public.subjects,
  public.subject_level_applicability, public.academic_locks from anon;

revoke all on function private.validate_academic_period() from public, anon, authenticated;
revoke all on function private.assert_academic_mutation_unlocked() from public, anon, authenticated;
