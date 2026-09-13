create type public.subscription_status as enum ('trialing', 'active', 'suspended', 'expired');

create table public.product_modules (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z]+(?:[._][a-z]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_features (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.product_modules(id) on delete cascade,
  key text not null unique check (key ~ '^[a-z]+(?:[._][a-z]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text not null,
  default_enabled boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, module_id)
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z]+(?:_[a-z]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_module_entitlements (
  plan_id uuid not null references public.plans(id) on delete cascade,
  module_id uuid not null references public.product_modules(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (plan_id, module_id)
);

create table public.organization_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status public.subscription_status not null default 'trialing',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at),
  unique (organization_id)
);

create table public.organization_feature_flags (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  feature_id uuid not null references public.product_features(id) on delete cascade,
  enabled boolean not null,
  reason text check (reason is null or char_length(trim(reason)) between 2 and 240),
  updated_at timestamptz not null default now(),
  primary key (organization_id, feature_id)
);

create index plan_module_entitlements_module_idx on public.plan_module_entitlements(module_id, plan_id) where enabled;
create index organization_plans_status_idx on public.organization_plans(status, organization_id);
create index product_features_module_idx on public.product_features(module_id, is_active);

insert into public.product_modules (key, name, description) values
  ('foundation', 'Foundation', 'Identity, tenancy, configuration and shared platform capabilities'),
  ('admissions', 'Admissions', 'Enquiries, applications, assessments, offers and applicant lifecycle'),
  ('students', 'Students', 'Student, guardian, enrollment and lifecycle records'),
  ('staff', 'Staff', 'Employment, assignments and staff operations'),
  ('attendance', 'Attendance', 'Student and staff attendance operations'),
  ('academics', 'Academics', 'Curriculum, timetable, assessment, results and promotion'),
  ('finance', 'Finance', 'School billing, payments, expenses and reconciliation'),
  ('communication', 'Communication', 'Announcements, messages and delivery state'),
  ('reporting', 'Reporting', 'Dashboards, reports and exports');

insert into public.product_features (module_id, key, name, description)
select id, 'foundation.authorization_inspection', 'Authorization inspection', 'Shows the signed-in user their effective access state'
from public.product_modules where key = 'foundation';

insert into public.plans (key, name, description) values
  ('starter', 'Starter', 'Secure baseline plan for SchoolFlow organizations'),
  ('growth', 'Growth', 'Expanded plan for growing schools and groups'),
  ('professional', 'Professional', 'Advanced operational plan for established school groups'),
  ('enterprise', 'Enterprise', 'Configurable plan for complex multi-school organizations');

-- Commercial packaging remains configurable. The development baseline enables the
-- approved V1 modules for every plan without hard-coding plan names in feature code.
insert into public.plan_module_entitlements (plan_id, module_id, enabled)
select p.id, m.id, true from public.plans p cross join public.product_modules m;

insert into public.permissions (key, description) values
  ('admissions.view', 'View admissions records'),
  ('admissions.manage', 'Manage admissions workflows'),
  ('students.view', 'View student records'),
  ('students.manage', 'Manage student records'),
  ('staff.view', 'View staff records'),
  ('staff.manage', 'Manage staff operations'),
  ('attendance.view', 'View attendance records'),
  ('attendance.manage', 'Manage attendance records'),
  ('academics.view', 'View academic records'),
  ('academics.manage', 'Manage academic workflows'),
  ('finance.view', 'View finance records'),
  ('finance.manage', 'Manage finance operations'),
  ('finance.approve', 'Approve authorized finance operations'),
  ('communication.view', 'View communications'),
  ('communication.manage', 'Manage communications'),
  ('reporting.view', 'View reports')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r cross join public.permissions p
where r.key = 'organization_owner'
on conflict do nothing;

insert into public.organization_plans (organization_id, plan_id, status)
select o.id, p.id, 'active'
from public.organizations o cross join public.plans p
where p.key = 'starter'
on conflict (organization_id) do nothing;

create or replace function private.bootstrap_organization_plan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare starter_plan_id uuid;
begin
  select id into starter_plan_id from public.plans where key = 'starter' and is_active;
  if starter_plan_id is null then
    raise exception 'Default organization plan is unavailable';
  end if;
  insert into public.organization_plans (organization_id, plan_id, status)
  values (new.id, starter_plan_id, 'trialing');
  return new;
end;
$$;

create trigger on_organization_plan_created
after insert on public.organizations
for each row execute function private.bootstrap_organization_plan();

create or replace function public.get_my_authorization(
  target_organization_id uuid,
  target_school_id uuid default null
) returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  permission_keys jsonb;
  module_states jsonb;
  feature_states jsonb;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.has_org_membership(target_organization_id) then
    raise exception 'Context is not available' using errcode = '42501';
  end if;
  if target_school_id is not null and not public.has_school_membership(target_organization_id, target_school_id) then
    raise exception 'Context is not available' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(x.key order by x.key), '[]'::jsonb) into permission_keys
  from (
    select distinct p.key
    from public.role_assignments ra
    join public.role_permissions rp on rp.role_id = ra.role_id and rp.organization_id = ra.organization_id
    join public.permissions p on p.id = rp.permission_id
    where ra.organization_id = target_organization_id
      and ra.user_id = actor
      and ra.status = 'active'
      and ra.effective_from <= now()
      and (ra.effective_to is null or ra.effective_to > now())
      and (
        ra.scope = 'organization'
        or (target_school_id is not null and ra.scope = 'school' and ra.school_id = target_school_id)
        or (target_school_id is not null and ra.scope = 'management_group' and exists (
          select 1 from public.management_group_schools mgs
          where mgs.organization_id = target_organization_id
            and mgs.management_group_id = ra.management_group_id
            and mgs.school_id = target_school_id
        ))
      )
  ) x;

  select coalesce(jsonb_agg(jsonb_build_object(
    'key', m.key,
    'entitled', coalesce(pme.enabled, false) and op.status in ('trialing', 'active')
      and op.starts_at <= now() and (op.ends_at is null or op.ends_at > now()),
    'enabled', m.is_active
  ) order by m.key), '[]'::jsonb) into module_states
  from public.product_modules m
  left join public.organization_plans op on op.organization_id = target_organization_id
  left join public.plan_module_entitlements pme on pme.plan_id = op.plan_id and pme.module_id = m.id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'key', f.key,
    'module', m.key,
    'enabled', f.is_active and coalesce(off.enabled, f.default_enabled)
  ) order by f.key), '[]'::jsonb) into feature_states
  from public.product_features f
  join public.product_modules m on m.id = f.module_id
  left join public.organization_feature_flags off
    on off.organization_id = target_organization_id and off.feature_id = f.id;

  return jsonb_build_object(
    'organizationId', target_organization_id,
    'schoolId', target_school_id,
    'permissions', permission_keys,
    'modules', module_states,
    'features', feature_states
  );
end;
$$;

comment on function public.get_my_authorization(uuid, uuid) is
  'Returns only the authenticated caller effective permissions and product availability for an authorized tenant context.';

revoke all on function public.get_my_authorization(uuid, uuid) from public, anon;
grant execute on function public.get_my_authorization(uuid, uuid) to authenticated;

alter table public.product_modules enable row level security;
alter table public.product_features enable row level security;
alter table public.plans enable row level security;
alter table public.plan_module_entitlements enable row level security;
alter table public.organization_plans enable row level security;
alter table public.organization_feature_flags enable row level security;

-- Catalog and commercial state are inspected through the caller-bound RPC only.
-- Ordinary API roles receive no direct write path to platform configuration.
revoke all on public.product_modules, public.product_features, public.plans,
  public.plan_module_entitlements, public.organization_plans,
  public.organization_feature_flags from anon, authenticated;

revoke all on function private.bootstrap_organization_plan() from public, anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['product_modules','product_features','plans','organization_plans']
  loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name, table_name);
  end loop;
end $$;
