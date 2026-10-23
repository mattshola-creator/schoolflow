-- QA ONLY DEMO26 Finance seed. No real money, no verification, no receipts fabricated.
begin;
select pg_advisory_xact_lock(hashtext('schoolflow:afqykqlxecpzspjoyegc:DEMO26:v3'));
do $seed$
declare org uuid:='77e48a87-b412-4bf2-be26-c9afd71d2332'; school uuid:='8e2dd437-6741-4824-807f-4cc3a5c95668'; sponsor uuid:='9f2ec592-f8a5-4182-9cb5-f05dd9a8d309'; sess uuid:='c19ebbbd-66b6-5649-963d-b41ef7165503'; i int; j int; k int; fs uuid; runid uuid; inv uuid; category uuid; amount numeric;
begin
 if auth.uid() is not null or not exists(select 1 from public.student_profiles where student_number='DEMO26-S168' and organization_id=org) then raise exception 'QA guard failed'; end if;
 for j in 1..2 loop
 insert into public.fee_categories(id,organization_id,school_id,code,name,description,created_by,updated_by)
 values(md5('DEMO26:fee-category:'||j)::uuid,org,school,'DEMO26_F'||j,case when j=1 then 'Demo tuition' else 'Demo learning resources' end,'Fictional fees for demonstration only.',sponsor,sponsor) on conflict(id) do nothing;
 end loop;
 for k in 1..14 loop
 fs:=md5('DEMO26:fee-structure:'||k)::uuid; runid:=md5('DEMO26:billing-run:'||k)::uuid;
 insert into public.fee_structures(id,organization_id,school_id,session_id,class_level_id,name,currency_code,effective_from,status,activated_at,created_by,updated_by)
 values(fs,org,school,sess,md5('DEMO26:level:'||k)::uuid,'DEMO26 Class '||k||' term fees','NGN','2026-09-07','active','2026-09-07',sponsor,sponsor) on conflict(id) do nothing;
 for j in 1..2 loop
 amount:=case when j=1 then 45000+k*5000 else 7500 end;
 insert into public.fee_structure_items(id,organization_id,school_id,fee_structure_id,fee_category_id,amount,due_date,created_by)
 values(md5('DEMO26:fee-item:'||k||':'||j)::uuid,org,school,fs,md5('DEMO26:fee-category:'||j)::uuid,amount,'2026-10-01',sponsor) on conflict(id) do nothing;
 end loop;
 insert into public.billing_runs(id,organization_id,school_id,fee_structure_id,idempotency_key,status,completed_at,affected_students,expected_total,created_by)
 values(runid,org,school,fs,runid,'completed','2026-09-14',12,12*(52500+k*5000),sponsor) on conflict(id) do nothing;
 end loop;
 for i in 1..168 loop
 k:=1+((i-1)%14); fs:=md5('DEMO26:fee-structure:'||k)::uuid; runid:=md5('DEMO26:billing-run:'||k)::uuid; inv:=md5('DEMO26:invoice:'||i)::uuid;
 insert into public.student_invoices(id,organization_id,school_id,student_id,enrollment_id,session_id,billing_run_id,invoice_number,currency_code,created_by,issued_at)
 values(inv,org,school,md5('DEMO26:student:'||i)::uuid,md5('DEMO26:enrollment:'||i)::uuid,sess,runid,'DEMO26-INV-'||lpad(i::text,3,'0'),'NGN',sponsor,'2026-09-14') on conflict(id) do nothing;
 for j in 1..2 loop
 amount:=case when j=1 then 45000+k*5000 else 7500 end;
 insert into public.student_charges(id,organization_id,school_id,student_id,enrollment_id,invoice_id,fee_structure_id,fee_structure_item_id,fee_category_id,session_id,class_level_id,currency_code,original_amount,due_date,fee_structure_name_snapshot,fee_structure_version_snapshot,fee_category_code_snapshot,fee_category_name_snapshot,created_by)
 values(md5('DEMO26:charge:'||i||':'||j)::uuid,org,school,md5('DEMO26:student:'||i)::uuid,md5('DEMO26:enrollment:'||i)::uuid,inv,fs,md5('DEMO26:fee-item:'||k||':'||j)::uuid,md5('DEMO26:fee-category:'||j)::uuid,sess,md5('DEMO26:level:'||k)::uuid,'NGN',amount,'2026-10-01','DEMO26 Class '||k||' term fees',1,'DEMO26_F'||j,case when j=1 then 'Demo tuition' else 'Demo learning resources' end,sponsor) on conflict(id) do nothing;
 end loop;
 if i<=84 then
 insert into public.payments(id,organization_id,school_id,student_id,payer_person_id,academic_session_id,amount,currency_code,method,reference,paid_at,payer_name,notes,idempotency_key,recorded_by)
 values(md5('DEMO26:payment:'||i)::uuid,org,school,md5('DEMO26:student:'||i)::uuid,md5('DEMO26:guardian-person:'||i)::uuid,sess,25000+(i%4)*10000,'NGN','bank_transfer','DEMO26-NOT-A-REAL-TRANSFER-'||i,'2026-10-12','Fictional demo guardian','SYNTHETIC DEMO ONLY. Administrative seed; no real funds and no independent verification performed.',md5('DEMO26:payment:'||i)::uuid,sponsor) on conflict(id) do nothing;
 end if; end loop;
 if not exists(select 1 from public.audit_events where action='demo.seed.batch' and metadata->>'batch'='DEMO26-v3') then
 insert into public.audit_events(organization_id,school_id,action,entity_type,metadata) values(org,school,'demo.seed.batch','synthetic_demo',jsonb_build_object('batch','DEMO26-v3','project','afqykqlxecpzspjoyegc','execution','administrative SQL connector','sponsor_user_id',sponsor,'not_authenticated_acceptance',true));
 end if;
end $seed$;
commit;
select jsonb_build_object('demo_invoices',(select count(*) from public.student_invoices where invoice_number like 'DEMO26-%'),'demo_payments',(select count(*) from public.payments where reference like 'DEMO26-%'),'demo_charges',(select count(*) from public.student_charges where fee_category_code_snapshot like 'DEMO26_%')) result;