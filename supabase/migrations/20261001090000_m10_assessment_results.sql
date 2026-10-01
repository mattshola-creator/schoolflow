-- M10 Assessment & Results. School-specific configuration, server-authoritative
-- scoring/workflow, immutable publication snapshots, and idempotent promotion.

create type public.assessment_scheme_status as enum ('draft', 'active', 'archived');
create type public.result_batch_status as enum ('draft', 'submitted', 'reviewed', 'approved', 'published', 'reopened');
create type public.promotion_outcome as enum ('promoted', 'repeated', 'graduated', 'transferred');

insert into public.product_features (module_id, key, name, description, default_enabled)
select m.id, v.key, v.name, v.description, false
from public.product_modules m
cross join (values
  ('academics.assessment_configuration', 'Assessment configuration', 'Assessment schemes, components and grading scales'),
  ('academics.score_entry', 'Score entry', 'Teacher-scoped score sheets and submission'),
  ('academics.result_workflow', 'Result workflow', 'Review, approval, publication and correction'),
  ('academics.report_cards', 'Report cards', 'Published result report cards'),
  ('academics.promotion', 'Student promotion', 'Controlled promotion and enrollment history')
) as v(key, name, description)
where m.key = 'academics'
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('academics.assessments.configure', 'Configure assessment and grading schemes'),
  ('academics.scores.view', 'View authorized score sheets'),
  ('academics.scores.enter', 'Enter scores for assigned classes and subjects'),
  ('academics.scores.submit', 'Submit complete score sheets'),
  ('academics.results.review', 'Review submitted results'),
  ('academics.results.approve', 'Approve reviewed results'),
  ('academics.results.publish', 'Publish approved results'),
  ('academics.results.view', 'View approved and published results'),
  ('academics.results.correct', 'Reopen published results with a correction reason'),
  ('academics.promotions.manage', 'Create controlled student promotions')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'organization_owner' and p.key in (
  'academics.assessments.configure','academics.scores.view','academics.scores.enter',
  'academics.scores.submit','academics.results.review','academics.results.approve',
  'academics.results.publish','academics.results.view','academics.results.correct',
  'academics.promotions.manage') on conflict do nothing;

create or replace function public.can_access_assessments(
  target_organization_id uuid, target_school_id uuid, permission_key text, feature_key text
) returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and feature_key in ('academics.assessment_configuration','academics.score_entry',
      'academics.result_workflow','academics.report_cards','academics.promotion')
    and public.has_school_membership(target_organization_id, target_school_id)
    and public.has_permission(target_organization_id, target_school_id, permission_key)
    and public.has_module_entitlement(target_organization_id, 'academics')
    and public.is_feature_enabled(target_organization_id, feature_key)
$$;

create table public.assessment_schemes (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  session_id uuid not null, period_id uuid not null, class_level_id uuid not null, subject_id uuid,
  name text not null check (char_length(trim(name)) between 3 and 120),
  version integer not null default 1 check (version > 0), total_mark numeric(6,2) not null default 100 check (total_mark > 0),
  pass_mark numeric(6,2) not null check (pass_mark >= 0 and pass_mark <= total_mark),
  status public.assessment_scheme_status not null default 'draft', activated_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((status = 'active' and activated_at is not null) or status <> 'active'),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id) references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (period_id, session_id, organization_id, school_id) references public.academic_periods(id, session_id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id) references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (subject_id, organization_id, school_id) references public.subjects(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (school_id, name, version, class_level_id, period_id, subject_id)
);

