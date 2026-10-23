-- QA ONLY DEMO26 teaching/attendance, administrative seed; not live acceptance.
begin;
select pg_advisory_xact_lock(hashtext('schoolflow:afqykqlxecpzspjoyegc:DEMO26:v2'));
do $seed$
declare org uuid:='77e48a87-b412-4bf2-be26-c9afd71d2332'; school uuid:='8e2dd437-6741-4824-807f-4cc3a5c95668'; sponsor uuid:='9f2ec592-f8a5-4182-9cb5-f05dd9a8d309'; sess uuid:='c19ebbbd-66b6-5649-963d-b41ef7165503';
 k int; j int; d int; i int; reg uuid; ta uuid; subj uuid; lp uuid; dt date; names text[]:=array['Mathematics','English Language','Basic Science','Digital Literacy'];
begin
 if auth.uid() is not null or not exists(select 1 from public.student_profiles where student_number='DEMO26-S168' and organization_id=org) then raise exception 'QA batch prerequisite failed'; end if;
 for j in 1..4 loop
 insert into public.subjects(id,organization_id,school_id,name,code,description,sort_order,created_by,updated_by)
 values(md5('DEMO26:subject:'||j)::uuid,org,school,names[j]||' Demo','DEMO26_S'||j,'Fictional demonstration curriculum',100+j,sponsor,sponsor) on conflict(id) do nothing;
 end loop;
 for d in 1..5 loop
 for j in 1..4 loop
 insert into public.timetable_periods(id,organization_id,school_id,session_id,weekday,name,starts_at,ends_at,sort_order,created_by,updated_by)
 values(md5('DEMO26:period:'||d||':'||j)::uuid,org,school,sess,d,'Demo Period '||j,time '08:00'+(j-1)*interval '45 minutes',time '08:40'+(j-1)*interval '45 minutes',j,sponsor,sponsor) on conflict(id) do nothing;
 end loop; end loop;
 for k in 1..14 loop
 for j in 1..2 loop
 subj:=md5('DEMO26:subject:'||j)::uuid; ta:=md5('DEMO26:teaching:'||k||':'||j)::uuid;
 insert into public.teaching_assignments(id,organization_id,school_id,session_id,staff_assignment_id,subject_id,class_level_id,assignment_type,status,started_on,created_by,updated_by)
 values(ta,org,school,sess,md5('DEMO26:staff-assignment:'||case when j=1 then k else 14+((k-1)%13) end)::uuid,subj,md5('DEMO26:level:'||k)::uuid,'subject_teacher','active','2026-09-07',sponsor,sponsor) on conflict(id) do nothing;
 for d in 1..5 loop
 insert into public.timetable_entries(id,organization_id,school_id,session_id,period_id,teaching_assignment_id,notes,created_by,updated_by)
 values(md5('DEMO26:timetable:'||k||':'||j||':'||d)::uuid,org,school,sess,md5('DEMO26:period:'||d||':'||case when k=14 and j=2 then 3 else j end)::uuid,ta,'Fictional demo timetable',sponsor,sponsor) on conflict(id) do nothing;
 end loop;
 lp:=md5('DEMO26:lesson-plan:'||k||':'||j)::uuid;
 insert into public.lesson_plans(id,organization_id,school_id,session_id,teaching_assignment_id,subject_id,class_level_id,lesson_date,topic,objectives,content_outline,teaching_resources,created_by,updated_by)
 values(lp,org,school,sess,ta,subj,md5('DEMO26:level:'||k)::uuid,'2026-10-19',case when j=1 then 'Number patterns and problem solving' else 'Reading comprehension and vocabulary' end,'Explain concepts and apply them in age-appropriate examples.','Fictional demo lesson: introduction, guided practice, independent activity and review.','Original classroom examples and flashcards',sponsor,sponsor) on conflict(id) do nothing;
 insert into public.lesson_deliveries(id,organization_id,school_id,session_id,teaching_assignment_id,lesson_plan_id,subject_id,class_level_id,delivered_on,topic,coverage_notes,classwork,reflection,recorded_by,updated_by)
 values(md5('DEMO26:lesson-delivery:'||k||':'||j)::uuid,org,school,sess,ta,lp,subj,md5('DEMO26:level:'||k)::uuid,'2026-10-19',case when j=1 then 'Number patterns and problem solving' else 'Reading comprehension and vocabulary' end,'Fictional demonstration delivery; administrative seed.','Complete five age-appropriate practice questions.','Review learners requiring additional guided practice.',sponsor,sponsor) on conflict(id) do nothing;
 end loop;
 for d in 0..4 loop
 dt:=date '2026-10-19'+d; reg:=md5('DEMO26:register:'||k||':'||dt)::uuid;
 insert into public.student_attendance_registers(id,organization_id,school_id,session_id,class_level_id,attendance_date,register_type,idempotency_key,request_fingerprint,submitted_by,submitted_at,locks_at)
 values(reg,org,school,sess,md5('DEMO26:level:'||k)::uuid,dt,'morning',reg,md5('DEMO26:'||k||':'||dt),sponsor,dt+time '08:15',dt+time '18:00') on conflict(id) do nothing;
 for i in 1..168 loop
 if 1+((i-1)%14)=k then
 insert into public.student_attendance_entries(id,organization_id,school_id,register_id,student_id,enrollment_id,class_membership_id,status,note,recorded_by,recorded_at)
 values(md5('DEMO26:attendance:'||i||':'||dt)::uuid,org,school,reg,md5('DEMO26:student:'||i)::uuid,md5('DEMO26:enrollment:'||i)::uuid,md5('DEMO26:membership:'||i)::uuid,
 case when (i+d)%19=0 then 'absent'::public.attendance_status when (i+d)%13=0 then 'late'::public.attendance_status else 'present'::public.attendance_status end,'Synthetic demo attendance; not a real pupil record.',sponsor,dt+time '08:15') on conflict(id) do nothing;
 end if; end loop;
 end loop; end loop;
 if not exists(select 1 from public.audit_events where action='demo.seed.batch' and metadata->>'batch'='DEMO26-v2') then
 insert into public.audit_events(organization_id,school_id,action,entity_type,metadata) values(org,school,'demo.seed.batch','synthetic_demo',jsonb_build_object('batch','DEMO26-v2','project','afqykqlxecpzspjoyegc','execution','administrative SQL connector','sponsor_user_id',sponsor,'not_authenticated_acceptance',true));
 end if;
end $seed$;
commit;
select jsonb_build_object('demo_assignments',(select count(*) from public.teaching_assignments where id in(select md5('DEMO26:teaching:'||k||':'||j)::uuid from generate_series(1,14)k cross join generate_series(1,2)j)),'demo_attendance',(select count(*) from public.student_attendance_entries where note like 'Synthetic demo attendance%'),'demo_lessons',(select count(*) from public.lesson_deliveries where coverage_notes like 'Fictional demonstration delivery%')) result;