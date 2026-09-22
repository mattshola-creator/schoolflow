-- Preserve enum typing explicitly in the assessment-driven application transition.
create or replace function public.record_entrance_assessment(
  target_application_id uuid, target_scheduled_at timestamptz, target_score numeric default null,
  target_maximum_score numeric default null, target_notes text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare app public.admission_applications; attempt_id uuid; next_attempt smallint; next_status public.assessment_attempt_status;
begin
  select * into app from public.admission_applications where id=target_application_id for update;
  if app.id is null or not public.can_access_admissions(app.organization_id,app.school_id,'admissions.assess') then
    raise exception 'Application is unavailable' using errcode='42501';
  end if;
  if app.status not in ('under_review','exam_scheduled','exam_taken','under_assessment','retake') then
    raise exception 'Application is not ready for assessment' using errcode='22023'; end if;
  if target_score is not null and (target_maximum_score is null or target_maximum_score <= 0 or target_score < 0 or target_score > target_maximum_score) then
    raise exception 'Assessment score is invalid' using errcode='22023'; end if;
  select coalesce(max(attempt_number),0)+1 into next_attempt from public.entrance_assessment_attempts where application_id=app.id;
  next_status := case when target_score is null then 'scheduled' else 'completed' end;
  insert into public.entrance_assessment_attempts(organization_id,school_id,application_id,attempt_number,status,scheduled_at,completed_at,score,maximum_score,assessor_notes)
  values(app.organization_id,app.school_id,app.id,next_attempt,next_status,target_scheduled_at,case when target_score is null then null else now() end,target_score,target_maximum_score,nullif(trim(target_notes),'')) returning id into attempt_id;
  update public.admission_applications
  set status=(case when target_score is null then 'exam_scheduled' else 'under_assessment' end)::public.admission_application_status,
      updated_by=auth.uid(),updated_at=now()
  where id=app.id;
  return attempt_id;
end $$;
revoke all on function public.record_entrance_assessment(uuid,timestamptz,numeric,numeric,text) from public, anon;
grant execute on function public.record_entrance_assessment(uuid,timestamptz,numeric,numeric,text) to authenticated;
