-- QA ONLY: project afqykqlxecpzspjoyegc. Stable DEMO26 synthetic dataset.
-- Founder is seed sponsor in required created_by fields; auth.uid() remains NULL.
-- Trigger audit actors therefore accurately indicate an administrative seed, not a live login.
begin;
select pg_advisory_xact_lock(hashtext('schoolflow:afqykqlxecpzspjoyegc:DEMO26:v1'));
do $seed$
declare
 org uuid := '77e48a87-b412-4bf2-be26-c9afd71d2332';
 school uuid := '8e2dd437-6741-4824-807f-4cc3a5c95668';
 sponsor uuid := '9f2ec592-f8a5-4182-9cb5-f05dd9a8d309';
 sess uuid := 'c19ebbbd-66b6-5649-963d-b41ef7165503';
 i int; k int; sec text; levelname text; levelid uuid; pid uuid; gid uuid; sid uuid; eid uuid; aid uuid;
 firstnames text[] := array['Adaora','Tobi','Zainab','Chinedu','Amina','Daniel','Mariam','Emeka','Grace','Yusuf','Toluwani','Ifeoma','David','Fatima','Chisom','Samuel','Ruth','Ibrahim','Esther','Nathaniel','Kemi','Chiamaka','Joshua','Hauwa'];
 surnames text[] := array['Adeyemi','Okafor','Bello','Eze','Ibrahim','Oladipo','Nwosu','Abubakar','Adebayo','Udo','Yusuf','Onyeka'];
