create table public.payment_reversals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  payment_id uuid not null,
  amount numeric(14,2) not null check (amount > 0),
  reason text not null check (char_length(trim(reason)) between 3 and 500),
  reversed_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  reversed_at timestamptz not null default now(),
  foreign key (payment_id, organization_id, school_id)
    references public.payments(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (payment_id)
);

create table public.payment_allocation_reversals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  payment_reversal_id uuid not null,
  payment_allocation_id uuid not null,
  amount numeric(14,2) not null check (amount > 0),
  reason text not null check (char_length(trim(reason)) between 3 and 500),
  reversed_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  reversed_at timestamptz not null default now(),
  foreign key (payment_reversal_id, organization_id, school_id)
    references public.payment_reversals(id, organization_id, school_id) on delete restrict,
  foreign key (payment_allocation_id, organization_id, school_id)
    references public.payment_allocations(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (payment_allocation_id)
);

create index payment_reversals_scope_idx
  on public.payment_reversals (organization_id, school_id, reversed_at desc);
create index payment_allocation_reversals_scope_idx
  on public.payment_allocation_reversals (organization_id, school_id, reversed_at desc);

drop view public.student_finance_balances;
drop view public.student_charge_balances;

create view public.student_charge_balances with (security_invoker = true) as
select
  charge.id as student_charge_id,
  charge.organization_id,
  charge.school_id,
  charge.student_id,
  charge.original_amount
    + coalesce((
      select sum(
        case
          when adjustment.kind = 'debit' then adjustment.amount
          when adjustment.kind in ('discount', 'scholarship', 'credit') then -adjustment.amount
          else 0
        end
      )
      from public.student_charge_adjustments adjustment
      where adjustment.student_charge_id = charge.id
        and adjustment.kind <> 'reversal'
        and not exists (
          select 1
          from public.student_charge_adjustments reversal
          where reversal.reverses_adjustment_id = adjustment.id
        )
    ), 0)
    - coalesce((
      select sum(allocation.amount)
      from public.payment_allocations allocation
      where allocation.student_charge_id = charge.id
        and not exists (
          select 1
          from public.payment_allocation_reversals reversal
          where reversal.payment_allocation_id = allocation.id
        )
    ), 0) as outstanding_amount
from public.student_charges charge
where charge.status <> 'reversed';

create view public.student_finance_balances with (security_invoker = true) as
select organization_id, school_id, student_id, sum(outstanding_amount) as outstanding_amount
from public.student_charge_balances
group by organization_id, school_id, student_id;

