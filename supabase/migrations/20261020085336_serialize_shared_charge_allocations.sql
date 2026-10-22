CREATE OR REPLACE FUNCTION public.allocate_payment(target_payment_id uuid, target_allocations jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare target public.payments%rowtype; item record; allocated numeric(14,2); charge_balance numeric(14,2);
begin
  select * into target from public.payments where id = target_payment_id for update;
  if target.id is null or target.status <> 'verified' then raise exception 'Verified payment required' using errcode = '23514'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.payments.allocate', 'finance.collections') then raise exception 'Not authorized' using errcode = '42501'; end if;
  if target_allocations is null or jsonb_typeof(target_allocations) <> 'array' or jsonb_array_length(target_allocations) = 0 then raise exception 'At least one allocation is required' using errcode = '22023'; end if;
  -- Payments can share charges: lock every scoped charge in a stable order
  -- before reading balances, including across different payment rows.
  perform charge.id
  from public.student_charges charge
  where charge.organization_id = target.organization_id
    and charge.school_id = target.school_id
    and charge.id in (
      select (entry->>'chargeId')::uuid
      from jsonb_array_elements(target_allocations) entry
    )
  order by charge.id
  for update;
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
end $function$;
revoke all on function public.allocate_payment(uuid,jsonb) from public,anon;
grant execute on function public.allocate_payment(uuid,jsonb) to authenticated;
