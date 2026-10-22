-- Scope non-configurator score entry and submission to a current teaching assignment.
create or replace function private.is_assigned_result_teacher(b public.result_batches)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.teaching_assignments t
  join public.staff_assignments sa on sa.id=t.staff_assignment_id and sa.organization_id=t.organization_id and sa.school_id=t.school_id
  join public.employments e on e.id=sa.employment_id and e.organization_id=t.organization_id
  where t.id=b.teaching_assignment_id and e.user_id=auth.uid()
   and t.organization_id=b.organization_id and t.school_id=b.school_id
   and t.session_id=b.session_id and t.class_level_id=b.class_level_id
   and (t.class_arm_id is null or t.class_arm_id is not distinct from b.class_arm_id)
   and (t.assignment_type='class_teacher' or t.subject_id=b.subject_id)
   and t.status='active' and sa.status='active' and e.status='active'
   and t.started_on<=current_date and (t.ended_on is null or t.ended_on>=current_date)
   and sa.started_on<=current_date and (sa.ended_on is null or sa.ended_on>=current_date)
   and e.started_on<=current_date and (e.ended_on is null or e.ended_on>=current_date)
 )
$$;
revoke all on function private.is_assigned_result_teacher(public.result_batches) from public,anon,authenticated;
CREATE OR REPLACE FUNCTION public.upsert_assessment_score(target_batch_id uuid, target_student_id uuid, target_component_id uuid, target_score numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare b public.result_batches%rowtype; c public.assessment_components%rowtype; score_id uuid; assigned boolean;
begin
 select * into b from public.result_batches where id=target_batch_id for update;
 if not found or not public.can_access_assessments(b.organization_id,b.school_id,'academics.scores.enter','academics.score_entry') then raise exception 'Score sheet unavailable' using errcode='42501'; end if;
 if b.status not in ('draft','reopened') or private.assessment_period_locked(b.organization_id,b.school_id,b.session_id,b.period_id) then raise exception 'Score sheet is not editable' using errcode='55000'; end if;
 select * into c from public.assessment_components where id=target_component_id and scheme_id=b.scheme_id;
 if not found or target_score < 0 or target_score > c.maximum_score then raise exception 'Score is outside the component range' using errcode='23514'; end if;
 if not exists (select 1 from public.class_memberships m where m.student_id=target_student_id and m.organization_id=b.organization_id and m.school_id=b.school_id and m.academic_session_id=b.session_id and m.class_level_id=b.class_level_id and m.class_arm_id is not distinct from b.class_arm_id and m.status='active') then raise exception 'Student is not enrolled in this class' using errcode='23514'; end if;
 if not public.has_permission(b.organization_id,b.school_id,'academics.assessments.configure') and not private.is_assigned_result_teacher(b) then raise exception 'Teacher assignment required' using errcode='42501'; end if;
 insert into public.assessment_scores(organization_id,school_id,batch_id,student_id,component_id,score)
 values(b.organization_id,b.school_id,b.id,target_student_id,c.id,target_score)
 on conflict(batch_id,student_id,component_id) do update set score=excluded.score,updated_by=auth.uid(),updated_at=now()
 returning id into score_id; return score_id;
end $function$;

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
 if target_status='submitted' and not public.has_permission(b.organization_id,b.school_id,'academics.assessments.configure') and not private.is_assigned_result_teacher(b) then raise exception 'Teacher assignment required' using errcode='42501'; end if;
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

-- Workflow fields remain writable only through guarded definer RPCs.
revoke insert on public.result_batches from authenticated;
grant insert (organization_id,school_id,session_id,period_id,class_level_id,class_arm_id,subject_id,scheme_id,teaching_assignment_id)
 on public.result_batches to authenticated;

