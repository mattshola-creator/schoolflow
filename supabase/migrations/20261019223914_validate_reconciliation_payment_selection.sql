-- Reconciliation accepts exactly the supplied eligible payment set and is replay-safe.
create or replace function public.reconcile_payments(target_reconciliation_id uuid,target_payment_ids uuid[])
returns uuid language plpgsql security definer set search_path='' as $$
declare
 target public.reconciliation_records%rowtype;
 requested uuid[];
 existing uuid[];
 eligible_count bigint;
 calculated numeric(14,2);
begin
 select * into target from public.reconciliation_records where id=target_reconciliation_id for update;
 if target.id is null or not public.can_access_finance(target.organization_id,target.school_id,'finance.reconcile','finance.cashier_control') then
  raise exception 'Not authorized' using errcode='42501';
 end if;
 if target_payment_ids is null or array_position(target_payment_ids,null) is not null then
  raise exception 'Payment selection is required' using errcode='22023';
 end if;
 select coalesce(array_agg(distinct id order by id),'{}'::uuid[]) into requested from unnest(target_payment_ids) id;
 if cardinality(requested)<>cardinality(target_payment_ids) then
  raise exception 'Duplicate payment selection' using errcode='23514';
 end if;
 if target.status<>'draft' then
  select coalesce(array_agg(payment_id order by payment_id),'{}'::uuid[]) into existing
  from public.reconciliation_payments where reconciliation_id=target.id;
  if existing=requested then return target.id; end if;
  raise exception 'Reconciliation selection cannot change' using errcode='23514';
 end if;
 -- Deterministic locks serialize overlapping selections and payment reversals.
 perform p.id from public.payments p
 where p.id=any(requested) and p.organization_id=target.organization_id and p.school_id=target.school_id
 order by p.id for update;
 select count(*),coalesce(sum(p.amount),0) into eligible_count,calculated
 from public.payments p where p.id=any(requested) and p.organization_id=target.organization_id
 and p.school_id=target.school_id and p.status='verified' and p.method=target.method;
 if eligible_count<>cardinality(requested) then
  raise exception 'Payment selection is unavailable' using errcode='23514';
 end if;
 if calculated<>target.expected_amount then
  raise exception 'Selected payments do not match expected amount' using errcode='23514';
 end if;
 if exists(select 1 from public.reconciliation_payments rp where rp.payment_id=any(requested)) then
  raise exception 'Payment selection is already reconciled' using errcode='23514';
 end if;
 insert into public.reconciliation_payments(reconciliation_id,payment_id,organization_id,school_id)
 select target.id,unnest(requested),target.organization_id,target.school_id;
 update public.reconciliation_records
 set status=case when variance=0 then 'reconciled'::public.reconciliation_status else 'exception'::public.reconciliation_status end,
 reconciled_by=auth.uid(),reconciled_at=now() where id=target.id;
 return target.id;
end $$;
revoke all on function public.reconcile_payments(uuid,uuid[]) from public,anon;
grant execute on function public.reconcile_payments(uuid,uuid[]) to authenticated;
-- Only the RPC can set status and reconciliation actor fields.
revoke insert on public.reconciliation_records from authenticated;
grant insert(organization_id,school_id,statement_date,method,expected_amount,actual_amount,reference,note)
 on public.reconciliation_records to authenticated;
