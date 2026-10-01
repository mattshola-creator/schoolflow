-- M12 Management & Reporting. Operational domains remain authoritative;
-- reporting composes scoped aggregates and never owns shadow business data.

create type public.reporting_event_kind as enum ('report_view', 'export', 'global_search', 'period_close', 'session_close', 'session_rollover');

insert into public.product_features (module_id,key,name,description,default_enabled)
select m.id,v.key,v.name,v.description,false from public.product_modules m cross join (values
 ('reporting.management_dashboard','Management dashboard','School and authorized multi-school operational summaries'),
 ('reporting.standard_reports','Standard reports','Scoped student, admissions, attendance, teaching, finance, results, staff and communication reports'),
 ('reporting.global_search','Global search','Permission-aware contextual search across operational domains'),
 ('reporting.exports','Report exports','Server-authorized CSV exports and printable views'),
 ('reporting.academic_rollover','Academic close and rollover','Guided audited period/session close and draft rollover')
) v(key,name,description) where m.key='reporting' on conflict(key) do nothing;

insert into public.permissions(key,description) values
 ('reporting.dashboard.view','View management dashboard'),
 ('reporting.school.view','View standard school reports'),
 ('reporting.cross_school.view','Aggregate explicitly authorized schools'),
 ('reporting.finance.view','View management Finance summaries'),
 ('reporting.academic.view','View academic and result summaries'),
 ('reporting.attendance.view','View attendance summaries'),
 ('reporting.staff.view','View staff and teaching summaries'),
 ('reporting.communication.view','View communication metadata summaries'),
 ('reporting.search','Use permission-aware global search'),
 ('reporting.export','Export authorized report rows'),
 ('reporting.academic_close','Close periods/sessions and prepare rollover')
on conflict(key) do nothing;

insert into public.role_permissions(organization_id,role_id,permission_id)
select r.organization_id,r.id,p.id from public.roles r cross join public.permissions p
where r.key='organization_owner' and p.key like 'reporting.%' on conflict do nothing;

create table public.reporting_access_events (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_ids uuid[] not null,
 event_kind public.reporting_event_kind not null, report_key text not null,
 filters jsonb not null default '{}'::jsonb check(jsonb_typeof(filters)='object'),
 actor_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
 occurred_at timestamptz not null default now(),
 foreign key(organization_id) references public.organizations(id) on delete restrict,
 check(cardinality(school_ids) between 1 and 100),
 check(char_length(trim(report_key)) between 2 and 80)
);
create index reporting_access_events_scope_idx on public.reporting_access_events(organization_id,occurred_at desc,event_kind);
alter table public.reporting_access_events enable row level security;

create or replace function public.can_access_reporting(org uuid,school uuid,perm text,feature text)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null
 and feature in ('reporting.management_dashboard','reporting.standard_reports','reporting.global_search','reporting.exports','reporting.academic_rollover')
 and public.has_org_membership(org)
 and (school is null or public.has_school_membership(org,school))
 and public.has_permission(org,school,perm)
 and public.has_module_entitlement(org,'reporting')
 and public.is_feature_enabled(org,feature)
$$;
revoke all on function public.can_access_reporting(uuid,uuid,text,text) from public,anon;
grant execute on function public.can_access_reporting(uuid,uuid,text,text) to authenticated;

create policy reporting_events_select on public.reporting_access_events for select to authenticated
using(public.can_access_reporting(organization_id,null,'reporting.dashboard.view','reporting.management_dashboard'));
revoke all on public.reporting_access_events from anon,authenticated;
grant select on public.reporting_access_events to authenticated;

create or replace function private.reporting_school_summary(org uuid,school uuid,session uuid,period uuid,date_from date,date_to date)
returns jsonb language sql stable security definer set search_path='' as $$
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
   'publishedBatches',(select count(*) from public.result_publications rp join public.result_batches rb on rb.id=rp.batch_id where rp.organization_id=org and rp.school_id=school and (session is null or rb.session_id=session) and (period is null or rb.period_id=period)),
   'publishedResults',(select count(*) from public.result_publications rp join public.result_batches rb on rb.id=rp.batch_id cross join lateral jsonb_array_elements(rp.snapshot->'results') item where rp.organization_id=org and rp.school_id=school and (session is null or rb.session_id=session) and (period is null or rb.period_id=period)),
   'passedResults',(select count(*) from public.result_publications rp join public.result_batches rb on rb.id=rp.batch_id cross join lateral jsonb_array_elements(rp.snapshot->'results') item where rp.organization_id=org and rp.school_id=school and (item->>'is_pass')::boolean and (session is null or rb.session_id=session) and (period is null or rb.period_id=period)),
   'gradeDistribution',(select coalesce(jsonb_object_agg(grade,total),'{}'::jsonb) from (select item->>'grade' grade,count(*) total from public.result_publications rp join public.result_batches rb on rb.id=rp.batch_id cross join lateral jsonb_array_elements(rp.snapshot->'results') item where rp.organization_id=org and rp.school_id=school and (session is null or rb.session_id=session) and (period is null or rb.period_id=period) group by item->>'grade') grades),
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
$$;
revoke all on function private.reporting_school_summary(uuid,uuid,uuid,uuid,date,date) from public,anon,authenticated;

