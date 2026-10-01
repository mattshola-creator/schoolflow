create type public.expense_status as enum ('draft', 'submitted', 'approved', 'rejected', 'paid', 'completed', 'cancelled');
create type public.expense_kind as enum ('expense', 'cash_advance', 'petty_cash');
create type public.cashier_session_status as enum ('open', 'closed', 'reviewed');
create type public.reconciliation_status as enum ('draft', 'reconciled', 'exception');

create table public.income_categories (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,19}$'), name text not null check (char_length(trim(name)) between 2 and 120),
  status public.finance_record_status not null default 'active', created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id), unique (school_id, code)
);
create table public.other_income (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null, income_category_id uuid not null,
  amount numeric(14,2) not null check (amount > 0), currency_code text not null default 'NGN', received_at timestamptz not null,
  payer_name text, reference text, notes text, recorded_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  idempotency_key uuid not null, created_at timestamptz not null default now(),
  foreign key (income_category_id, organization_id, school_id) references public.income_categories(id, organization_id, school_id) on delete restrict,
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id), unique (school_id, idempotency_key)
);
create table public.expense_categories (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,19}$'), name text not null check (char_length(trim(name)) between 2 and 120),
  status public.finance_record_status not null default 'active', created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id), unique (school_id, code)
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null, expense_category_id uuid not null,
  academic_session_id uuid, academic_period_id uuid, kind public.expense_kind not null default 'expense',
  description text not null check (char_length(trim(description)) between 3 and 1000), requested_amount numeric(14,2) not null check (requested_amount > 0),
  approved_amount numeric(14,2) check (approved_amount is null or approved_amount > 0), currency_code text not null default 'NGN',
  expense_date date not null, status public.expense_status not null default 'draft', document_id uuid,
  requested_by uuid not null default auth.uid() references auth.users(id) on delete restrict, approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz, paid_at timestamptz, completed_at timestamptz, decision_note text,
  created_at timestamptz not null default now(),
  foreign key (expense_category_id, organization_id, school_id) references public.expense_categories(id, organization_id, school_id) on delete restrict,
  foreign key (academic_session_id, organization_id, school_id) references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (academic_period_id, organization_id, school_id) references public.academic_periods(id, organization_id, school_id) on delete restrict,
  foreign key (document_id, organization_id, school_id) references public.documents(id, organization_id, school_id) on delete restrict,
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id)
);
create table public.cashier_sessions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  cashier_user_id uuid not null references auth.users(id) on delete restrict, opened_at timestamptz not null default now(),
  opening_cash numeric(14,2) not null default 0 check (opening_cash >= 0), closed_at timestamptz,
  expected_cash numeric(14,2), counted_cash numeric(14,2), variance numeric(14,2), close_note text,
  status public.cashier_session_status not null default 'open', reviewed_by uuid references auth.users(id) on delete restrict, reviewed_at timestamptz,
  created_at timestamptz not null default now(), foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id)
);
create unique index cashier_one_open_idx on public.cashier_sessions (school_id, cashier_user_id) where status = 'open';
alter table public.payments add column cashier_session_id uuid;
alter table public.payments add foreign key (cashier_session_id, organization_id, school_id) references public.cashier_sessions(id, organization_id, school_id) on delete restrict;

create table public.cash_handovers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null, cashier_session_id uuid not null,
  amount numeric(14,2) not null check (amount > 0), handed_to uuid not null references auth.users(id) on delete restrict,
  note text, handed_over_by uuid not null default auth.uid() references auth.users(id) on delete restrict, handed_over_at timestamptz not null default now(),
  foreign key (cashier_session_id, organization_id, school_id) references public.cashier_sessions(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);
create table public.reconciliation_records (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  statement_date date not null, method public.payment_method not null, expected_amount numeric(14,2) not null check (expected_amount >= 0),
  actual_amount numeric(14,2) not null check (actual_amount >= 0), variance numeric(14,2) generated always as (actual_amount - expected_amount) stored,
  reference text, note text, status public.reconciliation_status not null default 'draft',
  reconciled_by uuid references auth.users(id) on delete restrict, reconciled_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict, created_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id)
);
create table public.reconciliation_payments (
  reconciliation_id uuid not null, payment_id uuid not null, organization_id uuid not null, school_id uuid not null,
  created_at timestamptz not null default now(),
  foreign key (reconciliation_id, organization_id, school_id) references public.reconciliation_records(id, organization_id, school_id) on delete restrict,
  foreign key (payment_id, organization_id, school_id) references public.payments(id, organization_id, school_id) on delete restrict,
  primary key (reconciliation_id, payment_id), unique (payment_id)
);

