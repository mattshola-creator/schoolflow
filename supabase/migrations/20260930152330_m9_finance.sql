-- M9 Finance foundation: school policy, fee catalogue and effective-dated fee structures.
-- Authoritative money is NUMERIC(14,2), initially constrained to NGN per school.

create type public.finance_record_status as enum ('draft', 'active', 'inactive', 'archived');
create type public.fee_frequency as enum ('one_time', 'term', 'session');

insert into public.product_features (module_id, key, name, description, default_enabled)
select id, v.key, v.name, v.description, false
from public.product_modules m
cross join (values
  ('finance.fee_management', 'Fee management', 'Fee catalogue, structures and billing policy'),
  ('finance.billing', 'Student billing', 'Student charges, discounts and adjustments'),
  ('finance.collections', 'Collections', 'Manual payments, verification, allocation and receipts'),
  ('finance.expenses', 'Expenses', 'Expense, advance and petty-cash controls'),
  ('finance.cashier_control', 'Cashier control', 'Cashier close, handover and reconciliation'),
  ('finance.reporting', 'Finance reporting', 'Scoped operational finance reports')
) as v(key, name, description)
where m.key = 'finance'
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('finance.configure', 'Configure school finance and fees'),
  ('finance.billing.view', 'View student billing'),
  ('finance.billing.manage', 'Generate charges and authorized adjustments'),
  ('finance.payments.view', 'View payments, allocations and receipts'),
  ('finance.payments.record', 'Record manual payments'),
  ('finance.payments.verify', 'Verify or reject recorded payments'),
  ('finance.payments.allocate', 'Allocate verified payments'),
  ('finance.payments.correct', 'Perform controlled payment corrections'),
  ('finance.expenses.view', 'View school expenses'),
  ('finance.expenses.manage', 'Create and submit expenses'),
  ('finance.expenses.approve', 'Approve or reject expenses'),
  ('finance.cashier.manage', 'Operate cashier sessions and handovers'),
  ('finance.reconcile', 'Reconcile deposits and bank receipts'),
  ('finance.reports.view', 'View scoped finance reports')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r cross join public.permissions p
where r.key = 'organization_owner' and p.key like 'finance.%'
on conflict do nothing;

create or replace function public.can_access_finance(
  target_organization_id uuid,
  target_school_id uuid,
  permission_key text,
  feature_key text
) returns boolean
language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and feature_key in (
      'finance.fee_management', 'finance.billing', 'finance.collections',
      'finance.expenses', 'finance.cashier_control', 'finance.reporting')
    and public.has_school_membership(target_organization_id, target_school_id)
    and public.has_permission(target_organization_id, target_school_id, permission_key)
    and public.has_module_entitlement(target_organization_id, 'finance')
    and public.is_feature_enabled(target_organization_id, feature_key);
$$;

create table public.finance_settings (
  school_id uuid primary key,
  organization_id uuid not null,
  currency_code text not null default 'NGN' check (currency_code ~ '^[A-Z]{3}$'),
  receipt_prefix text not null default 'RCT' check (receipt_prefix ~ '^[A-Z0-9-]{2,12}$'),
  receipt_next_number bigint not null default 1 check (receipt_next_number > 0),
  allow_cross_student_allocation boolean not null default false,
  require_payment_verification boolean not null default true,
  payment_recorder_may_verify boolean not null default false,
  billing_locked_through date,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (school_id, organization_id)
);

create table public.fee_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,19}$'),
  name text not null check (char_length(trim(name)) between 2 and 120),
  description text check (description is null or char_length(trim(description)) <= 500),
  frequency public.fee_frequency not null default 'term',
  status public.finance_record_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (school_id, code)
);

create table public.student_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,19}$'),
  name text not null check (char_length(trim(name)) between 2 and 120),
  status public.finance_record_status not null default 'active',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (school_id, code)
);

create table public.fee_structures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  session_id uuid not null,
  period_id uuid,
  class_level_id uuid,
  student_category_id uuid,
  name text not null check (char_length(trim(name)) between 3 and 160),
  version integer not null default 1 check (version > 0),
  currency_code text not null default 'NGN' check (currency_code ~ '^[A-Z]{3}$'),
  effective_from date not null,
  effective_to date,
  status public.finance_record_status not null default 'draft',
  activated_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from),
  check ((status = 'active' and activated_at is not null) or status <> 'active'),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id) references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (period_id, organization_id, school_id) references public.academic_periods(id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id) references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (student_category_id, organization_id, school_id) references public.student_categories(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (school_id, name, version)
);

