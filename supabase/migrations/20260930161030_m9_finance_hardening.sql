create policy student_category_assignments_insert on public.student_category_assignments for insert to authenticated
with check(created_by=(select auth.uid()) and public.can_access_finance(organization_id,school_id,'finance.configure','finance.fee_management'));
grant insert on public.student_category_assignments to authenticated;

create policy income_categories_insert on public.income_categories for insert to authenticated
with check(created_by=(select auth.uid()) and public.can_access_finance(organization_id,school_id,'finance.configure','finance.expenses'));
create policy expense_categories_insert on public.expense_categories for insert to authenticated
with check(created_by=(select auth.uid()) and public.can_access_finance(organization_id,school_id,'finance.configure','finance.expenses'));
create policy other_income_insert on public.other_income for insert to authenticated
with check(recorded_by=(select auth.uid()) and public.can_access_finance(organization_id,school_id,'finance.payments.record','finance.expenses'));
grant insert on public.income_categories,public.expense_categories,public.other_income to authenticated;

create or replace function private.attach_open_cashier_session()
returns trigger language plpgsql set search_path='' as $$
begin
  if new.method='cash' and new.cashier_session_id is null then
    select id into new.cashier_session_id from public.cashier_sessions
    where organization_id=new.organization_id and school_id=new.school_id and cashier_user_id=new.recorded_by and status='open'
    order by opened_at desc limit 1;
  end if;
  return new;
end $$;
create trigger attach_cashier_session_before_payment before insert on public.payments
for each row execute function private.attach_open_cashier_session();
revoke all on function private.attach_open_cashier_session() from public,anon,authenticated;

create or replace function private.validate_allocation()
returns trigger language plpgsql set search_path='' as $$
declare payment public.payments%rowtype; charge public.student_charges%rowtype; allow_cross boolean;
begin
  select * into payment from public.payments where id=new.payment_id;
  select * into charge from public.student_charges where id=new.student_charge_id;
  select allow_cross_student_allocation into allow_cross from public.finance_settings where school_id=new.school_id;
  if coalesce(allow_cross,false)=false and payment.student_id is not null and payment.student_id<>charge.student_id then
    raise exception 'Cross-student allocation is disabled' using errcode='23514';
  end if;
  return new;
end $$;
create trigger validate_allocation_before_insert before insert on public.payment_allocations
for each row execute function private.validate_allocation();
revoke all on function private.validate_allocation() from public,anon,authenticated;

create or replace function public.create_charge_adjustment(target_charge_id uuid,target_kind public.charge_adjustment_kind,target_amount numeric,target_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare target public.student_charges%rowtype; balance numeric(14,2); result_id uuid;
begin
  select * into target from public.student_charges where id=target_charge_id for update;
  if target.id is null or not public.can_access_finance(target.organization_id,target.school_id,'finance.billing.manage','finance.billing') then raise exception 'Not authorized' using errcode='42501'; end if;
  if target_kind not in ('discount','scholarship','credit','debit') then raise exception 'Unsupported adjustment kind' using errcode='22023'; end if;
  select outstanding_amount into balance from public.student_charge_balances where student_charge_id=target.id;
  if target_kind in ('discount','scholarship','credit') and target_amount>balance then raise exception 'Adjustment exceeds charge balance' using errcode='23514'; end if;
  insert into public.student_charge_adjustments(organization_id,school_id,student_charge_id,kind,amount,reason,approved_by,created_by)
  values(target.organization_id,target.school_id,target.id,target_kind,target_amount,trim(target_reason),auth.uid(),auth.uid()) returning id into result_id;
  return result_id;
end $$;
revoke all on function public.create_charge_adjustment(uuid,public.charge_adjustment_kind,numeric,text) from public,anon;
grant execute on function public.create_charge_adjustment(uuid,public.charge_adjustment_kind,numeric,text) to authenticated;

create or replace function private.require_receipt_allocation()
returns trigger language plpgsql set search_path='' as $$
begin
  if not exists(select 1 from public.payment_allocations where payment_id=new.payment_id) then
    raise exception 'Receipt requires at least one payment allocation' using errcode='23514';
  end if;
  return new;
end $$;
create trigger require_receipt_allocation_before_insert before insert on public.receipts
for each row execute function private.require_receipt_allocation();
revoke all on function private.require_receipt_allocation() from public,anon,authenticated;
