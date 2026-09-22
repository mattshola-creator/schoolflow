-- Preserve enum typing explicitly in the offer-response application transition.
create or replace function public.respond_to_admission_offer(target_application_id uuid, accept_offer boolean)
returns public.offer_status language plpgsql security definer set search_path = '' as $$
declare app public.admission_applications; next_offer public.offer_status; caller uuid:=auth.uid();
begin
  select * into app from public.admission_applications where id=target_application_id for update;
  if app.id is null or app.status <> 'admission_offered' or not public.can_access_admissions(app.organization_id,app.school_id,'admissions.manage') then
    raise exception 'Offer is unavailable' using errcode='42501'; end if;
  next_offer:=case when accept_offer then 'accepted' else 'declined' end;
  update public.admission_offers set status=next_offer,responded_at=now(),updated_at=now() where application_id=app.id and status='issued';
  if not found then raise exception 'Offer is unavailable' using errcode='42501'; end if;
  update public.admission_applications
  set status=(case when accept_offer then 'accepted' else 'withdrawn' end)::public.admission_application_status,
      updated_by=caller,updated_at=now()
  where id=app.id;
  if accept_offer then
    update public.admission_checklist_items set status='complete',completed_by=caller,completed_at=now()
    where application_id=app.id and key='offer_acceptance';
  end if;
  return next_offer;
end $$;
revoke all on function public.respond_to_admission_offer(uuid,boolean) from public, anon;
grant execute on function public.respond_to_admission_offer(uuid,boolean) to authenticated;
