create or replace function public.create_fee_structure(
  target_organization_id uuid,
  target_school_id uuid,
  target_session_id uuid,
  target_period_id uuid,
  target_class_level_id uuid,
  target_student_category_id uuid,
  target_name text,
  target_effective_from date,
  target_effective_to date,
  target_fee_category_id uuid,
  target_amount numeric,
  target_due_date date
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result_id uuid; target_currency text;
begin
  if not public.can_access_finance(target_organization_id, target_school_id, 'finance.configure', 'finance.fee_management') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select currency_code into target_currency from public.finance_settings
  where organization_id = target_organization_id and school_id = target_school_id;
  target_currency := coalesce(target_currency, 'NGN');
  insert into public.fee_structures (
    organization_id, school_id, session_id, period_id, class_level_id, student_category_id,
    name, currency_code, effective_from, effective_to, created_by, updated_by
  ) values (
    target_organization_id, target_school_id, target_session_id, target_period_id,
    target_class_level_id, target_student_category_id, trim(target_name), target_currency,
    target_effective_from, target_effective_to, auth.uid(), auth.uid()
  ) returning id into result_id;
  insert into public.fee_structure_items (
    organization_id, school_id, fee_structure_id, fee_category_id, amount, due_date, created_by
  ) values (
    target_organization_id, target_school_id, result_id, target_fee_category_id,
    target_amount, target_due_date, auth.uid()
  );
  return result_id;
end $$;

create or replace function public.activate_fee_structure(target_structure_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target public.fee_structures%rowtype;
begin
  select * into target from public.fee_structures where id = target_structure_id for update;
  if target.id is null then raise exception 'Fee structure not found' using errcode = 'P0002'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.configure', 'finance.fee_management') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if target.status <> 'draft' then raise exception 'Only a draft fee structure can be activated' using errcode = '23514'; end if;
  if not exists (select 1 from public.fee_structure_items where fee_structure_id = target.id) then
    raise exception 'A fee structure requires at least one item' using errcode = '23514';
  end if;
  update public.fee_structures set status = 'active', activated_at = now(), updated_by = auth.uid()
  where id = target.id;
  return target.id;
end $$;

revoke all on function public.create_fee_structure(uuid,uuid,uuid,uuid,uuid,uuid,text,date,date,uuid,numeric,date) from public, anon;
grant execute on function public.create_fee_structure(uuid,uuid,uuid,uuid,uuid,uuid,text,date,date,uuid,numeric,date) to authenticated;
revoke all on function public.activate_fee_structure(uuid) from public, anon;
grant execute on function public.activate_fee_structure(uuid) to authenticated;