create table public.fee_structure_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  fee_structure_id uuid not null,
  fee_category_id uuid not null,
  amount numeric(14,2) not null check (amount >= 0),
  due_date date,
  installment_sequence smallint not null default 1 check (installment_sequence between 1 and 24),
  incentive_amount numeric(14,2) not null default 0 check (incentive_amount >= 0 and incentive_amount <= amount),
  penalty_amount numeric(14,2) not null default 0 check (penalty_amount >= 0),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (fee_structure_id, organization_id, school_id) references public.fee_structures(id, organization_id, school_id) on delete restrict,
  foreign key (fee_category_id, organization_id, school_id) references public.fee_categories(id, organization_id, school_id) on delete restrict,
  unique (fee_structure_id, fee_category_id, installment_sequence)
);

create index fee_categories_scope_idx on public.fee_categories (organization_id, school_id, status, name);
create index fee_structures_scope_idx on public.fee_structures (organization_id, school_id, session_id, period_id, status);
create index fee_structures_applicability_idx on public.fee_structures (school_id, class_level_id, student_category_id, effective_from, effective_to);
create index fee_structure_items_structure_idx on public.fee_structure_items (fee_structure_id, due_date);

create or replace function private.validate_fee_structure()
returns trigger language plpgsql set search_path = '' as $$
declare target_session public.academic_sessions%rowtype;
begin
  select * into target_session from public.academic_sessions where id = new.session_id;
  if new.effective_from < target_session.start_date
    or coalesce(new.effective_to, target_session.end_date) > target_session.end_date then
    raise exception 'Fee structure effective dates must fall within the academic session' using errcode = '23514';
  end if;
  if new.period_id is not null and not exists (
    select 1 from public.academic_periods p where p.id = new.period_id and p.session_id = new.session_id
  ) then
    raise exception 'Fee structure period must belong to its academic session' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger validate_fee_structure_before_write before insert or update on public.fee_structures
for each row execute function private.validate_fee_structure();

do $$ declare table_name text; begin
  foreach table_name in array array['finance_settings','fee_categories','student_categories','fee_structures'] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name, table_name);
  end loop;
  foreach table_name in array array['finance_settings','fee_categories','student_categories','fee_structures','fee_structure_items'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.capture_audit_event()', table_name, table_name);
  end loop;
end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['finance_settings','fee_categories','student_categories','fee_structures','fee_structure_items'] loop
    execute format('create policy %I_select on public.%I for select to authenticated using (public.can_access_finance(organization_id, school_id, ''finance.view'', ''finance.fee_management''))', table_name, table_name);
    execute format('create policy %I_insert on public.%I for insert to authenticated with check (created_by = (select auth.uid()) and public.can_access_finance(organization_id, school_id, ''finance.configure'', ''finance.fee_management''))', table_name, table_name);
  end loop;
end $$;

create policy finance_settings_update on public.finance_settings for update to authenticated
using (public.can_access_finance(organization_id, school_id, 'finance.configure', 'finance.fee_management'))
with check (updated_by = (select auth.uid()) and public.can_access_finance(organization_id, school_id, 'finance.configure', 'finance.fee_management'));
create policy fee_categories_update on public.fee_categories for update to authenticated
using (public.can_access_finance(organization_id, school_id, 'finance.configure', 'finance.fee_management'))
with check (updated_by = (select auth.uid()) and public.can_access_finance(organization_id, school_id, 'finance.configure', 'finance.fee_management'));
create policy student_categories_update on public.student_categories for update to authenticated
using (public.can_access_finance(organization_id, school_id, 'finance.configure', 'finance.fee_management'))
with check (updated_by = (select auth.uid()) and public.can_access_finance(organization_id, school_id, 'finance.configure', 'finance.fee_management'));
create policy fee_structures_update on public.fee_structures for update to authenticated
using (status = 'draft' and public.can_access_finance(organization_id, school_id, 'finance.configure', 'finance.fee_management'))
with check (updated_by = (select auth.uid()) and public.can_access_finance(organization_id, school_id, 'finance.configure', 'finance.fee_management'));

revoke all on public.finance_settings, public.fee_categories, public.student_categories,
  public.fee_structures, public.fee_structure_items from anon, authenticated;
grant select, insert on public.finance_settings, public.fee_categories, public.student_categories,
  public.fee_structures, public.fee_structure_items to authenticated;
grant update on public.finance_settings, public.fee_categories, public.student_categories, public.fee_structures to authenticated;

revoke all on function public.can_access_finance(uuid, uuid, text, text) from public, anon;
grant execute on function public.can_access_finance(uuid, uuid, text, text) to authenticated;
revoke all on function private.validate_fee_structure() from public, anon, authenticated;

comment on table public.fee_structures is 'Effective-dated, school-scoped billing policy; activated versions are immutable through ordinary RLS.';
comment on table public.fee_structure_items is 'Exact fee amounts and due dates snapshotted into student charges by billing operations.';
