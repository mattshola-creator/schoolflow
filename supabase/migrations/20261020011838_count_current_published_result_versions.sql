-- Management aggregates count the latest published version per score-sheet context.
-- Historical snapshots remain immutable; drafts do not hide the last publication.
CREATE OR REPLACE FUNCTION private.reporting_school_summary(org uuid, school uuid, session uuid, period uuid, date_from date, date_to date)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 with current_publications as (
   select distinct on (rb.session_id, rb.period_id, rb.class_level_id, rb.class_arm_id, rb.subject_id) rp.*
   from public.result_publications rp
   join public.result_batches rb on rb.id = rp.batch_id
   where rp.organization_id = org and rp.school_id = school
     and rb.organization_id = org and rb.school_id = school
     and (session is null or rb.session_id = session)
     and (period is null or rb.period_id = period)
   order by rb.session_id, rb.period_id, rb.class_level_id, rb.class_arm_id, rb.subject_id, rb.version desc
 )
 select jsonb_build_object(
  'schoolId',s.id,'schoolName',s.name,
  'students',jsonb_build_object(
   'activeEnrollments',(select count(*) from public.student_enrollments e where e.organization_id=org and e.school_id=school and e.status='active' and (session is null or e.academic_session_id=session)),
   'female',(select count(*) from public.student_enrollments e join public.student_profiles sp on sp.id=e.student_id where e.organization_id=org and e.school_id=school and e.status='active' and lower(sp.gender)='female' and (session is null or e.academic_session_id=session)),
   'male',(select count(*) from public.student_enrollments e join public.student_profiles sp on sp.id=e.student_id where e.organization_id=org and e.school_id=school and e.status='active' and lower(sp.gender)='male' and (session is null or e.academic_session_id=session))
  ),
  'admissions',jsonb_build_object(
   'applications',(select count(*) from public.admission_applications a where a.organization_id=org and a.school_id=school and (session is null or a.academic_session_id=session)),
   'accepted',(select count(*) from public.admission_applications a where a.organization_id=org and a.school_id=school and a.status in ('accepted','enrollment_pending','enrolled') and (session is null or a.academic_session_id=session)),
   'enrolled',(select count(*) from public.admission_applications a where a.organization_id=org and a.school_id=school and a.status='enrolled' and (session is null or a.academic_session_id=session))
  ),
  'attendance',jsonb_build_object(
   'entries',(select count(*) from public.student_attendance_entries e join public.student_attendance_registers r on r.id=e.register_id where e.organization_id=org and e.school_id=school and (session is null or r.session_id=session) and r.attendance_date between date_from and date_to),
   'present',(select count(*) from public.student_attendance_entries e join public.student_attendance_registers r on r.id=e.register_id where e.organization_id=org and e.school_id=school and e.status in ('present','late') and (session is null or r.session_id=session) and r.attendance_date between date_from and date_to),
   'absent',(select count(*) from public.student_attendance_entries e join public.student_attendance_registers r on r.id=e.register_id where e.organization_id=org and e.school_id=school and e.status='absent' and (session is null or r.session_id=session) and r.attendance_date between date_from and date_to),
   'late',(select count(*) from public.student_attendance_entries e join public.student_attendance_registers r on r.id=e.register_id where e.organization_id=org and e.school_id=school and e.status='late' and (session is null or r.session_id=session) and r.attendance_date between date_from and date_to)
  ),
  'staff',jsonb_build_object('activeAssignments',(select count(*) from public.staff_assignments a where a.organization_id=org and a.school_id=school and a.status='active')),
  'teaching',jsonb_build_object(
   'approvedPlans',(select count(*) from public.lesson_plans l where l.organization_id=org and l.school_id=school and l.status='approved' and (session is null or l.session_id=session) and (period is null or l.academic_period_id=period) and l.lesson_date between date_from and date_to),
   'deliveredLessons',(select count(*) from public.lesson_deliveries l where l.organization_id=org and l.school_id=school and l.status in ('delivered','partially_delivered') and (session is null or l.session_id=session) and (period is null or l.academic_period_id=period) and l.delivered_on between date_from and date_to)
  ),
  'finance',jsonb_build_object(
   'billed',coalesce((select sum(c.original_amount) from public.student_charges c where c.organization_id=org and c.school_id=school and c.status<>'reversed' and (session is null or c.session_id=session) and (period is null or c.period_id=period)),0)::text,
   'collected',coalesce((select sum(p.amount) from public.payments p where p.organization_id=org and p.school_id=school and p.status='verified' and p.paid_at::date between date_from and date_to and (session is null or p.academic_session_id=session) and (period is null or p.academic_period_id=period)),0)::text,
   'outstanding',coalesce((select sum(b.outstanding_amount) from public.student_finance_balances b where b.organization_id=org and b.school_id=school),0)::text,
   'expenses',coalesce((select sum(coalesce(e.approved_amount,e.requested_amount)) from public.expenses e where e.organization_id=org and e.school_id=school and e.status in ('approved','paid','completed') and e.expense_date between date_from and date_to and (session is null or e.academic_session_id=session) and (period is null or e.academic_period_id=period)),0)::text,
   'otherIncome',coalesce((select sum(i.amount) from public.other_income i where i.organization_id=org and i.school_id=school and i.received_at::date between date_from and date_to),0)::text
  ),
  'results',jsonb_build_object(
   'publishedBatches',(select count(*) from current_publications rp join public.result_batches rb on rb.id=rp.batch_id where rp.organization_id=org and rp.school_id=school and (session is null or rb.session_id=session) and (period is null or rb.period_id=period)),
   'publishedResults',(select count(*) from current_publications rp join public.result_batches rb on rb.id=rp.batch_id cross join lateral jsonb_array_elements(rp.snapshot->'results') item where rp.organization_id=org and rp.school_id=school and (session is null or rb.session_id=session) and (period is null or rb.period_id=period)),
   'passedResults',(select count(*) from current_publications rp join public.result_batches rb on rb.id=rp.batch_id cross join lateral jsonb_array_elements(rp.snapshot->'results') item where rp.organization_id=org and rp.school_id=school and (item->>'is_pass')::boolean and (session is null or rb.session_id=session) and (period is null or rb.period_id=period)),
   'gradeDistribution',(select coalesce(jsonb_object_agg(grade,total),'{}'::jsonb) from (select item->>'grade' grade,count(*) total from current_publications rp join public.result_batches rb on rb.id=rp.batch_id cross join lateral jsonb_array_elements(rp.snapshot->'results') item where rp.organization_id=org and rp.school_id=school and (session is null or rb.session_id=session) and (period is null or rb.period_id=period) group by item->>'grade') grades),
   'promoted',(select count(*) from public.student_promotions p where p.organization_id=org and p.school_id=school and p.outcome='promoted' and (session is null or p.source_session_id=session) and (period is null or p.source_period_id=period))
  ),
  'communication',jsonb_build_object(
   'publishedNotices',(select count(*) from public.communication_notices n where n.organization_id=org and n.school_id=school and n.status='published' and n.published_at::date between date_from and date_to),
   'noticeReads',(select count(*) from public.communication_notice_reads nr join public.communication_notices n on n.id=nr.notice_id where n.organization_id=org and n.school_id=school and nr.read_at::date between date_from and date_to)
  ),
  'operations',jsonb_build_object(
   'openTasks',(select count(*) from public.action_tasks t where t.organization_id=org and t.school_id=school and t.status in ('open','in_progress')),
   'overdueTasks',(select count(*) from public.action_tasks t where t.organization_id=org and t.school_id=school and t.status in ('open','in_progress') and t.due_at<now()),
   'pendingLessonPlans',(select count(*) from public.lesson_plans l where l.organization_id=org and l.school_id=school and l.status='submitted' and (session is null or l.session_id=session) and (period is null or l.academic_period_id=period))
  )
 ) from public.schools s where s.id=school and s.organization_id=org
$function$;

revoke all on function private.reporting_school_summary(uuid,uuid,uuid,uuid,date,date) from public,anon,authenticated;
