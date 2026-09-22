create or replace function public.review_admission_document(
  target_requirement_id uuid, target_status public.admission_document_status, target_comment text default null
) returns public.admission_document_status language plpgsql security definer set search_path = '' as $$
declare requirement public.admission_application_documents; caller uuid := (select auth.uid()); satisfied boolean;
begin
  select * into requirement from public.admission_application_documents where id = target_requirement_id for update;
  if requirement.id is null or not public.can_access_admissions(
    requirement.organization_id, requirement.school_id, 'admissions.documents.review'
  ) then raise exception 'Document requirement is unavailable' using errcode = '42501'; end if;
  if target_status in ('verified','rejected') and requirement.status <> 'submitted' then
    raise exception 'Submitted evidence is required' using errcode = '22023'; end if;
  if target_status = 'not_applicable' and (
    not requirement.not_applicable_allowed or nullif(trim(target_comment),'') is null
  ) then raise exception 'Not applicable is unavailable' using errcode = '22023'; end if;
  if target_status not in ('verified','rejected','not_applicable') then
    raise exception 'Review decision is invalid' using errcode = '22023'; end if;
  update public.admission_application_documents set
    status = target_status,
    document_id = case when target_status = 'not_applicable' then null else document_id end,
    reviewed_by = caller, reviewed_at = now(), review_comment = nullif(trim(target_comment),''), updated_at = now()
  where id = requirement.id;
  select exists(select 1 from public.admission_application_documents where application_id = requirement.application_id and required)
    and not exists(
      select 1 from public.admission_application_documents
      where application_id = requirement.application_id and required
        and not (status = 'verified' or (status = 'not_applicable' and not_applicable_allowed))
    ) into satisfied;
  update public.admission_checklist_items set
    status = case when satisfied then 'complete'::public.checklist_item_status else 'pending'::public.checklist_item_status end,
    completed_by = case when satisfied then caller else null end,
    completed_at = case when satisfied then now() else null end,
    updated_at = now()
  where application_id = requirement.application_id and key = 'documents';
  return target_status;
end $$;
