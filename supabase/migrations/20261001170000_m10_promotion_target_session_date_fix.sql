-- Future promotions begin on the configured target-session start date rather
-- than the execution date, preserving enrollment and membership invariants.
create or replace function public.promote_student(target_student_id uuid,source_period uuid,outcome public.promotion_outcome,target_session uuid,target_level uuid,target_arm uuid,idempotency_key text,notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare p public.academic_periods%rowtype; m public.class_memberships%rowtype; promotion_id uuid; enrollment_id uuid; membership_id uuid; target_start date;
begin
 select * into p from public.academic_periods where id=source_period;
 select * into m from public.class_memberships where student_id=target_student_id and academic_session_id=p.session_id and school_id=p.school_id and status='active' for update;
 if not found or not public.can_access_assessments(p.organization_id,p.school_id,'academics.promotions.manage','academics.promotion') then raise exception 'Student promotion unavailable' using errcode='42501'; end if;
 select sp.id into promotion_id from public.student_promotions sp where sp.school_id=p.school_id and sp.idempotency_key=trim($7); if found then return promotion_id; end if;
 if not exists(select 1 from public.result_batches b join public.student_subject_results r on r.batch_id=b.id where b.school_id=p.school_id and b.period_id=p.id and b.class_level_id=m.class_level_id and b.class_arm_id is not distinct from m.class_arm_id and b.status='published' and r.student_id=target_student_id) then raise exception 'Published results are required before promotion' using errcode='23514'; end if;
 if private.assessment_period_locked(p.organization_id,p.school_id,p.session_id,p.id) then raise exception 'Academic period is locked' using errcode='55000'; end if;
 if outcome in ('promoted','repeated') then
  select s.start_date into target_start from public.academic_sessions s where s.id=target_session and s.organization_id=p.organization_id and s.school_id=p.school_id;
  if target_start is null then raise exception 'Target academic session is unavailable' using errcode='23514'; end if;
  insert into public.student_enrollments(organization_id,school_id,student_id,academic_session_id,status,enrolled_on) values(p.organization_id,p.school_id,target_student_id,target_session,'active',target_start) on conflict(student_id,school_id,academic_session_id) do update set updated_at=now() returning id into enrollment_id;
  insert into public.class_memberships(organization_id,school_id,student_id,enrollment_id,academic_session_id,class_level_id,class_arm_id,started_on,status) values(p.organization_id,p.school_id,target_student_id,enrollment_id,target_session,target_level,target_arm,target_start,'active') returning id into membership_id;
 end if;
 insert into public.student_promotions(organization_id,school_id,student_id,source_session_id,source_period_id,source_class_level_id,source_class_arm_id,outcome,target_session_id,target_class_level_id,target_class_arm_id,target_enrollment_id,target_membership_id,idempotency_key,notes)
 values(p.organization_id,p.school_id,target_student_id,p.session_id,p.id,m.class_level_id,m.class_arm_id,outcome,target_session,target_level,target_arm,enrollment_id,membership_id,trim($7),nullif(trim($8),'')) returning id into promotion_id;
 return promotion_id;
end $$;

revoke all on function public.promote_student(uuid,uuid,public.promotion_outcome,uuid,uuid,uuid,text,text) from public,anon;
grant execute on function public.promote_student(uuid,uuid,public.promotion_outcome,uuid,uuid,uuid,text,text) to authenticated;
