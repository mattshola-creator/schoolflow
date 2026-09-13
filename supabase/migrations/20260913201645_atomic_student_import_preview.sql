-- Import previews are persisted atomically so a failure cannot leave an
-- ambiguous partial batch. This does not execute the import.
drop policy import_batches_manage on public.import_batches;
drop policy import_rows_manage on public.import_rows;
create policy import_batches_insert on public.import_batches for insert to authenticated
with check (created_by = (select auth.uid()) and public.can_access_students(organization_id, school_id, 'students.import', 'students.import_preview'));
create policy import_batches_update on public.import_batches for update to authenticated
using (created_by = (select auth.uid()) and public.can_access_students(organization_id, school_id, 'students.import', 'students.import_preview'))
with check (created_by = (select auth.uid()) and public.can_access_students(organization_id, school_id, 'students.import', 'students.import_preview'));
create policy import_batches_delete on public.import_batches for delete to authenticated
using (created_by = (select auth.uid()) and status <> 'committed'
  and public.can_access_students(organization_id, school_id, 'students.import', 'students.import_preview'));
create policy import_rows_insert on public.import_rows for insert to authenticated
with check (exists (select 1 from public.import_batches b where b.id = batch_id
  and b.created_by = (select auth.uid()) and b.organization_id = import_rows.organization_id
  and b.school_id = import_rows.school_id
  and public.can_access_students(b.organization_id, b.school_id, 'students.import', 'students.import_preview')));
create policy import_rows_delete on public.import_rows for delete to authenticated
using (exists (select 1 from public.import_batches b where b.id = batch_id
  and b.created_by = (select auth.uid()) and b.status <> 'committed'
  and public.can_access_students(b.organization_id, b.school_id, 'students.import', 'students.import_preview')));

create or replace function public.create_student_import_preview(
  target_organization_id uuid,
  target_school_id uuid,
  source_name text,
  preview_rows jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); created_batch_id uuid; total_count int; valid_count int; warning_count int; invalid_count int;
begin
  if caller_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not public.can_access_students(target_organization_id, target_school_id, 'students.import', 'students.import_preview') then
    raise exception 'Import preview is unavailable' using errcode = '42501';
  end if;
  if jsonb_typeof(preview_rows) <> 'array' then raise exception 'Preview rows must be an array' using errcode = '22023'; end if;
  total_count := jsonb_array_length(preview_rows);
  if total_count not between 1 and 500 or char_length(trim(source_name)) not between 1 and 160 then
    raise exception 'Import preview details are invalid' using errcode = '22023';
  end if;
  select count(*) filter (where value->>'status' = 'valid'),
    count(*) filter (where value->>'status' = 'warning'),
    count(*) filter (where value->>'status' = 'invalid')
  into valid_count, warning_count, invalid_count from jsonb_array_elements(preview_rows);
  if valid_count + warning_count + invalid_count <> total_count then
    raise exception 'Every preview row requires a valid status' using errcode = '22023';
  end if;
  insert into public.import_batches (
    organization_id, school_id, kind, source_name, status, total_rows,
    valid_rows, warning_rows, invalid_rows, created_by
  ) values (
    target_organization_id, target_school_id, 'student_guardian', trim(source_name),
    case when invalid_count > 0 then 'validated'::public.import_batch_status else 'ready'::public.import_batch_status end,
    total_count, valid_count, warning_count, invalid_count, caller_id
  ) returning id into created_batch_id;
  insert into public.import_rows (
    organization_id, school_id, batch_id, row_number, raw_data,
    normalized_data, validation_messages, status
  ) select target_organization_id, target_school_id, created_batch_id,
    (value->>'rowNumber')::int, value->'raw', value->'normalized',
    coalesce(value->'messages', '[]'::jsonb), (value->>'status')::public.import_row_status
  from jsonb_array_elements(preview_rows);
  return created_batch_id;
end $$;
revoke all on function public.create_student_import_preview(uuid, uuid, text, jsonb) from public, anon;
grant execute on function public.create_student_import_preview(uuid, uuid, text, jsonb) to authenticated;
