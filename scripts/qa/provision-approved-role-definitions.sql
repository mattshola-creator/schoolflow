-- QA DATA FIXTURE ONLY: execute exclusively against afqykqlxecpzspjoyegc.
-- Founder approved the exact PR131 definitions via "proceed" on 24 October 2026.
-- Creates definitions only. Does NOT create identities, memberships or assignments.
-- Administrative audit attribution is explicit; no Owner JWT/actor is impersonated.
begin;
select pg_advisory_xact_lock(hashtextextended('schoolflow.qa.pr131.role-definitions',0));
do $$
declare
 org uuid; school uuid; owner_id uuid; entry record; v_role_id uuid;
 expected text[]; actual text[]; created boolean;
begin
 if auth.uid() is not null then raise exception 'Administrative QA execution required'; end if;
 select id into strict org from public.organizations where slug='cedarbridge-learning-group';
 select id into strict school from public.schools where organization_id=org and status='active';
 if org <> '77e48a87-b412-4bf2-be26-c9afd71d2332'::uuid or school <> '8e2dd437-6741-4824-807f-4cc3a5c95668'::uuid then raise exception 'Exact synthetic QA fixture required; production refused'; end if;
 select ra.user_id into strict owner_id from public.role_assignments ra join public.roles r on r.id=ra.role_id and r.organization_id=ra.organization_id
 where ra.organization_id=org and r.key='organization_owner' and r.is_system and ra.status='active' and ra.scope='organization'
 and ra.effective_from<=now() and (ra.effective_to is null or ra.effective_to>now());
 if not exists(select 1 from public.organization_memberships where organization_id=org and user_id=owner_id and status='active') then raise exception 'Active authorizing Owner membership required'; end if;
 for entry in select * from (values
 ('qa_principal_review','QA Principal Review',array['organization.view','school.view','students.view','attendance.view','academics.view','academics.scores.view','academics.results.view','academics.results.review','reporting.dashboard.view','reporting.school.view','reporting.academic.view','reporting.attendance.view','shared.tasks.view']),
 ('qa_bursar_recorder','QA Bursar Recorder',array['finance.view','finance.billing.view','finance.payments.view','finance.payments.record'])
 ) as presets(role_key,role_name,permission_keys) loop
  select array_agg(x order by x) into expected from unnest(entry.permission_keys) x;
  if exists(select 1 from unnest(expected) x where not exists(select 1 from public.permissions p where p.key=x)) then raise exception 'Unknown approved permission'; end if;
  if exists(select 1 from unnest(expected) x where not exists(
    select 1 from public.role_assignments ra join public.role_permissions rp on rp.role_id=ra.role_id and rp.organization_id=ra.organization_id join public.permissions p on p.id=rp.permission_id
    where ra.user_id=owner_id and ra.organization_id=org and ra.scope='organization' and ra.status='active' and ra.effective_from<=now() and (ra.effective_to is null or ra.effective_to>now()) and p.key=x
  )) then raise exception 'Permission exceeds authorizing Owner subset'; end if;
  v_role_id:=null; created:=false;
  select id into v_role_id from public.roles where organization_id=org and key=entry.role_key;
  if v_role_id is null then
   insert into public.roles(organization_id,key,name,description,is_system) values(org,entry.role_key,entry.role_name,'Founder-approved PR131 QA pilot. School-scoped assignments only; not production.',false) returning id into v_role_id;
   insert into public.role_permissions(organization_id,role_id,permission_id) select org,v_role_id,p.id from public.permissions p where p.key=any(expected);
   created:=true;
  end if;
  if exists(select 1 from public.roles where id=v_role_id and (organization_id<>org or is_system)) then raise exception 'Unsafe existing role definition'; end if;
  select array_agg(p.key order by p.key) into actual from public.role_permissions rp join public.permissions p on p.id=rp.permission_id where rp.role_id=v_role_id and rp.organization_id=org;
  if actual is distinct from expected then raise exception 'Existing role differs from approved permission set'; end if;
  if created then
   insert into public.audit_events(organization_id,school_id,actor_user_id,action,entity_type,entity_id,metadata)
   values(org,school,null,'qa.role_definition.provisioned','roles',v_role_id,jsonb_build_object('execution','administrative QA connector','authorization','Founder proceed: PR131 bounded role proposal, 2026-10-24','role_key',entry.role_key,'permissions',expected,'assignment_scope','school only','assignments_created',0));
  end if;
 end loop;
end $$;
commit;
select r.key,count(rp.permission_id) permission_count,(select count(*) from public.role_assignments a where a.role_id=r.id) assignments from public.roles r join public.role_permissions rp on rp.role_id=r.id and rp.organization_id=r.organization_id where r.key in ('qa_principal_review','qa_bursar_recorder') group by r.id order by r.key;