create or replace function public.reporting_scope(org uuid)
returns table(school_id uuid,school_name text,location_name text,can_cross_school boolean)
language sql stable security definer set search_path='' as $$
 select s.id,s.name,l.name,
        public.can_access_reporting(org,s.id,'reporting.cross_school.view','reporting.management_dashboard')
 from public.schools s
 left join public.locations l on l.id=s.location_id
 where s.organization_id=org
   and public.can_access_reporting(org,s.id,'reporting.dashboard.view','reporting.management_dashboard')
 order by s.name
$$;
revoke all on function public.reporting_scope(uuid) from public,anon;
grant execute on function public.reporting_scope(uuid) to authenticated;

create or replace function public.management_dashboard(org uuid,requested_schools uuid[],session uuid default null,period uuid default null,date_from date default (current_date-30),date_to date default current_date)
returns jsonb language plpgsql security definer set search_path='' as $$
declare sid uuid; rows jsonb:='[]'::jsonb; allowed uuid[]:='{}'; summary jsonb;
begin
 if auth.uid() is null or not public.has_org_membership(org) or date_from>date_to or date_to-date_from>366 then raise exception 'Invalid reporting request' using errcode='42501'; end if;
 foreach sid in array requested_schools loop
  if not public.can_access_reporting(org,sid,'reporting.dashboard.view','reporting.management_dashboard') then raise exception 'School reporting scope denied' using errcode='42501'; end if;
  if cardinality(requested_schools)>1 and not public.can_access_reporting(org,sid,'reporting.cross_school.view','reporting.management_dashboard') then raise exception 'Cross-school reporting is not authorized' using errcode='42501'; end if;
  allowed:=array_append(allowed,sid); summary:=private.reporting_school_summary(org,sid,session,period,date_from,date_to); rows:=rows||jsonb_build_array(summary);
 end loop;
 if cardinality(allowed)=0 then raise exception 'At least one authorized school is required' using errcode='23514'; end if;
 return jsonb_build_object('organizationId',org,'schoolIds',to_jsonb(allowed),'dateFrom',date_from,'dateTo',date_to,'schools',rows);
end $$;
revoke all on function public.management_dashboard(uuid,uuid[],uuid,uuid,date,date) from public,anon;
grant execute on function public.management_dashboard(uuid,uuid[],uuid,uuid,date,date) to authenticated;

