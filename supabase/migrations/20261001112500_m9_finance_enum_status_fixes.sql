-- PostgreSQL resolves CASE string literals as text in these procedural updates.
-- Cast each branch to its domain enum so live workflow transitions remain valid.

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
  update public.payments set status = case when approve then 'verified'::public.payment_status else 'rejected'::public.payment_status end,
    verified_by = auth.uid(), verified_at = now(), verification_note = nullif(trim(target_note),'') where id = target.id;
  return target.id;
end $$;

create or replace function public.decide_expense(target_expense_id uuid, approve boolean, target_approved_amount numeric, target_note text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target public.expenses%rowtype;
begin
  select * into target from public.expenses where id=target_expense_id for update;
  if target.id is null or not public.can_access_finance(target.organization_id,target.school_id,'finance.expenses.approve','finance.expenses') then raise exception 'Not authorized' using errcode='42501'; end if;
  if target.status <> 'submitted' then raise exception 'Submitted expense required' using errcode='23514'; end if;
  update public.expenses set status=case when approve then 'approved'::public.expense_status else 'rejected'::public.expense_status end,
    approved_amount=case when approve then target_approved_amount else null end, approved_by=auth.uid(), approved_at=now(), decision_note=nullif(trim(target_note),'') where id=target.id;
  return target.id;
end $$;

create or replace function public.reconcile_payments(target_reconciliation_id uuid,target_payment_ids uuid[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare target public.reconciliation_records%rowtype; calculated numeric(14,2);
begin
  select * into target from public.reconciliation_records where id=target_reconciliation_id for update;
  if target.id is null or not public.can_access_finance(target.organization_id,target.school_id,'finance.reconcile','finance.cashier_control') then raise exception 'Not authorized' using errcode='42501'; end if;
  select coalesce(sum(amount),0) into calculated from public.payments where id=any(target_payment_ids) and organization_id=target.organization_id and school_id=target.school_id and status='verified' and method=target.method;
  if calculated <> target.expected_amount then raise exception 'Selected payments do not match expected amount' using errcode='23514'; end if;
  insert into public.reconciliation_payments(reconciliation_id,payment_id,organization_id,school_id) select target.id,unnest(target_payment_ids),target.organization_id,target.school_id;
  update public.reconciliation_records set status=case when variance=0 then 'reconciled'::public.reconciliation_status else 'exception'::public.reconciliation_status end,reconciled_by=auth.uid(),reconciled_at=now() where id=target.id;
  return target.id;
end $$;

revoke all on function public.verify_payment(uuid,boolean,text) from public,anon;
revoke all on function public.decide_expense(uuid,boolean,numeric,text) from public,anon;
revoke all on function public.reconcile_payments(uuid,uuid[]) from public,anon;
grant execute on function public.verify_payment(uuid,boolean,text) to authenticated;
grant execute on function public.decide_expense(uuid,boolean,numeric,text) to authenticated;
grant execute on function public.reconcile_payments(uuid,uuid[]) to authenticated;