create index expenses_scope_idx on public.expenses (organization_id, school_id, status, expense_date desc);
create index other_income_scope_idx on public.other_income (organization_id, school_id, received_at desc);
create index cashier_sessions_scope_idx on public.cashier_sessions (organization_id, school_id, status, opened_at desc);
create index reconciliation_scope_idx on public.reconciliation_records (organization_id, school_id, statement_date desc, status);

create or replace function public.submit_expense(target_expense_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target public.expenses%rowtype;
begin select * into target from public.expenses where id = target_expense_id for update;
if target.id is null or not public.can_access_finance(target.organization_id,target.school_id,'finance.expenses.manage','finance.expenses') then raise exception 'Not authorized' using errcode='42501'; end if;
if target.status <> 'draft' then raise exception 'Only draft expenses can be submitted' using errcode='23514'; end if;
update public.expenses set status='submitted' where id=target.id; return target.id; end $$;

create or replace function public.decide_expense(target_expense_id uuid, approve boolean, target_approved_amount numeric, target_note text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target public.expenses%rowtype;
begin select * into target from public.expenses where id=target_expense_id for update;
if target.id is null or not public.can_access_finance(target.organization_id,target.school_id,'finance.expenses.approve','finance.expenses') then raise exception 'Not authorized' using errcode='42501'; end if;
if target.status <> 'submitted' then raise exception 'Submitted expense required' using errcode='23514'; end if;
update public.expenses set status=case when approve then 'approved' else 'rejected' end,
 approved_amount=case when approve then target_approved_amount else null end, approved_by=auth.uid(), approved_at=now(), decision_note=nullif(trim(target_note),'') where id=target.id;
return target.id; end $$;

create or replace function public.open_cashier_session(target_organization_id uuid,target_school_id uuid,target_opening_cash numeric)
returns uuid language plpgsql security definer set search_path = '' as $$ declare result_id uuid; begin
if not public.can_access_finance(target_organization_id,target_school_id,'finance.cashier.manage','finance.cashier_control') then raise exception 'Not authorized' using errcode='42501'; end if;
insert into public.cashier_sessions(organization_id,school_id,cashier_user_id,opening_cash) values(target_organization_id,target_school_id,auth.uid(),target_opening_cash) returning id into result_id; return result_id; end $$;

create or replace function public.close_cashier_session(target_session_id uuid,target_counted_cash numeric,target_note text)
returns uuid language plpgsql security definer set search_path = '' as $$ declare target public.cashier_sessions%rowtype; expected numeric(14,2); begin
select * into target from public.cashier_sessions where id=target_session_id for update;
if target.id is null or not public.can_access_finance(target.organization_id,target.school_id,'finance.cashier.manage','finance.cashier_control') then raise exception 'Not authorized' using errcode='42501'; end if;
if target.status <> 'open' then return target.id; end if;
select target.opening_cash + coalesce(sum(amount),0) into expected from public.payments where cashier_session_id=target.id and status='verified' and method='cash';
update public.cashier_sessions set status='closed',closed_at=now(),expected_cash=expected,counted_cash=target_counted_cash,variance=target_counted_cash-expected,close_note=nullif(trim(target_note),'') where id=target.id; return target.id; end $$;

create or replace function public.reconcile_payments(target_reconciliation_id uuid,target_payment_ids uuid[])
returns uuid language plpgsql security definer set search_path = '' as $$ declare target public.reconciliation_records%rowtype; calculated numeric(14,2); begin
select * into target from public.reconciliation_records where id=target_reconciliation_id for update;
if target.id is null or not public.can_access_finance(target.organization_id,target.school_id,'finance.reconcile','finance.cashier_control') then raise exception 'Not authorized' using errcode='42501'; end if;
select coalesce(sum(amount),0) into calculated from public.payments where id=any(target_payment_ids) and organization_id=target.organization_id and school_id=target.school_id and status='verified' and method=target.method;
if calculated <> target.expected_amount then raise exception 'Selected payments do not match expected amount' using errcode='23514'; end if;
insert into public.reconciliation_payments(reconciliation_id,payment_id,organization_id,school_id) select target.id,unnest(target_payment_ids),target.organization_id,target.school_id;
update public.reconciliation_records set status=case when variance=0 then 'reconciled' else 'exception' end,reconciled_by=auth.uid(),reconciled_at=now() where id=target.id; return target.id; end $$;

create view public.finance_collection_summary with (security_invoker=true) as
select organization_id,school_id,date_trunc('day',paid_at)::date activity_date,method,currency_code,count(*) payment_count,sum(amount) amount
from public.payments where status='verified' group by organization_id,school_id,date_trunc('day',paid_at)::date,method,currency_code;
create view public.finance_expense_summary with (security_invoker=true) as
select organization_id,school_id,expense_date,currency_code,kind,count(*) expense_count,sum(coalesce(approved_amount,requested_amount)) amount
from public.expenses where status in ('approved','paid','completed') group by organization_id,school_id,expense_date,currency_code,kind;

do $$ declare table_name text; begin
foreach table_name in array array['income_categories','other_income','expense_categories','expenses','cashier_sessions','cash_handovers','reconciliation_records','reconciliation_payments'] loop
 execute format('alter table public.%I enable row level security',table_name);
 execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.capture_audit_event()',table_name,table_name);
end loop; end $$;
create policy income_categories_select on public.income_categories for select to authenticated using(public.can_access_finance(organization_id,school_id,'finance.view','finance.expenses'));
create policy other_income_select on public.other_income for select to authenticated using(public.can_access_finance(organization_id,school_id,'finance.reports.view','finance.reporting'));
create policy expense_categories_select on public.expense_categories for select to authenticated using(public.can_access_finance(organization_id,school_id,'finance.expenses.view','finance.expenses'));
create policy expenses_select on public.expenses for select to authenticated using(public.can_access_finance(organization_id,school_id,'finance.expenses.view','finance.expenses'));
create policy expenses_insert on public.expenses for insert to authenticated with check(requested_by=(select auth.uid()) and public.can_access_finance(organization_id,school_id,'finance.expenses.manage','finance.expenses'));
create policy cashier_sessions_select on public.cashier_sessions for select to authenticated using(public.can_access_finance(organization_id,school_id,'finance.cashier.manage','finance.cashier_control'));
create policy cash_handovers_select on public.cash_handovers for select to authenticated using(public.can_access_finance(organization_id,school_id,'finance.cashier.manage','finance.cashier_control'));
create policy reconciliation_records_select on public.reconciliation_records for select to authenticated using(public.can_access_finance(organization_id,school_id,'finance.reconcile','finance.cashier_control'));
create policy reconciliation_records_insert on public.reconciliation_records for insert to authenticated with check(created_by=(select auth.uid()) and public.can_access_finance(organization_id,school_id,'finance.reconcile','finance.cashier_control'));
create policy reconciliation_payments_select on public.reconciliation_payments for select to authenticated using(public.can_access_finance(organization_id,school_id,'finance.reconcile','finance.cashier_control'));

revoke all on public.income_categories,public.other_income,public.expense_categories,public.expenses,public.cashier_sessions,public.cash_handovers,public.reconciliation_records,public.reconciliation_payments from anon,authenticated;
grant select on public.income_categories,public.other_income,public.expense_categories,public.expenses,public.cashier_sessions,public.cash_handovers,public.reconciliation_records,public.reconciliation_payments to authenticated;
grant insert on public.expenses,public.reconciliation_records to authenticated;
revoke all on public.finance_collection_summary,public.finance_expense_summary from anon,authenticated;
grant select on public.finance_collection_summary,public.finance_expense_summary to authenticated;
revoke all on function public.submit_expense(uuid),public.decide_expense(uuid,boolean,numeric,text),public.open_cashier_session(uuid,uuid,numeric),public.close_cashier_session(uuid,numeric,text),public.reconcile_payments(uuid,uuid[]) from public,anon;
grant execute on function public.submit_expense(uuid),public.decide_expense(uuid,boolean,numeric,text),public.open_cashier_session(uuid,uuid,numeric),public.close_cashier_session(uuid,numeric,text),public.reconcile_payments(uuid,uuid[]) to authenticated;