create or replace function public.reporting_global_search(org uuid,school_ids uuid[],query_text text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare sid uuid; allowed uuid[]:='{}'; q text:=trim(query_text); result jsonb;
begin
 if char_length(q)<2 or char_length(q)>100 then raise exception 'Search unavailable' using errcode='42501'; end if;
 foreach sid in array school_ids loop if not public.can_access_reporting(org,sid,'reporting.search','reporting.global_search') then raise exception 'School search scope denied' using errcode='42501'; end if; allowed:=array_append(allowed,sid); end loop;
 if cardinality(allowed)=0 then raise exception 'At least one authorized school is required' using errcode='23514'; end if;
 select coalesce(jsonb_agg(x order by x->>'label'),'[]'::jsonb) into result from (
  (select jsonb_build_object('kind','student','id',sp.id,'schoolId',e.school_id,'label',p.first_name||' '||p.last_name,'context',sp.student_number) x from public.student_profiles sp join public.people p on p.id=sp.person_id join public.student_enrollments e on e.student_id=sp.id and e.status='active' where sp.organization_id=org and e.school_id=any(allowed) and (p.first_name||' '||p.last_name||' '||sp.student_number) ilike '%'||q||'%' limit 20)
  union all (select jsonb_build_object('kind','applicant','id',a.id,'schoolId',a.school_id,'label',p.first_name||' '||p.last_name,'context',a.application_number) from public.admission_applications a join public.people p on p.id=a.applicant_person_id where a.organization_id=org and a.school_id=any(allowed) and (p.first_name||' '||p.last_name||' '||a.application_number) ilike '%'||q||'%' limit 20)
  union all (select jsonb_build_object('kind','staff','id',sp.id,'schoolId',sa.school_id,'label',p.first_name||' '||p.last_name,'context',sp.staff_number) from public.staff_profiles sp join public.people p on p.id=sp.person_id join public.staff_assignments sa on sa.staff_profile_id=sp.id and sa.status='active' where sp.organization_id=org and sa.school_id=any(allowed) and (p.first_name||' '||p.last_name||' '||sp.staff_number) ilike '%'||q||'%' limit 20)
  union all (select jsonb_build_object('kind','guardian','id',gr.id,'schoolId',e.school_id,'label',p.first_name||' '||p.last_name,'context',gr.relationship_type) from public.guardian_relationships gr join public.people p on p.id=gr.guardian_person_id join public.student_enrollments e on e.student_id=gr.student_id and e.status='active' where gr.organization_id=org and gr.effective_to is null and e.school_id=any(allowed) and (p.first_name||' '||p.last_name) ilike '%'||q||'%' group by gr.id,e.school_id,p.first_name,p.last_name,gr.relationship_type limit 20)
  union all (select jsonb_build_object('kind','receipt','id',r.id,'schoolId',r.school_id,'label',r.receipt_number,'context',coalesce(r.payer_name_snapshot,'')) from public.receipts r where r.organization_id=org and r.school_id=any(allowed) and (r.receipt_number||' '||coalesce(r.payer_name_snapshot,'')) ilike '%'||q||'%' limit 20)
  union all (select jsonb_build_object('kind','document','id',d.id,'schoolId',d.school_id,'label',d.title,'context',d.original_filename) from public.documents d where d.organization_id=org and d.school_id=any(allowed) and (d.title||' '||d.original_filename) ilike '%'||q||'%' limit 20)
 ) search_rows;
 insert into public.reporting_access_events(organization_id,school_ids,event_kind,report_key,filters) values(org,allowed,'global_search','global_search',jsonb_build_object('queryLength',char_length(q)));
 return result;
end $$;
revoke all on function public.reporting_global_search(uuid,uuid[],text) from public,anon;
grant execute on function public.reporting_global_search(uuid,uuid[],text) to authenticated;

create or replace function public.record_reporting_export(org uuid,school_ids uuid[],report_key text,filters jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare sid uuid; result uuid;
begin
 if cardinality(school_ids)=0 then raise exception 'At least one authorized school is required' using errcode='23514'; end if;
 foreach sid in array school_ids loop if not public.can_access_reporting(org,sid,'reporting.export','reporting.exports') or not public.can_access_reporting(org,sid,'reporting.school.view','reporting.standard_reports') then raise exception 'Export scope denied' using errcode='42501'; end if; end loop;
 insert into public.reporting_access_events(organization_id,school_ids,event_kind,report_key,filters) values(org,school_ids,'export',report_key,filters) returning id into result; return result;
end $$;
revoke all on function public.record_reporting_export(uuid,uuid[],text,jsonb) from public,anon;
grant execute on function public.record_reporting_export(uuid,uuid[],text,jsonb) to authenticated;

create or replace function public.close_academic_period(target_period uuid,reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare p public.academic_periods%rowtype;
begin select * into p from public.academic_periods where id=target_period for update;
 if p.id is null or not public.can_access_reporting(p.organization_id,p.school_id,'reporting.academic_close','reporting.academic_rollover') then raise exception 'Period close denied' using errcode='42501'; end if;
 if char_length(trim(reason))<3 then raise exception 'Close reason is required' using errcode='23514'; end if;
 if p.status='closed' then return p.id; end if; if p.status<>'current' then raise exception 'Only a current period can be closed' using errcode='23514'; end if;
 update public.academic_periods set status='closed',updated_by=auth.uid(),updated_at=now() where id=p.id;
 insert into public.academic_locks(organization_id,school_id,scope,session_id,period_id,reason,locked_by) values(p.organization_id,p.school_id,'period',p.session_id,p.id,trim(reason),auth.uid()) on conflict do nothing;
 insert into public.reporting_access_events(organization_id,school_ids,event_kind,report_key,filters) values(p.organization_id,array[p.school_id],'period_close','academic_period',jsonb_build_object('periodId',p.id,'reason',trim(reason)));
 return p.id;
end $$;

create or replace function public.close_academic_session(target_session uuid,reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare s public.academic_sessions%rowtype;
begin select * into s from public.academic_sessions where id=target_session for update;
 if s.id is null or not public.can_access_reporting(s.organization_id,s.school_id,'reporting.academic_close','reporting.academic_rollover') then raise exception 'Session close denied' using errcode='42501'; end if;
 if char_length(trim(reason))<3 then raise exception 'Close reason is required' using errcode='23514'; end if;
 if exists(select 1 from public.academic_periods p where p.session_id=s.id and p.status not in ('closed','archived')) then raise exception 'All periods must be closed first' using errcode='23514'; end if;
 if s.status='closed' then return s.id; end if; if s.status<>'current' then raise exception 'Only a current session can be closed' using errcode='23514'; end if;
 update public.academic_sessions set status='closed',updated_by=auth.uid(),updated_at=now() where id=s.id;
 insert into public.academic_locks(organization_id,school_id,scope,session_id,reason,locked_by) values(s.organization_id,s.school_id,'session',s.id,trim(reason),auth.uid()) on conflict do nothing;
 insert into public.reporting_access_events(organization_id,school_ids,event_kind,report_key,filters) values(s.organization_id,array[s.school_id],'session_close','academic_session',jsonb_build_object('sessionId',s.id,'reason',trim(reason)));
 return s.id;
end $$;

create or replace function public.prepare_session_rollover(source_session uuid,target_name text,target_start date,target_end date,idempotency_key uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare source public.academic_sessions%rowtype; result uuid; delta integer; p record; new_period uuid; f record; new_structure uuid; next_version integer;
begin select * into source from public.academic_sessions where id=source_session for update;
 if source.id is null or not public.can_access_reporting(source.organization_id,source.school_id,'reporting.academic_close','reporting.academic_rollover') then raise exception 'Rollover denied' using errcode='42501'; end if;
 if source.status<>'closed' then raise exception 'Source session must be closed' using errcode='23514'; end if;
 select (filters->>'targetSessionId')::uuid into result from public.reporting_access_events where organization_id=source.organization_id and event_kind='session_rollover' and filters->>'idempotencyKey'=idempotency_key::text limit 1;
 if result is not null then return result; end if;
 insert into public.academic_sessions(organization_id,school_id,name,start_date,end_date,status,created_by,updated_by) values(source.organization_id,source.school_id,trim(target_name),target_start,target_end,'planned',auth.uid(),auth.uid()) returning id into result;
 delta:=target_start-source.start_date;
 for p in select * from public.academic_periods where session_id=source.id order by sequence loop
  insert into public.academic_periods(organization_id,school_id,session_id,name,sequence,start_date,end_date,status,created_by,updated_by) values(source.organization_id,source.school_id,result,p.name,p.sequence,p.start_date+delta,p.end_date+delta,'planned',auth.uid(),auth.uid()) returning id into new_period;
 end loop;
 for f in select * from public.fee_structures where session_id=source.id and status='active' loop
  select id into new_period from public.academic_periods where session_id=result and sequence=(select sequence from public.academic_periods where id=f.period_id);
  select coalesce(max(version),0)+1 into next_version from public.fee_structures where organization_id=f.organization_id and school_id=f.school_id and name=f.name;
  insert into public.fee_structures(organization_id,school_id,session_id,period_id,class_level_id,student_category_id,name,version,currency_code,effective_from,effective_to,status,created_by,updated_by) values(f.organization_id,f.school_id,result,case when f.period_id is null then null else new_period end,f.class_level_id,f.student_category_id,f.name,next_version,f.currency_code,f.effective_from+delta,case when f.effective_to is null then null else f.effective_to+delta end,'draft',auth.uid(),auth.uid()) returning id into new_structure;
  insert into public.fee_structure_items(organization_id,school_id,fee_structure_id,fee_category_id,amount,due_date,installment_sequence,incentive_amount,penalty_amount,created_by) select organization_id,school_id,new_structure,fee_category_id,amount,case when due_date is null then null else due_date+delta end,installment_sequence,incentive_amount,penalty_amount,auth.uid() from public.fee_structure_items where fee_structure_id=f.id;
 end loop;
 insert into public.reporting_access_events(organization_id,school_ids,event_kind,report_key,filters) values(source.organization_id,array[source.school_id],'session_rollover','academic_session',jsonb_build_object('sourceSessionId',source.id,'targetSessionId',result,'idempotencyKey',idempotency_key));
 return result;
end $$;

revoke all on function public.close_academic_period(uuid,text),public.close_academic_session(uuid,text),public.prepare_session_rollover(uuid,text,date,date,uuid) from public,anon;
grant execute on function public.close_academic_period(uuid,text),public.close_academic_session(uuid,text),public.prepare_session_rollover(uuid,text,date,date,uuid) to authenticated;

comment on function public.management_dashboard(uuid,uuid[],uuid,uuid,date,date) is 'M12 scoped authoritative dashboard; money is returned as exact numeric text.';
comment on table public.reporting_access_events is 'Minimal audit evidence for sensitive report/export/search/close operations; never stores report contents.';
