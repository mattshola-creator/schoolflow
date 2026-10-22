-- Reject ambiguous or malformed school scope before reporting aggregation/audit effects.
CREATE OR REPLACE FUNCTION public.management_dashboard(org uuid, requested_schools uuid[], session uuid DEFAULT NULL::uuid, period uuid DEFAULT NULL::uuid, date_from date DEFAULT (CURRENT_DATE - 30), date_to date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare sid uuid; rows jsonb:='[]'::jsonb; allowed uuid[]:='{}'; summary jsonb;
begin
 if requested_schools is null or coalesce(array_ndims(requested_schools),0) <> 1 or cardinality(requested_schools) not between 1 and 100 then
  raise exception 'Select between 1 and 100 unique schools' using errcode='22023';
 end if;
 if array_position(requested_schools,null) is not null or cardinality(requested_schools) <> (select count(distinct selected_school) from unnest(requested_schools) selected_school) then
  raise exception 'School selections must be unique and non-null' using errcode='22023';
 end if;

 if auth.uid() is null or not public.has_org_membership(org) or date_from>date_to or date_to-date_from>366 then raise exception 'Invalid reporting request' using errcode='42501'; end if;
 foreach sid in array requested_schools loop
  if not public.can_access_reporting(org,sid,'reporting.dashboard.view','reporting.management_dashboard') then raise exception 'School reporting scope denied' using errcode='42501'; end if;
  if cardinality(requested_schools)>1 and not public.can_access_reporting(org,sid,'reporting.cross_school.view','reporting.management_dashboard') then raise exception 'Cross-school reporting is not authorized' using errcode='42501'; end if;
  allowed:=array_append(allowed,sid); summary:=private.reporting_school_summary(org,sid,session,period,date_from,date_to); rows:=rows||jsonb_build_array(summary);
 end loop;
 if cardinality(allowed)=0 then raise exception 'At least one authorized school is required' using errcode='23514'; end if;
 return jsonb_build_object('organizationId',org,'schoolIds',to_jsonb(allowed),'dateFrom',date_from,'dateTo',date_to,'schools',rows);
end $function$;

CREATE OR REPLACE FUNCTION public.record_reporting_export(org uuid, school_ids uuid[], report_key text, filters jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare sid uuid; result uuid;
begin
 if school_ids is null or coalesce(array_ndims(school_ids),0) <> 1 or cardinality(school_ids) not between 1 and 100 then
  raise exception 'Select between 1 and 100 unique schools' using errcode='22023';
 end if;
 if array_position(school_ids,null) is not null or cardinality(school_ids) <> (select count(distinct selected_school) from unnest(school_ids) selected_school) then
  raise exception 'School selections must be unique and non-null' using errcode='22023';
 end if;

 if cardinality(school_ids)=0 then raise exception 'At least one authorized school is required' using errcode='23514'; end if;
 foreach sid in array school_ids loop if not public.can_access_reporting(org,sid,'reporting.export','reporting.exports') or not public.can_access_reporting(org,sid,'reporting.school.view','reporting.standard_reports') then raise exception 'Export scope denied' using errcode='42501'; end if; end loop;
 insert into public.reporting_access_events(organization_id,school_ids,event_kind,report_key,filters) values(org,school_ids,'export',report_key,filters) returning id into result; return result;
end $function$;

CREATE OR REPLACE FUNCTION public.reporting_global_search(org uuid, school_ids uuid[], query_text text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare sid uuid; allowed uuid[]:='{}'; q text:=trim(query_text); result jsonb;
begin
 if school_ids is null or coalesce(array_ndims(school_ids),0) <> 1 or cardinality(school_ids) not between 1 and 100 then
  raise exception 'Select between 1 and 100 unique schools' using errcode='22023';
 end if;
 if array_position(school_ids,null) is not null or cardinality(school_ids) <> (select count(distinct selected_school) from unnest(school_ids) selected_school) then
  raise exception 'School selections must be unique and non-null' using errcode='22023';
 end if;

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
end $function$;
