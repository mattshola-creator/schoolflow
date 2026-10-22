-- Only future publications capture identity. Existing immutable versions are never rewritten.
CREATE OR REPLACE FUNCTION public.transition_result_batch(target_batch_id uuid, target_status result_batch_status)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare b public.result_batches%rowtype; needed text;
begin
 select * into b from public.result_batches where id=target_batch_id for update;
 if not found then raise exception 'Result batch unavailable' using errcode='P0002'; end if;
 needed := case target_status when 'submitted' then 'academics.scores.submit' when 'reviewed' then 'academics.results.review' when 'approved' then 'academics.results.approve' when 'published' then 'academics.results.publish' else null end;
 if needed is null or not public.can_access_assessments(b.organization_id,b.school_id,needed,case when target_status='submitted' then 'academics.score_entry' else 'academics.result_workflow' end) then raise exception 'Result transition unavailable' using errcode='42501'; end if;
 if private.assessment_period_locked(b.organization_id,b.school_id,b.session_id,b.period_id) then raise exception 'Academic period is locked' using errcode='55000'; end if;
 if not ((b.status in ('draft','reopened') and target_status='submitted') or (b.status='submitted' and target_status='reviewed') or (b.status='reviewed' and target_status='approved') or (b.status='approved' and target_status='published')) then raise exception 'Invalid result transition' using errcode='23514'; end if;
 if target_status='submitted' then perform private.compute_result_batch(b.id); end if;
 update public.result_batches set status=target_status,updated_by=auth.uid(),updated_at=now(),
  submitted_by=case when target_status='submitted' then auth.uid() else submitted_by end, submitted_at=case when target_status='submitted' then now() else submitted_at end,
  reviewed_by=case when target_status='reviewed' then auth.uid() else reviewed_by end, reviewed_at=case when target_status='reviewed' then now() else reviewed_at end,
  approved_by=case when target_status='approved' then auth.uid() else approved_by end, approved_at=case when target_status='approved' then now() else approved_at end,
  published_by=case when target_status='published' then auth.uid() else published_by end, published_at=case when target_status='published' then now() else published_at end where id=b.id;
 if target_status='published' then
  insert into public.result_publications(organization_id,school_id,batch_id,version,snapshot,published_by)
  select b.organization_id,b.school_id,b.id,b.version,jsonb_build_object('schemaVersion',2,'batch',jsonb_build_object('sessionId',b.session_id,'periodId',b.period_id,'classLevelId',b.class_level_id,'classArmId',b.class_arm_id,'subjectId',b.subject_id,'schemeId',b.scheme_id,'version',b.version),'results',coalesce(jsonb_agg(to_jsonb(r)||jsonb_build_object('student_identity',jsonb_build_object('studentNumber',sp.student_number,'firstName',person.first_name,'lastName',person.last_name)) order by r.student_id),'[]'::jsonb)),auth.uid() from public.student_subject_results r join public.student_profiles sp on sp.id=r.student_id and sp.organization_id=b.organization_id join public.people person on person.id=sp.person_id where r.batch_id=b.id;
 end if;
end $function$;