create table public.assessment_components (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  scheme_id uuid not null, code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{0,19}$'),
  name text not null check (char_length(trim(name)) between 2 and 80),
  maximum_score numeric(6,2) not null check (maximum_score > 0),
  weight_percent numeric(6,2) not null check (weight_percent > 0 and weight_percent <= 100),
  sequence smallint not null check (sequence between 1 and 50),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (scheme_id, organization_id, school_id) references public.assessment_schemes(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (scheme_id, code), unique (scheme_id, sequence)
);

create table public.grade_bands (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  scheme_id uuid not null, minimum_percent numeric(5,2) not null check (minimum_percent >= 0 and minimum_percent <= 100),
  maximum_percent numeric(5,2) not null check (maximum_percent >= minimum_percent and maximum_percent <= 100),
  grade text not null check (char_length(trim(grade)) between 1 and 12),
  remark text not null check (char_length(trim(remark)) between 1 and 120), is_pass boolean not null,
  sequence smallint not null check (sequence between 1 and 50),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (scheme_id, organization_id, school_id) references public.assessment_schemes(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (scheme_id, grade), unique (scheme_id, sequence)
);

create table public.result_batches (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  session_id uuid not null, period_id uuid not null, class_level_id uuid not null, class_arm_id uuid,
  subject_id uuid not null, scheme_id uuid not null, teaching_assignment_id uuid,
  version integer not null default 1 check (version > 0), status public.result_batch_status not null default 'draft',
  correction_of_id uuid, correction_reason text check (correction_reason is null or char_length(trim(correction_reason)) between 3 and 500),
  submitted_by uuid references auth.users(id) on delete restrict, submitted_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete restrict, reviewed_at timestamptz,
  approved_by uuid references auth.users(id) on delete restrict, approved_at timestamptz,
  published_by uuid references auth.users(id) on delete restrict, published_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (session_id, organization_id, school_id) references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (period_id, session_id, organization_id, school_id) references public.academic_periods(id, session_id, organization_id, school_id) on delete restrict,
  foreign key (class_level_id, organization_id, school_id) references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (class_arm_id, organization_id, school_id) references public.class_arms(id, organization_id, school_id) on delete restrict,
  foreign key (subject_id, organization_id, school_id) references public.subjects(id, organization_id, school_id) on delete restrict,
  foreign key (scheme_id, organization_id, school_id) references public.assessment_schemes(id, organization_id, school_id) on delete restrict,
  foreign key (teaching_assignment_id, organization_id, school_id) references public.teaching_assignments(id, organization_id, school_id) on delete restrict,
  foreign key (correction_of_id) references public.result_batches(id) on delete restrict,
  unique (id, organization_id, school_id),
  unique nulls not distinct (school_id, session_id, period_id, class_level_id, class_arm_id, subject_id, version)
);

create table public.assessment_scores (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  batch_id uuid not null, student_id uuid not null, component_id uuid not null,
  score numeric(6,2) not null check (score >= 0), entered_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (batch_id, organization_id, school_id) references public.result_batches(id, organization_id, school_id) on delete restrict,
  foreign key (student_id, organization_id) references public.student_profiles(id, organization_id) on delete restrict,
  foreign key (component_id, organization_id, school_id) references public.assessment_components(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (batch_id, student_id, component_id)
);

create table public.student_subject_results (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  batch_id uuid not null, student_id uuid not null, weighted_percent numeric(6,2) not null check (weighted_percent between 0 and 100),
  total_score numeric(6,2) not null check (total_score >= 0), grade text not null, remark text not null, is_pass boolean not null,
  computed_by uuid not null references auth.users(id) on delete restrict, computed_at timestamptz not null default now(),
  foreign key (batch_id, organization_id, school_id) references public.result_batches(id, organization_id, school_id) on delete restrict,
  foreign key (student_id, organization_id) references public.student_profiles(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id), unique (batch_id, student_id)
);

create table public.result_publications (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  batch_id uuid not null, version integer not null, snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  published_by uuid not null references auth.users(id) on delete restrict, published_at timestamptz not null default now(),
  foreign key (batch_id, organization_id, school_id) references public.result_batches(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (batch_id), unique (school_id, batch_id, version)
);

create table public.student_promotions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null, school_id uuid not null,
  student_id uuid not null, source_session_id uuid not null, source_period_id uuid not null,
  source_class_level_id uuid not null, source_class_arm_id uuid, outcome public.promotion_outcome not null,
  target_session_id uuid, target_class_level_id uuid, target_class_arm_id uuid,
  target_enrollment_id uuid, target_membership_id uuid, idempotency_key text not null check (char_length(idempotency_key) between 8 and 120),
  notes text check (notes is null or char_length(trim(notes)) <= 500),
  promoted_by uuid not null default auth.uid() references auth.users(id) on delete restrict, promoted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check ((outcome in ('promoted','repeated') and target_session_id is not null and target_class_level_id is not null)
    or (outcome in ('graduated','transferred') and target_session_id is null and target_class_level_id is null and target_class_arm_id is null)),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (student_id, organization_id) references public.student_profiles(id, organization_id) on delete restrict,
  foreign key (source_session_id, organization_id, school_id) references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (source_period_id, source_session_id, organization_id, school_id) references public.academic_periods(id, session_id, organization_id, school_id) on delete restrict,
  foreign key (source_class_level_id, organization_id, school_id) references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (source_class_arm_id, organization_id, school_id) references public.class_arms(id, organization_id, school_id) on delete restrict,
  foreign key (target_session_id, organization_id, school_id) references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (target_class_level_id, organization_id, school_id) references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (target_class_arm_id, organization_id, school_id) references public.class_arms(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id), unique (school_id, idempotency_key), unique (school_id, student_id, source_session_id)
);

create index assessment_schemes_scope_idx on public.assessment_schemes (organization_id, school_id, session_id, period_id, class_level_id, status);
create index result_batches_scope_idx on public.result_batches (organization_id, school_id, session_id, period_id, class_level_id, class_arm_id, status);
create index assessment_scores_batch_idx on public.assessment_scores (batch_id, student_id);
create index result_publications_scope_idx on public.result_publications (organization_id, school_id, published_at desc);
create index student_promotions_history_idx on public.student_promotions (organization_id, school_id, student_id, promoted_at desc);

create or replace function private.assessment_period_locked(org uuid, school uuid, session uuid, period uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.academic_locks l where l.organization_id=org and l.school_id=school
   and l.unlocked_at is null and ((l.scope='session' and l.session_id=session) or (l.scope='period' and l.period_id=period)))
$$;

create or replace function public.activate_assessment_scheme(target_scheme_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare s public.assessment_schemes%rowtype; weights numeric; band_count integer; cursor numeric := 0; b record;
begin
 select * into s from public.assessment_schemes where id=target_scheme_id for update;
 if not found or not public.can_access_assessments(s.organization_id,s.school_id,'academics.assessments.configure','academics.assessment_configuration') then raise exception 'Assessment scheme unavailable' using errcode='42501'; end if;
 if s.status <> 'draft' then raise exception 'Only draft schemes can be activated' using errcode='23514'; end if;
 select coalesce(sum(weight_percent),0) into weights from public.assessment_components where scheme_id=s.id;
 if weights <> 100 then raise exception 'Assessment component weights must total 100' using errcode='23514'; end if;
 select count(*) into band_count from public.grade_bands where scheme_id=s.id;
 if band_count=0 then raise exception 'At least one grade band is required' using errcode='23514'; end if;
 for b in select * from public.grade_bands where scheme_id=s.id order by minimum_percent loop
   if b.minimum_percent <> cursor then raise exception 'Grade bands must cover 0 through 100 without gaps or overlaps' using errcode='23514'; end if;
   cursor := b.maximum_percent;
 end loop;
 if cursor <> 100 then raise exception 'Grade bands must end at 100' using errcode='23514'; end if;
 update public.assessment_schemes set status='active',activated_at=now(),updated_by=auth.uid(),updated_at=now() where id=s.id;
end $$;

create or replace function public.upsert_assessment_score(target_batch_id uuid,target_student_id uuid,target_component_id uuid,target_score numeric)
returns uuid language plpgsql security definer set search_path = '' as $$
declare b public.result_batches%rowtype; c public.assessment_components%rowtype; score_id uuid; assigned boolean;
begin
 select * into b from public.result_batches where id=target_batch_id for update;
 if not found or not public.can_access_assessments(b.organization_id,b.school_id,'academics.scores.enter','academics.score_entry') then raise exception 'Score sheet unavailable' using errcode='42501'; end if;
 if b.status not in ('draft','reopened') or private.assessment_period_locked(b.organization_id,b.school_id,b.session_id,b.period_id) then raise exception 'Score sheet is not editable' using errcode='55000'; end if;
 select * into c from public.assessment_components where id=target_component_id and scheme_id=b.scheme_id;
 if not found or target_score < 0 or target_score > c.maximum_score then raise exception 'Score is outside the component range' using errcode='23514'; end if;
 if not exists (select 1 from public.class_memberships m where m.student_id=target_student_id and m.organization_id=b.organization_id and m.school_id=b.school_id and m.academic_session_id=b.session_id and m.class_level_id=b.class_level_id and m.class_arm_id is not distinct from b.class_arm_id and m.status='active') then raise exception 'Student is not enrolled in this class' using errcode='23514'; end if;
 if b.teaching_assignment_id is not null then
   select exists(select 1 from public.teaching_assignments t join public.staff_assignments sa on sa.id=t.staff_assignment_id join public.employments e on e.id=sa.employment_id where t.id=b.teaching_assignment_id and e.user_id=auth.uid() and t.status='active') into assigned;
   if not assigned and not public.has_permission(b.organization_id,b.school_id,'academics.assessments.configure') then raise exception 'Teacher assignment required' using errcode='42501'; end if;
 end if;
 insert into public.assessment_scores(organization_id,school_id,batch_id,student_id,component_id,score)
 values(b.organization_id,b.school_id,b.id,target_student_id,c.id,target_score)
 on conflict(batch_id,student_id,component_id) do update set score=excluded.score,updated_by=auth.uid(),updated_at=now()
 returning id into score_id; return score_id;
end $$;

create or replace function private.compute_result_batch(target_batch_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare b public.result_batches%rowtype; expected integer; enrolled integer; scored integer;
begin
 select * into b from public.result_batches where id=target_batch_id for update;
 select count(*) into expected from public.assessment_components where scheme_id=b.scheme_id;
 select count(*) into enrolled from public.class_memberships m where m.organization_id=b.organization_id and m.school_id=b.school_id and m.academic_session_id=b.session_id and m.class_level_id=b.class_level_id and m.class_arm_id is not distinct from b.class_arm_id and m.status='active';
 select count(*) into scored from public.assessment_scores where batch_id=b.id;
 if expected=0 or enrolled=0 or scored <> expected*enrolled then raise exception 'Every enrolled student requires every component score' using errcode='23514'; end if;
 delete from public.student_subject_results where batch_id=b.id;
 insert into public.student_subject_results(organization_id,school_id,batch_id,student_id,weighted_percent,total_score,grade,remark,is_pass,computed_by)
 select b.organization_id,b.school_id,b.id,s.student_id,x.percent,round(x.percent*sch.total_mark/100,2),g.grade,g.remark,g.is_pass,auth.uid()
 from (select sc.student_id,round(sum(sc.score/c.maximum_score*c.weight_percent),2) percent from public.assessment_scores sc join public.assessment_components c on c.id=sc.component_id where sc.batch_id=b.id group by sc.student_id) x
 join public.assessment_scores s on s.batch_id=b.id and s.student_id=x.student_id
 join public.assessment_schemes sch on sch.id=b.scheme_id
 join lateral (select gb.grade,gb.remark,gb.is_pass from public.grade_bands gb where gb.scheme_id=b.scheme_id and x.percent >= gb.minimum_percent and (x.percent < gb.maximum_percent or gb.maximum_percent=100) order by gb.minimum_percent desc limit 1) g on true
 group by s.student_id,x.percent,sch.total_mark,g.grade,g.remark,g.is_pass;
end $$;

create or replace function public.transition_result_batch(target_batch_id uuid,target_status public.result_batch_status)
returns void language plpgsql security definer set search_path = '' as $$
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
  select b.organization_id,b.school_id,b.id,b.version,jsonb_build_object('batch',jsonb_build_object('sessionId',b.session_id,'periodId',b.period_id,'classLevelId',b.class_level_id,'classArmId',b.class_arm_id,'subjectId',b.subject_id,'schemeId',b.scheme_id,'version',b.version),'results',coalesce(jsonb_agg(to_jsonb(r) order by r.student_id),'[]'::jsonb)),auth.uid() from public.student_subject_results r where r.batch_id=b.id;
 end if;
end $$;

create or replace function public.reopen_result_batch(target_batch_id uuid,reason text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare b public.result_batches%rowtype; new_id uuid;
begin
 select * into b from public.result_batches where id=target_batch_id for update;
 if not found or b.status<>'published' or not public.can_access_assessments(b.organization_id,b.school_id,'academics.results.correct','academics.result_workflow') then raise exception 'Published batch unavailable for correction' using errcode='42501'; end if;
 if char_length(trim(reason))<3 then raise exception 'Correction reason is required' using errcode='23514'; end if;
 insert into public.result_batches(organization_id,school_id,session_id,period_id,class_level_id,class_arm_id,subject_id,scheme_id,teaching_assignment_id,version,status,correction_of_id,correction_reason)
 values(b.organization_id,b.school_id,b.session_id,b.period_id,b.class_level_id,b.class_arm_id,b.subject_id,b.scheme_id,b.teaching_assignment_id,b.version+1,'reopened',b.id,trim(reason)) returning id into new_id;
 insert into public.assessment_scores(organization_id,school_id,batch_id,student_id,component_id,score)
 select organization_id,school_id,new_id,student_id,component_id,score from public.assessment_scores where batch_id=b.id;
 return new_id;
end $$;

create or replace function public.promote_student(target_student_id uuid,source_period uuid,outcome public.promotion_outcome,target_session uuid,target_level uuid,target_arm uuid,idempotency_key text,notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare p public.academic_periods%rowtype; m public.class_memberships%rowtype; promotion_id uuid; enrollment_id uuid; membership_id uuid;
begin
 select * into p from public.academic_periods where id=source_period;
 select * into m from public.class_memberships where student_id=target_student_id and academic_session_id=p.session_id and school_id=p.school_id and status='active' for update;
 if not found or not public.can_access_assessments(p.organization_id,p.school_id,'academics.promotions.manage','academics.promotion') then raise exception 'Student promotion unavailable' using errcode='42501'; end if;
 select id into promotion_id from public.student_promotions where school_id=p.school_id and idempotency_key=trim(idempotency_key); if found then return promotion_id; end if;
 if not exists(select 1 from public.result_batches b join public.student_subject_results r on r.batch_id=b.id where b.school_id=p.school_id and b.period_id=p.id and b.class_level_id=m.class_level_id and b.class_arm_id is not distinct from m.class_arm_id and b.status='published' and r.student_id=target_student_id) then raise exception 'Published results are required before promotion' using errcode='23514'; end if;
 if private.assessment_period_locked(p.organization_id,p.school_id,p.session_id,p.id) then raise exception 'Academic period is locked' using errcode='55000'; end if;
 if outcome in ('promoted','repeated') then
  insert into public.student_enrollments(organization_id,school_id,student_id,academic_session_id,status,enrolled_on) values(p.organization_id,p.school_id,target_student_id,target_session,'active',current_date) on conflict(student_id,school_id,academic_session_id) do update set updated_at=now() returning id into enrollment_id;
  insert into public.class_memberships(organization_id,school_id,student_id,enrollment_id,academic_session_id,class_level_id,class_arm_id,started_on,status) values(p.organization_id,p.school_id,target_student_id,enrollment_id,target_session,target_level,target_arm,current_date,'active') returning id into membership_id;
 end if;
 insert into public.student_promotions(organization_id,school_id,student_id,source_session_id,source_period_id,source_class_level_id,source_class_arm_id,outcome,target_session_id,target_class_level_id,target_class_arm_id,target_enrollment_id,target_membership_id,idempotency_key,notes)
 values(p.organization_id,p.school_id,target_student_id,p.session_id,p.id,m.class_level_id,m.class_arm_id,outcome,target_session,target_level,target_arm,enrollment_id,membership_id,trim(idempotency_key),nullif(trim(notes),'')) returning id into promotion_id;
 return promotion_id;
end $$;

do $$ declare t text; begin
 foreach t in array array['assessment_schemes','assessment_components','grade_bands','result_batches','assessment_scores','student_subject_results','result_publications','student_promotions'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.capture_audit_event()',t,t);
 end loop;
 foreach t in array array['assessment_schemes','result_batches','assessment_scores'] loop execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()',t,t); end loop;
end $$;

create policy assessment_schemes_select on public.assessment_schemes for select to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.scores.view','academics.assessment_configuration') or public.can_access_assessments(organization_id,school_id,'academics.assessments.configure','academics.assessment_configuration'));
create policy assessment_schemes_write on public.assessment_schemes for all to authenticated using (status='draft' and public.can_access_assessments(organization_id,school_id,'academics.assessments.configure','academics.assessment_configuration')) with check (created_by=auth.uid() and public.can_access_assessments(organization_id,school_id,'academics.assessments.configure','academics.assessment_configuration'));
create policy assessment_components_select on public.assessment_components for select to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.scores.view','academics.score_entry') or public.can_access_assessments(organization_id,school_id,'academics.assessments.configure','academics.assessment_configuration'));
create policy assessment_components_write on public.assessment_components for all to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.assessments.configure','academics.assessment_configuration') and exists(select 1 from public.assessment_schemes s where s.id=scheme_id and s.status='draft')) with check (created_by=auth.uid() and public.can_access_assessments(organization_id,school_id,'academics.assessments.configure','academics.assessment_configuration'));
create policy grade_bands_select on public.grade_bands for select to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.scores.view','academics.score_entry') or public.can_access_assessments(organization_id,school_id,'academics.assessments.configure','academics.assessment_configuration'));
create policy grade_bands_write on public.grade_bands for all to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.assessments.configure','academics.assessment_configuration') and exists(select 1 from public.assessment_schemes s where s.id=scheme_id and s.status='draft')) with check (created_by=auth.uid() and public.can_access_assessments(organization_id,school_id,'academics.assessments.configure','academics.assessment_configuration'));
create policy result_batches_select on public.result_batches for select to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.scores.view','academics.score_entry') or public.can_access_assessments(organization_id,school_id,'academics.results.view','academics.result_workflow'));
create policy result_batches_insert on public.result_batches for insert to authenticated with check (created_by=auth.uid() and public.can_access_assessments(organization_id,school_id,'academics.scores.enter','academics.score_entry'));
create policy assessment_scores_select on public.assessment_scores for select to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.scores.view','academics.score_entry'));
create policy student_subject_results_select on public.student_subject_results for select to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.results.view','academics.result_workflow'));
create policy result_publications_select on public.result_publications for select to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.results.view','academics.report_cards'));
create policy student_promotions_select on public.student_promotions for select to authenticated using (public.can_access_assessments(organization_id,school_id,'academics.promotions.manage','academics.promotion'));

revoke all on public.assessment_schemes,public.assessment_components,public.grade_bands,public.result_batches,public.assessment_scores,public.student_subject_results,public.result_publications,public.student_promotions from anon,authenticated;
grant select on public.assessment_schemes,public.assessment_components,public.grade_bands,
 public.result_batches,public.assessment_scores,public.student_subject_results,
 public.result_publications,public.student_promotions to authenticated;
grant insert,update,delete on public.assessment_schemes,public.assessment_components,public.grade_bands to authenticated;
grant insert on public.result_batches to authenticated;
revoke all on function public.can_access_assessments(uuid,uuid,text,text),public.activate_assessment_scheme(uuid),public.upsert_assessment_score(uuid,uuid,uuid,numeric),public.transition_result_batch(uuid,public.result_batch_status),public.reopen_result_batch(uuid,text),public.promote_student(uuid,uuid,public.promotion_outcome,uuid,uuid,uuid,text,text) from public,anon;
grant execute on function public.can_access_assessments(uuid,uuid,text,text),public.activate_assessment_scheme(uuid),public.upsert_assessment_score(uuid,uuid,uuid,numeric),public.transition_result_batch(uuid,public.result_batch_status),public.reopen_result_batch(uuid,text),public.promote_student(uuid,uuid,public.promotion_outcome,uuid,uuid,uuid,text,text) to authenticated;
revoke all on function private.assessment_period_locked(uuid,uuid,uuid,uuid),private.compute_result_batch(uuid) from public,anon,authenticated;

comment on table public.result_publications is 'Immutable published result snapshots used by report cards and future portal consumers.';
comment on table public.student_promotions is 'Idempotent promotion outcomes preserving prior enrollment and class history.';