create or replace function public.reverse_payment(target_payment_id uuid, target_reason text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.payments%rowtype;
  reversal_id uuid;
begin
  select * into target from public.payments where id = target_payment_id for update;
  if target.id is null then
    raise exception 'Payment not found' using errcode = 'P0002';
  end if;
  if not public.can_access_finance(
    target.organization_id,
    target.school_id,
    'finance.payments.correct',
    'finance.collections'
  ) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if target.status = 'reversed' then
    select id into reversal_id from public.payment_reversals where payment_id = target.id;
    return reversal_id;
  end if;
  if target.status <> 'verified' then
    raise exception 'Only verified payments can be reversed' using errcode = '23514';
  end if;
  if char_length(trim(coalesce(target_reason, ''))) < 3 then
    raise exception 'A reversal reason is required' using errcode = '22023';
  end if;

  insert into public.payment_reversals (
    organization_id, school_id, payment_id, amount, reason, reversed_by
  ) values (
    target.organization_id, target.school_id, target.id, target.amount,
    trim(target_reason), auth.uid()
  ) returning id into reversal_id;

  insert into public.payment_allocation_reversals (
    organization_id, school_id, payment_reversal_id, payment_allocation_id,
    amount, reason, reversed_by
  )
  select allocation.organization_id, allocation.school_id, reversal_id, allocation.id,
    allocation.amount, trim(target_reason), auth.uid()
  from public.payment_allocations allocation
  where allocation.payment_id = target.id;

  update public.payments set status = 'reversed' where id = target.id;
  return reversal_id;
end
$$;

create or replace function public.mark_expense_paid(
  target_expense_id uuid,
  target_evidence_document_id uuid,
  target_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare target public.expenses%rowtype;
begin
  select * into target from public.expenses where id = target_expense_id for update;
  if target.id is null then raise exception 'Expense not found' using errcode = 'P0002'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.expenses.manage', 'finance.expenses') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if target.status <> 'approved' then raise exception 'Approved expense required' using errcode = '23514'; end if;
  if target_evidence_document_id is null then raise exception 'Payment evidence is required' using errcode = '23502'; end if;
  update public.expenses
  set status = 'paid', document_id = target_evidence_document_id, paid_at = now(),
    decision_note = coalesce(nullif(trim(target_note), ''), decision_note)
  where id = target.id;
  return target.id;
end
$$;

create or replace function public.complete_expense(target_expense_id uuid, target_note text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare target public.expenses%rowtype;
begin
  select * into target from public.expenses where id = target_expense_id for update;
  if target.id is null then raise exception 'Expense not found' using errcode = 'P0002'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.expenses.manage', 'finance.expenses') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if target.status <> 'paid' or target.document_id is null then
    raise exception 'Paid expense with evidence required' using errcode = '23514';
  end if;
  update public.expenses
  set status = 'completed', completed_at = now(),
    decision_note = coalesce(nullif(trim(target_note), ''), decision_note)
  where id = target.id;
  return target.id;
end
$$;

create or replace function public.record_cash_handover(
  target_cashier_session_id uuid,
  target_amount numeric,
  target_handed_to uuid,
  target_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare target public.cashier_sessions%rowtype; result_id uuid; handed_total numeric(14,2);
begin
  select * into target from public.cashier_sessions where id = target_cashier_session_id for update;
  if target.id is null then raise exception 'Cashier session not found' using errcode = 'P0002'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.cashier.manage', 'finance.cashier_control') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if target.status <> 'closed' then raise exception 'Closed cashier session required' using errcode = '23514'; end if;
  if target_amount <= 0 or target_handed_to is null then raise exception 'Valid handover details are required' using errcode = '22023'; end if;
  select coalesce(sum(amount), 0) into handed_total from public.cash_handovers where cashier_session_id = target.id;
  if handed_total + target_amount > coalesce(target.counted_cash, 0) then
    raise exception 'Handover exceeds counted cash' using errcode = '23514';
  end if;
  insert into public.cash_handovers (
    organization_id, school_id, cashier_session_id, amount, handed_to, note, handed_over_by
  ) values (
    target.organization_id, target.school_id, target.id, target_amount,
    target_handed_to, nullif(trim(target_note), ''), auth.uid()
  ) returning id into result_id;
  return result_id;
end
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['payment_reversals', 'payment_allocation_reversals'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.capture_audit_event()',
      table_name,
      table_name
    );
    execute format(
      'create policy %I_select on public.%I for select to authenticated using (public.can_access_finance(organization_id, school_id, ''finance.payments.view'', ''finance.collections''))',
      table_name,
      table_name
    );
  end loop;
end
$$;

revoke all on public.payment_reversals, public.payment_allocation_reversals from anon, authenticated;
grant select on public.payment_reversals, public.payment_allocation_reversals to authenticated;
revoke all on public.student_charge_balances, public.student_finance_balances from anon, authenticated;
grant select on public.student_charge_balances, public.student_finance_balances to authenticated;

revoke all on function public.reverse_payment(uuid, text) from public, anon;
revoke all on function public.mark_expense_paid(uuid, uuid, text) from public, anon;
revoke all on function public.complete_expense(uuid, text) from public, anon;
revoke all on function public.record_cash_handover(uuid, numeric, uuid, text) from public, anon;
grant execute on function public.reverse_payment(uuid, text) to authenticated;
grant execute on function public.mark_expense_paid(uuid, uuid, text) to authenticated;
grant execute on function public.complete_expense(uuid, text) to authenticated;
grant execute on function public.record_cash_handover(uuid, numeric, uuid, text) to authenticated;
