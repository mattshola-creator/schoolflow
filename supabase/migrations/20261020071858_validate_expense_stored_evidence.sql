-- Require an available, tenant-scoped stored object as expense evidence.
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
  perform 1
  from public.documents d
  join storage.objects o
    on o.bucket_id = 'schoolflow-documents' and o.name = d.object_path
  where d.id = target_evidence_document_id
    and d.organization_id = target.organization_id
    and d.school_id = target.school_id
    and d.status = 'available'
  for share of d, o;
  if not found then
    raise exception 'Available stored payment evidence is required' using errcode = '23514';
  end if;
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
  perform 1
  from public.documents d
  join storage.objects o
    on o.bucket_id = 'schoolflow-documents' and o.name = d.object_path
  where d.id = target.document_id
    and d.organization_id = target.organization_id
    and d.school_id = target.school_id
    and d.status = 'available'
  for share of d, o;
  if not found then
    raise exception 'Available stored payment evidence is required' using errcode = '23514';
  end if;
  update public.expenses
  set status = 'completed', completed_at = now(),
    decision_note = coalesce(nullif(trim(target_note), ''), decision_note)
  where id = target.id;
  return target.id;
end
$$;

revoke all on function public.mark_expense_paid(uuid,uuid,text), public.complete_expense(uuid,text) from public,anon;
grant execute on function public.mark_expense_paid(uuid,uuid,text), public.complete_expense(uuid,text) to authenticated;
