create type public.payment_method as enum ('cash', 'bank_transfer', 'pos', 'other');
create type public.payment_status as enum ('recorded', 'verified', 'rejected', 'reversed');

create table public.payments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  student_id uuid, payer_person_id uuid, academic_session_id uuid, academic_period_id uuid,
  amount numeric(14,2) not null check (amount > 0), currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  method public.payment_method not null, reference text check (reference is null or char_length(trim(reference)) between 2 and 120),
  paid_at timestamptz not null, payer_name text check (payer_name is null or char_length(trim(payer_name)) between 2 and 160),
  evidence_document_id uuid, notes text check (notes is null or char_length(trim(notes)) <= 1000),
  status public.payment_status not null default 'recorded', idempotency_key uuid not null,
  recorded_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  received_by uuid references auth.users(id) on delete restrict, verified_by uuid references auth.users(id) on delete restrict,
  verified_at timestamptz, verification_note text check (verification_note is null or char_length(trim(verification_note)) between 2 and 500),
  created_at timestamptz not null default now(),
  check ((status = 'verified' and verified_by is not null and verified_at is not null) or status <> 'verified'),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (student_id, organization_id) references public.student_profiles(id, organization_id) on delete restrict,
  foreign key (payer_person_id) references public.people(id) on delete restrict,
  foreign key (academic_session_id, organization_id, school_id) references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (academic_period_id, organization_id, school_id) references public.academic_periods(id, organization_id, school_id) on delete restrict,
  foreign key (evidence_document_id, organization_id, school_id) references public.documents(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (school_id, idempotency_key)
);

create table public.payment_allocations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  payment_id uuid not null, student_charge_id uuid not null, amount numeric(14,2) not null check (amount > 0),
  allocated_by uuid not null default auth.uid() references auth.users(id) on delete restrict, allocated_at timestamptz not null default now(),
  foreign key (payment_id, organization_id, school_id) references public.payments(id, organization_id, school_id) on delete restrict,
  foreign key (student_charge_id, organization_id, school_id) references public.student_charges(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (payment_id, student_charge_id)
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  payment_id uuid not null, receipt_number text not null, currency_code text not null,
  amount numeric(14,2) not null check (amount > 0), school_name_snapshot text not null,
  payer_name_snapshot text, student_snapshot jsonb, allocation_snapshot jsonb not null check (jsonb_typeof(allocation_snapshot) = 'array'),
  issued_by uuid not null default auth.uid() references auth.users(id) on delete restrict, issued_at timestamptz not null default now(),
  foreign key (payment_id, organization_id, school_id) references public.payments(id, organization_id, school_id) on delete restrict,
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id), unique (school_id, receipt_number), unique (payment_id)
);

create index payments_scope_idx on public.payments (organization_id, school_id, status, paid_at desc);
create index payments_student_idx on public.payments (student_id, paid_at desc) where student_id is not null;
create index allocations_charge_idx on public.payment_allocations (student_charge_id, allocated_at);
create index receipts_scope_idx on public.receipts (organization_id, school_id, issued_at desc);

create view public.student_charge_balances with (security_invoker = true) as
select charge.id as student_charge_id, charge.organization_id, charge.school_id, charge.student_id,
  charge.original_amount
    + coalesce(sum(case when adjustment.kind = 'debit' then adjustment.amount when adjustment.kind in ('discount','scholarship','credit') then -adjustment.amount else 0 end), 0)
    - coalesce((select sum(allocation.amount) from public.payment_allocations allocation where allocation.student_charge_id = charge.id), 0) as outstanding_amount
from public.student_charges charge left join public.student_charge_adjustments adjustment on adjustment.student_charge_id = charge.id
where charge.status <> 'reversed' group by charge.id;

create view public.student_finance_balances with (security_invoker = true) as
select organization_id, school_id, student_id, sum(outstanding_amount) as outstanding_amount
from public.student_charge_balances group by organization_id, school_id, student_id;

