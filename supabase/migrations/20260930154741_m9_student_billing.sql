create type public.billing_run_status as enum ('previewed', 'completed', 'failed', 'cancelled');
create type public.invoice_status as enum ('open', 'partially_paid', 'paid', 'voided');
create type public.charge_status as enum ('open', 'partially_paid', 'paid', 'reversed');
create type public.charge_adjustment_kind as enum ('discount', 'scholarship', 'credit', 'debit', 'reversal');

create table public.student_category_assignments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  student_id uuid not null, student_category_id uuid not null, effective_from date not null, effective_to date,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict, created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (student_id, organization_id) references public.student_profiles(id, organization_id) on delete restrict,
  foreign key (student_category_id, organization_id, school_id) references public.student_categories(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (student_id, student_category_id, effective_from)
);

create table public.billing_runs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  fee_structure_id uuid not null, idempotency_key uuid not null, status public.billing_run_status not null default 'previewed',
  affected_students integer not null check (affected_students >= 0), expected_total numeric(14,2) not null check (expected_total >= 0),
  completed_at timestamptz, created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (fee_structure_id, organization_id, school_id) references public.fee_structures(id, organization_id, school_id) on delete restrict,
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id), unique (school_id, idempotency_key)
);

create table public.student_invoices (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  student_id uuid not null, enrollment_id uuid not null, session_id uuid not null, period_id uuid,
  billing_run_id uuid not null, invoice_number text not null, currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  status public.invoice_status not null default 'open', issued_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict, created_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (student_id, organization_id) references public.student_profiles(id, organization_id) on delete restrict,
  foreign key (enrollment_id, student_id, organization_id, school_id) references public.student_enrollments(id, student_id, organization_id, school_id) on delete restrict,
  foreign key (session_id, organization_id, school_id) references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (period_id, organization_id, school_id) references public.academic_periods(id, organization_id, school_id) on delete restrict,
  foreign key (billing_run_id, organization_id, school_id) references public.billing_runs(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (school_id, invoice_number), unique (billing_run_id, enrollment_id)
);

create table public.student_charges (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  student_id uuid not null, enrollment_id uuid not null, invoice_id uuid not null, fee_structure_id uuid not null,
  fee_structure_item_id uuid not null, fee_category_id uuid not null, session_id uuid not null, period_id uuid,
  class_level_id uuid, student_category_id uuid, currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  original_amount numeric(14,2) not null check (original_amount >= 0), due_date date, status public.charge_status not null default 'open',
  fee_structure_name_snapshot text not null, fee_structure_version_snapshot integer not null,
  fee_category_code_snapshot text not null, fee_category_name_snapshot text not null,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict, created_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (student_id, organization_id) references public.student_profiles(id, organization_id) on delete restrict,
  foreign key (enrollment_id, student_id, organization_id, school_id) references public.student_enrollments(id, student_id, organization_id, school_id) on delete restrict,
  foreign key (invoice_id, organization_id, school_id) references public.student_invoices(id, organization_id, school_id) on delete restrict,
  foreign key (fee_structure_id, organization_id, school_id) references public.fee_structures(id, organization_id, school_id) on delete restrict,
  foreign key (fee_category_id, organization_id, school_id) references public.fee_categories(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (enrollment_id, fee_structure_item_id)
);

create table public.student_charge_adjustments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  student_charge_id uuid not null, kind public.charge_adjustment_kind not null,
  amount numeric(14,2) not null check (amount > 0), reason text not null check (char_length(trim(reason)) between 3 and 500),
  reverses_adjustment_id uuid, approved_by uuid references auth.users(id) on delete restrict,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict, created_at timestamptz not null default now(),
  foreign key (student_charge_id, organization_id, school_id) references public.student_charges(id, organization_id, school_id) on delete restrict,
  foreign key (reverses_adjustment_id) references public.student_charge_adjustments(id) on delete restrict,
  check ((kind = 'reversal') = (reverses_adjustment_id is not null)),
  unique (id, organization_id, school_id), unique (reverses_adjustment_id)
);

create index billing_runs_scope_idx on public.billing_runs (organization_id, school_id, created_at desc);
create index student_invoices_scope_idx on public.student_invoices (organization_id, school_id, session_id, period_id, status);
create index student_invoices_student_idx on public.student_invoices (student_id, issued_at desc);
create index student_charges_student_idx on public.student_charges (organization_id, school_id, student_id, status, due_date);
create index student_charges_invoice_idx on public.student_charges (invoice_id);
create index charge_adjustments_charge_idx on public.student_charge_adjustments (student_charge_id, created_at);
create index student_category_assignments_student_idx on public.student_category_assignments (organization_id, school_id, student_id, effective_from, effective_to);

create or replace function private.billing_targets(target_structure_id uuid)
returns table(enrollment_id uuid, student_id uuid)
language sql stable security definer set search_path = '' as $$
  select distinct enrollment.id, enrollment.student_id
  from public.fee_structures structure
  join public.student_enrollments enrollment
    on enrollment.organization_id = structure.organization_id and enrollment.school_id = structure.school_id
    and enrollment.academic_session_id = structure.session_id and enrollment.status = 'active'
  join public.class_memberships membership
    on membership.enrollment_id = enrollment.id and membership.status = 'active'
    and membership.class_level_id = coalesce(structure.class_level_id, membership.class_level_id)
  where structure.id = target_structure_id and structure.status = 'active'
    and (structure.student_category_id is null or exists (
      select 1 from public.student_category_assignments assignment
      where assignment.student_id = enrollment.student_id and assignment.student_category_id = structure.student_category_id
        and structure.effective_from between assignment.effective_from and coalesce(assignment.effective_to, 'infinity'::date)
    ));
$$;

create or replace function public.preview_billing_run(target_structure_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare target public.fee_structures%rowtype; count_students integer; total numeric(14,2);
begin
  select * into target from public.fee_structures where id = target_structure_id;
  if target.id is null then raise exception 'Fee structure not found' using errcode = 'P0002'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.billing.manage', 'finance.billing') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select count(*), coalesce(count(*) * (select sum(amount) from public.fee_structure_items where fee_structure_id = target.id), 0)
  into count_students, total from private.billing_targets(target.id);
  return jsonb_build_object('studentCount', count_students, 'expectedTotal', total, 'currencyCode', target.currency_code);
end $$;

create or replace function public.generate_billing_run(target_structure_id uuid, target_idempotency_key uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target public.fee_structures%rowtype; run_id uuid; target_count integer; target_total numeric(14,2); target_row record; invoice_id uuid; invoice_sequence integer := 0;
begin
  select * into target from public.fee_structures where id = target_structure_id for share;
  if target.id is null then raise exception 'Fee structure not found' using errcode = 'P0002'; end if;
  if not public.can_access_finance(target.organization_id, target.school_id, 'finance.billing.manage', 'finance.billing') then raise exception 'Not authorized' using errcode = '42501'; end if;
  if target.status <> 'active' then raise exception 'Only an active fee structure can be billed' using errcode = '23514'; end if;
  select id into run_id from public.billing_runs where school_id = target.school_id and idempotency_key = target_idempotency_key;
  if run_id is not null then return run_id; end if;
  select count(*), coalesce(count(*) * (select sum(amount) from public.fee_structure_items where fee_structure_id = target.id), 0)
  into target_count, target_total from private.billing_targets(target.id);
  insert into public.billing_runs (organization_id, school_id, fee_structure_id, idempotency_key, status, affected_students, expected_total, completed_at, created_by)
  values (target.organization_id, target.school_id, target.id, target_idempotency_key, 'completed', target_count, target_total, now(), auth.uid()) returning id into run_id;
  for target_row in select * from private.billing_targets(target.id) loop
    invoice_sequence := invoice_sequence + 1;
    insert into public.student_invoices (organization_id, school_id, student_id, enrollment_id, session_id, period_id, billing_run_id, invoice_number, currency_code, created_by)
    values (target.organization_id, target.school_id, target_row.student_id, target_row.enrollment_id, target.session_id, target.period_id, run_id,
      'INV-' || upper(substr(replace(run_id::text, '-', ''), 1, 8)) || '-' || lpad(invoice_sequence::text, 4, '0'), target.currency_code, auth.uid())
    returning id into invoice_id;
    insert into public.student_charges (organization_id, school_id, student_id, enrollment_id, invoice_id, fee_structure_id, fee_structure_item_id,
      fee_category_id, session_id, period_id, class_level_id, student_category_id, currency_code, original_amount, due_date,
      fee_structure_name_snapshot, fee_structure_version_snapshot, fee_category_code_snapshot, fee_category_name_snapshot, created_by)
    select target.organization_id, target.school_id, target_row.student_id, target_row.enrollment_id, invoice_id, target.id, item.id,
      item.fee_category_id, target.session_id, target.period_id, target.class_level_id, target.student_category_id, target.currency_code,
      item.amount, item.due_date, target.name, target.version, category.code, category.name, auth.uid()
    from public.fee_structure_items item join public.fee_categories category on category.id = item.fee_category_id where item.fee_structure_id = target.id
    on conflict (enrollment_id, fee_structure_item_id) do nothing;
  end loop;
  return run_id;
end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['student_category_assignments','billing_runs','student_invoices','student_charges','student_charge_adjustments'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.capture_audit_event()', table_name, table_name);
    execute format('create policy %I_select on public.%I for select to authenticated using (public.can_access_finance(organization_id, school_id, ''finance.billing.view'', ''finance.billing''))', table_name, table_name);
  end loop;
end $$;

revoke all on public.billing_runs, public.student_invoices, public.student_charges, public.student_charge_adjustments from anon, authenticated;
revoke all on public.student_category_assignments from anon, authenticated;
grant select on public.student_category_assignments, public.billing_runs, public.student_invoices, public.student_charges, public.student_charge_adjustments to authenticated;
revoke all on function private.billing_targets(uuid) from public, anon, authenticated;
revoke all on function public.preview_billing_run(uuid) from public, anon;
revoke all on function public.generate_billing_run(uuid,uuid) from public, anon;
grant execute on function public.preview_billing_run(uuid) to authenticated;
grant execute on function public.generate_billing_run(uuid,uuid) to authenticated;