begin
 if auth.uid() is not null then raise exception 'Seed must not impersonate an app user'; end if;
 if not exists(select 1 from public.schools where id=school and organization_id=org and name='Cedarbridge Learning Group')
 or not exists(select 1 from public.academic_sessions where id=sess and school_id=school and organization_id=org)
 then raise exception 'QA fixture guard failed'; end if;
 foreach sec in array array['Nursery','Primary','Secondary'] loop
 insert into public.academic_sections(id,organization_id,school_id,name,code,sort_order,created_by,updated_by)
 values(md5('DEMO26:section:'||sec)::uuid,org,school,sec||' Demo','DEMO26_'||upper(left(sec,3)),case sec when 'Nursery' then 10 when 'Primary' then 20 else 30 end,sponsor,sponsor)
 on conflict(id) do nothing;
 end loop;
 for k in 1..14 loop
 sec:=case when k<=2 then 'Nursery' when k<=8 then 'Primary' else 'Secondary' end;
 levelname:=case when k<=2 then 'Nursery '||k when k<=8 then 'Primary '||(k-2) when k<=11 then 'JSS '||(k-8) else 'SSS '||(k-11) end;
 insert into public.class_levels(id,organization_id,school_id,section_id,name,code,sort_order,created_by,updated_by)
 values(md5('DEMO26:level:'||k)::uuid,org,school,md5('DEMO26:section:'||sec)::uuid,levelname||' Demo','DEMO26_L'||k,100+k,sponsor,sponsor) on conflict(id) do nothing;
 end loop;
 for i in 1..168 loop
 k:=1+((i-1)%14); levelid:=md5('DEMO26:level:'||k)::uuid;
 pid:=md5('DEMO26:student-person:'||i)::uuid; gid:=md5('DEMO26:guardian-person:'||i)::uuid;
 sid:=md5('DEMO26:student:'||i)::uuid; eid:=md5('DEMO26:enrollment:'||i)::uuid;
 insert into public.people(id,first_name,last_name,preferred_name) values
 (pid,firstnames[1+((i-1)%24)],surnames[1+((i-1)/24)%12]||' Demo','Synthetic demo learner'),
 (gid,case when i%2=0 then 'Mrs Funmi' else 'Mr Chuka' end,surnames[1+((i-1)/24)%12]||' Demo','Synthetic demo guardian') on conflict(id) do nothing;
 insert into public.student_profiles(id,organization_id,person_id,student_number,date_of_birth,gender,status,created_by,updated_by)
 values(sid,org,pid,'DEMO26-S'||lpad(i::text,3,'0'),make_date(2023-k,1+((i-1)%12),1+((i-1)%27)),case when i%2=0 then 'Male' else 'Female' end,'active',sponsor,sponsor) on conflict(id) do nothing;
 insert into public.student_enrollments(id,organization_id,school_id,student_id,academic_session_id,status,enrolled_on,created_by,updated_by)
 values(eid,org,school,sid,sess,'active','2026-09-07',sponsor,sponsor) on conflict(id) do nothing;
 insert into public.class_memberships(id,organization_id,school_id,student_id,enrollment_id,academic_session_id,class_level_id,started_on,created_by,updated_by)
 values(md5('DEMO26:membership:'||i)::uuid,org,school,sid,eid,sess,levelid,'2026-09-07',sponsor,sponsor) on conflict(id) do nothing;
 insert into public.guardian_relationships(id,organization_id,student_id,guardian_person_id,relationship_type,is_primary_contact,is_financially_responsible,effective_from,created_by,updated_by)
 values(md5('DEMO26:guardian-link:'||i)::uuid,org,sid,gid,'Parent',true,true,'2026-09-07',sponsor,sponsor) on conflict(id) do nothing;
 end loop;
 for i in 1..27 loop
 pid:=md5('DEMO26:staff-person:'||i)::uuid; sid:=md5('DEMO26:staff:'||i)::uuid; eid:=md5('DEMO26:employment:'||i)::uuid;
 insert into public.people(id,first_name,last_name,preferred_name) values(pid,firstnames[1+((i+6)%24)],surnames[1+((i-1)%12)]||' Demo','Synthetic demo staff') on conflict(id) do nothing;
 insert into public.staff_profiles(id,organization_id,person_id,staff_number,work_email,created_by,updated_by)
 values(sid,org,pid,'DEMO26-T'||lpad(i::text,3,'0'),'demo26-staff-'||i||'@schoolflow.test',sponsor,sponsor) on conflict(id) do nothing;
 insert into public.employments(id,organization_id,staff_profile_id,employment_type,status,started_on,created_by,updated_by)
 values(eid,org,sid,'permanent','active','2026-09-01',sponsor,sponsor) on conflict(id) do nothing;
 insert into public.staff_assignments(id,organization_id,school_id,employment_id,staff_profile_id,department_id,position_id,is_primary,status,started_on,created_by,updated_by)
 values(md5('DEMO26:staff-assignment:'||i)::uuid,org,school,eid,sid,'91c6f793-8d7d-4f36-8e05-ee4a55218075','364b1986-9192-4f75-800b-ec9847002692',true,'active','2026-09-01',sponsor,sponsor) on conflict(id) do nothing;
 end loop;
 for i in 1..24 loop
 pid:=md5('DEMO26:applicant-person:'||i)::uuid; gid:=md5('DEMO26:applicant-guardian:'||i)::uuid; aid:=md5('DEMO26:application:'||i)::uuid;
 insert into public.people(id,first_name,last_name,preferred_name) values
 (pid,firstnames[i],surnames[1+((i+3)%12)]||' Demo','Synthetic demo applicant'),
 (gid,'Patience',surnames[1+((i+3)%12)]||' Demo','Synthetic applicant guardian') on conflict(id) do nothing;
 insert into public.admission_applications(id,organization_id,school_id,applicant_person_id,application_number,academic_session_id,applied_class_level_id,date_of_birth,gender,notes,created_by,updated_by)
 values(aid,org,school,pid,'DEMO26-A'||lpad(i::text,3,'0'),sess,md5('DEMO26:level:'||(1+((i-1)%14)))::uuid,make_date(2022-(i%14),1+(i%12),1+(i%27)),case when i%2=0 then 'Male' else 'Female' end,'Fictional customer-demo record. Seeded administratively; workflow acceptance not implied.',sponsor,sponsor) on conflict(id) do nothing;
 insert into public.admission_guardians(id,organization_id,school_id,application_id,guardian_person_id,relationship_type,email,is_primary_contact,is_financially_responsible,created_by)
 values(md5('DEMO26:admission-guardian:'||i)::uuid,org,school,aid,gid,'Parent','demo26-guardian-'||i||'@schoolflow.test',true,true,sponsor) on conflict(id) do nothing;
 insert into public.admission_checklist_items(id,organization_id,school_id,application_id,key,label,required)
 select md5('DEMO26:checklist:'||i||':'||v.key)::uuid,org,school,aid,v.key,v.label,v.required
 from (values('approval','Admission approved',true),('offer_acceptance','Offer accepted',true),('documents','Required documents verified',true),('payment','Payment condition satisfied',false),('placement','Final placement confirmed',true),('guardian','Guardian details complete',true))v(key,label,required) on conflict(id) do nothing;
 end loop;
 if not exists(select 1 from public.audit_events where action='demo.seed.batch' and metadata->>'batch'='DEMO26-v1') then
 insert into public.audit_events(organization_id,school_id,actor_user_id,action,entity_type,metadata)
 values(org,school,null,'demo.seed.batch','synthetic_demo',jsonb_build_object('batch','DEMO26-v1','project','afqykqlxecpzspjoyegc','execution','administrative SQL connector','sponsor_user_id',sponsor,'students',168,'staff',27,'admissions',24,'not_authenticated_acceptance',true));
 end if;
end $seed$;
commit;
select jsonb_build_object('students',(select count(*) from public.student_profiles),'staff',(select count(*) from public.staff_profiles),'admissions',(select count(*) from public.admission_applications),'demo_students',(select count(*) from public.student_profiles where student_number like 'DEMO26-%'),'demo_staff',(select count(*) from public.staff_profiles where staff_number like 'DEMO26-%')) result;