create or replace function public.record_payment(
  target_organization_id uuid, target_school_id uuid, target_student_id uuid, target_session_id uuid,
  target_period_id uuid, target_amount numeric, target_method public.payment_method, target_reference text,
  target_paid_at timestamptz, target_payer_name text, target_evidence_document_id uuid, target_notes text,
  target_received_by uuid, target_idempotency_key uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare result_id uuid; target_currency text;
begin
  if not public.can_access_finance(target_organization_id, target_school_id, 'finance.payments.record', 'finance.collections') then raise exception 'Not authorized' using errcode = '42501'; end if;
  select id into result_id from public.payments where school_id = target_school_id and idempotency_key = target_idempotency_key;
  if result_id is not null then return result_id; end if;
  select currency_code into target_currency from public.finance_settings where school_id = target_school_id and organization_id = target_organization_id;
  insert into public.payments (organization_id, school_id, student_id, academic_session_id, academic_period_id, amount, currency_code,
    method, reference, paid_at, payer_name, evidence_document_id, notes, received_by, idempotency_key, recorded_by)
  values (target_organization_id, target_school_id, target_student_id, target_session_id, target_period_id, target_amount,
    coalesce(target_currency, 'NGN'), target_method, nullif(trim(target_reference),''), target_paid_at, nullif(trim(target_payer_name),''),
    target_evidence_document_id, nullif(trim(target_notes),''), coalesce(target_received_by, auth.uid()), target_idempotency_key, auth.uid())
  returning id into result_id; return result_id;
end $$;

create or replace function public.verify_payment(target_payment_id uuid, approve boolean, target_note text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target public.payments%rowtype; settings public.finance_settings%rowtype;
begin
  select * into target from public.payments where id = target_payment_id for update;
  if target.id is null then raise exception 'Payment not found' using errcode = 'P0002'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.payments.verify', 'finance.collections') then raise exception 'Not authorized' using errcode = '42501'; end if;
  if target.status <> 'recorded' then return target.id; end if;
  select * into settings from public.finance_settings where school_id = target.school_id;
  if coalesce(settings.payment_recorder_may_verify, false) = false and target.recorded_by = auth.uid() then raise exception 'Recorder cannot verify this payment' using errcode = '42501'; end if;
  update public.payments set status = case when approve then 'verified' else 'rejected' end,
    verified_by = auth.uid(), verified_at = now(), verification_note = nullif(trim(target_note),'') where id = target.id;
  return target.id;
end $$;

create or replace function public.allocate_payment(target_payment_id uuid, target_allocations jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target public.payments%rowtype; item record; allocated numeric(14,2); charge_balance numeric(14,2);
begin
  select * into target from public.payments where id = target_payment_id for update;
  if target.id is null or target.status <> 'verified' then raise exception 'Verified payment required' using errcode = '23514'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.payments.allocate', 'finance.collections') then raise exception 'Not authorized' using errcode = '42501'; end if;
  if jsonb_typeof(target_allocations) <> 'array' or jsonb_array_length(target_allocations) = 0 then raise exception 'At least one allocation is required' using errcode = '22023'; end if;
  select coalesce(sum(amount),0) into allocated from public.payment_allocations where payment_id = target.id;
  for item in select (value->>'chargeId')::uuid charge_id, (value->>'amount')::numeric amount from jsonb_array_elements(target_allocations) loop
    if item.amount <= 0 or allocated + item.amount > target.amount then raise exception 'Allocation exceeds available payment' using errcode = '23514'; end if;
    select outstanding_amount into charge_balance from public.student_charge_balances where student_charge_id = item.charge_id and organization_id = target.organization_id and school_id = target.school_id;
    if charge_balance is null or item.amount > charge_balance then raise exception 'Allocation exceeds charge balance' using errcode = '23514'; end if;
    insert into public.payment_allocations (organization_id, school_id, payment_id, student_charge_id, amount, allocated_by)
    values (target.organization_id, target.school_id, target.id, item.charge_id, item.amount, auth.uid());
    allocated := allocated + item.amount;
  end loop;
  return target.id;
end $$;

create or replace function public.issue_receipt(target_payment_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target public.payments%rowtype; result_id uuid; next_number bigint; prefix text; school_name text; student_data jsonb; allocation_data jsonb;
begin
  select * into target from public.payments where id = target_payment_id for update;
  if target.id is null or target.status <> 'verified' then raise exception 'Verified payment required' using errcode = '23514'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.payments.view', 'finance.collections') then raise exception 'Not authorized' using errcode = '42501'; end if;
  select id into result_id from public.receipts where payment_id = target.id; if result_id is not null then return result_id; end if;
  select name into school_name from public.schools where id = target.school_id;
  select jsonb_build_object('studentId', profile.id, 'studentNumber', profile.student_number, 'firstName', person.first_name, 'lastName', person.last_name)
    into student_data from public.student_profiles profile join public.people person on person.id = profile.person_id where profile.id = target.student_id;
  select coalesce(jsonb_agg(jsonb_build_object('chargeId', charge.id, 'category', charge.fee_category_name_snapshot, 'amount', allocation.amount) order by allocation.allocated_at), '[]'::jsonb)
    into allocation_data from public.payment_allocations allocation join public.student_charges charge on charge.id = allocation.student_charge_id where allocation.payment_id = target.id;
  insert into public.finance_settings (school_id, organization_id, created_by, updated_by) values (target.school_id, target.organization_id, auth.uid(), auth.uid()) on conflict (school_id) do nothing;
  select receipt_prefix, receipt_next_number into prefix, next_number from public.finance_settings where school_id = target.school_id for update;
  update public.finance_settings set receipt_next_number = receipt_next_number + 1, updated_by = auth.uid() where school_id = target.school_id;
  insert into public.receipts (organization_id, school_id, payment_id, receipt_number, currency_code, amount, school_name_snapshot, payer_name_snapshot, student_snapshot, allocation_snapshot, issued_by)
  values (target.organization_id, target.school_id, target.id, prefix || '-' || lpad(next_number::text, 8, '0'), target.currency_code, target.amount, school_name, target.payer_name, student_data, allocation_data, auth.uid())
  returning id into result_id; return result_id;
end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['payments','payment_allocations','receipts'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.capture_audit_event()', table_name, table_name);
    execute format('create policy %I_select on public.%I for select to authenticated using (public.can_access_finance(organization_id, school_id, ''finance.payments.view'', ''finance.collections''))', table_name, table_name);
  end loop;
end $$;

revoke all on public.payments, public.payment_allocations, public.receipts from anon, authenticated;
grant select on public.payments, public.payment_allocations, public.receipts to authenticated;
revoke all on public.student_charge_balances, public.student_finance_balances from anon, authenticated;
grant select on public.student_charge_balances, public.student_finance_balances to authenticated;
revoke all on function public.record_payment(uuid,uuid,uuid,uuid,uuid,numeric,public.payment_method,text,timestamptz,text,uuid,text,uuid,uuid) from public, anon;
revoke all on function public.verify_payment(uuid,boolean,text) from public, anon;
revoke all on function public.allocate_payment(uuid,jsonb) from public, anon;
revoke all on function public.issue_receipt(uuid) from public, anon;
grant execute on function public.record_payment(uuid,uuid,uuid,uuid,uuid,numeric,public.payment_method,text,timestamptz,text,uuid,text,uuid,uuid) to authenticated;
grant execute on function public.verify_payment(uuid,boolean,text) to authenticated;
grant execute on function public.allocate_payment(uuid,jsonb) to authenticated;
grant execute on function public.issue_receipt(uuid) to authenticated;
