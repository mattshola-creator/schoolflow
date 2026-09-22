-- M7 Admissions. Applications remain applicant records until an authorized,
-- atomic conversion reuses the applicant Person in the student domain.
create type public.admission_application_status as enum (
  'enquiry', 'application_started', 'submitted', 'under_review',
  'exam_scheduled', 'exam_taken', 'under_assessment', 'retake',
  'approved', 'rejected', 'admission_offered', 'accepted',
  'enrollment_pending', 'enrolled', 'withdrawn', 'cancelled',
  'incomplete', 'expired'
);
create type public.admission_source as enum ('enquiry', 'staff', 'parent_online', 'import');
create type public.assessment_attempt_status as enum ('scheduled', 'completed', 'cancelled');
create type public.admission_decision_kind as enum ('approved', 'rejected', 'retake');
create type public.offer_status as enum ('draft', 'issued', 'accepted', 'declined', 'expired', 'withdrawn');
create type public.checklist_item_status as enum ('pending', 'complete', 'waived');

create table public.admission_applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  applicant_person_id uuid not null references public.people(id) on delete restrict,
  application_number text not null check (application_number ~ '^[A-Za-z0-9][A-Za-z0-9/_-]{2,39}$'),
  source public.admission_source not null default 'staff',
  status public.admission_application_status not null default 'application_started',
  academic_session_id uuid not null,
  applied_class_level_id uuid not null,
  date_of_birth date not null check (date_of_birth <= current_date),
  gender text check (gender is null or char_length(trim(gender)) between 1 and 40),
  previous_class text check (previous_class is null or char_length(trim(previous_class)) between 1 and 100),
  notes text check (notes is null or char_length(trim(notes)) <= 2000),
  submitted_at timestamptz,
  enrolled_student_id uuid,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  foreign key (academic_session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (applied_class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (enrolled_student_id, organization_id)
    references public.student_profiles(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (organization_id, school_id, application_number),
  unique (organization_id, enrolled_student_id),
  check ((status = 'submitted' and submitted_at is not null) or status <> 'submitted'),
  check ((status = 'enrolled' and enrolled_student_id is not null) or status <> 'enrolled')
);
create index admission_applications_school_status_idx
  on public.admission_applications (organization_id, school_id, status, created_at desc);
create index admission_applications_person_idx
  on public.admission_applications (organization_id, applicant_person_id);

create table public.admission_guardians (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  application_id uuid not null,
  guardian_person_id uuid not null references public.people(id) on delete restrict,
  relationship_type text not null check (char_length(trim(relationship_type)) between 2 and 60),
  email text check (email is null or email = lower(trim(email))),
  phone text check (phone is null or char_length(trim(phone)) between 7 and 30),
  is_primary_contact boolean not null default false,
  is_financially_responsible boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (application_id, organization_id, school_id)
    references public.admission_applications(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (application_id, guardian_person_id, relationship_type)
);
create unique index admission_guardians_one_primary_idx
  on public.admission_guardians (application_id) where is_primary_contact;

create table public.entrance_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  application_id uuid not null,
  attempt_number smallint not null check (attempt_number between 1 and 20),
  status public.assessment_attempt_status not null default 'scheduled',
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  score numeric(7,2) check (score is null or score >= 0),
  maximum_score numeric(7,2) check (maximum_score is null or maximum_score > 0),
  assessor_notes text check (assessor_notes is null or char_length(trim(assessor_notes)) <= 2000),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (application_id, organization_id, school_id)
    references public.admission_applications(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (application_id, attempt_number),
  check (score is null or maximum_score is not null),
  check (score is null or score <= maximum_score),
  check ((status = 'completed' and completed_at is not null and score is not null) or status <> 'completed')
);
create index entrance_assessments_application_idx
  on public.entrance_assessment_attempts (application_id, attempt_number desc);

create table public.admission_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  application_id uuid not null,
  decision public.admission_decision_kind not null,
  recommended_class_level_id uuid,
  rationale text not null check (char_length(trim(rationale)) between 3 and 2000),
  approval_request_id uuid references public.approval_requests(id) on delete restrict,
  decided_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  decided_at timestamptz not null default now(),
  foreign key (application_id, organization_id, school_id)
    references public.admission_applications(id, organization_id, school_id) on delete restrict,
  foreign key (recommended_class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id)
);
create index admission_decisions_application_idx
  on public.admission_decisions (application_id, decided_at desc);

create table public.admission_offers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  application_id uuid not null,
  academic_session_id uuid not null,
  offered_class_level_id uuid not null,
  offered_class_arm_id uuid,
  status public.offer_status not null default 'draft',
  issued_at timestamptz,
  expires_at timestamptz,
  responded_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  foreign key (application_id, organization_id, school_id)
    references public.admission_applications(id, organization_id, school_id) on delete restrict,
  foreign key (academic_session_id, organization_id, school_id)
    references public.academic_sessions(id, organization_id, school_id) on delete restrict,
  foreign key (offered_class_level_id, organization_id, school_id)
    references public.class_levels(id, organization_id, school_id) on delete restrict,
  foreign key (offered_class_arm_id, organization_id, school_id)
    references public.class_arms(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (application_id),
  check (expires_at is null or issued_at is null or expires_at > issued_at),
  check ((status in ('issued','accepted','declined','expired') and issued_at is not null) or status in ('draft','withdrawn')),
  check ((status in ('accepted','declined') and responded_at is not null) or status not in ('accepted','declined'))
);

create table public.admission_checklist_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  application_id uuid not null,
  key text not null check (key ~ '^[a-z]+(?:_[a-z]+)*$'),
  label text not null check (char_length(trim(label)) between 2 and 100),
  required boolean not null default true,
  status public.checklist_item_status not null default 'pending',
  completed_by uuid references auth.users(id) on delete restrict,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  foreign key (application_id, organization_id, school_id)
    references public.admission_applications(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (application_id, key),
  check ((status = 'complete' and completed_by is not null and completed_at is not null) or status <> 'complete')
);

insert into public.product_features (module_id, key, name, description)
select id, 'admissions.application_workflow', 'Admissions workflow', 'Applicant, assessment, decision, offer and enrollment conversion'
from public.product_modules where key = 'admissions'
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('admissions.assess', 'Schedule and record entrance assessments'),
  ('admissions.decide', 'Record admission decisions and offers'),
  ('admissions.enroll', 'Convert accepted applicants into enrolled students')
on conflict (key) do nothing;
insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r cross join public.permissions p
where r.key = 'organization_owner' and p.key like 'admissions.%'
on conflict do nothing;

create or replace function public.can_access_admissions(
  target_organization_id uuid,
  target_school_id uuid,
  permission_key text,
  feature_key text default 'admissions.application_workflow'
) returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and public.has_school_membership(target_organization_id, target_school_id)
    and public.has_permission(target_organization_id, target_school_id, permission_key)
    and public.has_module_entitlement(target_organization_id, 'admissions')
    and public.is_feature_enabled(target_organization_id, feature_key)
$$;
revoke all on function public.can_access_admissions(uuid, uuid, text, text) from public, anon;
grant execute on function public.can_access_admissions(uuid, uuid, text, text) to authenticated;

create or replace function private.validate_admission_offer()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.offered_class_arm_id is not null and not exists (
    select 1 from public.class_arms a where a.id = new.offered_class_arm_id
      and a.class_level_id = new.offered_class_level_id
      and a.organization_id = new.organization_id and a.school_id = new.school_id
  ) then raise exception 'Class arm does not belong to the offered level' using errcode = '23514'; end if;
  return new;
end $$;
create trigger validate_admission_offer before insert or update on public.admission_offers
for each row execute function private.validate_admission_offer();
revoke all on function private.validate_admission_offer() from public, anon, authenticated;

create or replace function public.create_admission_application(
  target_organization_id uuid, target_school_id uuid, target_session_id uuid,
  target_level_id uuid, target_application_number text, applicant_first_name text,
  applicant_last_name text, applicant_date_of_birth date, applicant_gender text,
  application_source public.admission_source default 'staff', previous_class_name text default null,
  guardian_first_name text default null, guardian_last_name text default null,
  guardian_relationship text default null, guardian_email text default null,
  guardian_phone text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); applicant_person uuid; guardian_person uuid; new_application_id uuid;
begin
  if caller_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not public.can_access_admissions(target_organization_id, target_school_id, 'admissions.manage') then
    raise exception 'Admissions management is unavailable' using errcode = '42501';
  end if;
  if char_length(trim(applicant_first_name)) not between 1 and 100
    or char_length(trim(applicant_last_name)) not between 1 and 100
    or applicant_date_of_birth is null or applicant_date_of_birth > current_date
    or not exists (select 1 from public.academic_sessions s where s.id = target_session_id
      and s.organization_id = target_organization_id and s.school_id = target_school_id)
    or not exists (select 1 from public.class_levels l where l.id = target_level_id
      and l.organization_id = target_organization_id and l.school_id = target_school_id and l.status = 'active')
  then raise exception 'Application details are invalid' using errcode = '22023'; end if;
  insert into public.people(first_name,last_name) values(trim(applicant_first_name),trim(applicant_last_name)) returning id into applicant_person;
  insert into public.admission_applications(
    organization_id,school_id,applicant_person_id,application_number,source,status,
    academic_session_id,applied_class_level_id,date_of_birth,gender,previous_class,created_by,updated_by
  ) values (
    target_organization_id,target_school_id,applicant_person,upper(trim(target_application_number)),application_source,'application_started',
    target_session_id,target_level_id,applicant_date_of_birth,nullif(trim(applicant_gender),''),nullif(trim(previous_class_name),''),caller_id,caller_id
  ) returning id into new_application_id;
  if nullif(trim(guardian_first_name),'') is not null or nullif(trim(guardian_last_name),'') is not null then
    if nullif(trim(guardian_first_name),'') is null or nullif(trim(guardian_last_name),'') is null or nullif(trim(guardian_relationship),'') is null then
      raise exception 'Guardian details are incomplete' using errcode = '22023';
    end if;
    insert into public.people(first_name,last_name) values(trim(guardian_first_name),trim(guardian_last_name)) returning id into guardian_person;
    insert into public.admission_guardians(organization_id,school_id,application_id,guardian_person_id,relationship_type,email,phone,is_primary_contact,is_financially_responsible,created_by)
    values(target_organization_id,target_school_id,new_application_id,guardian_person,trim(guardian_relationship),nullif(lower(trim(guardian_email)),''),nullif(trim(guardian_phone),''),true,true,caller_id);
  end if;
  insert into public.admission_checklist_items(organization_id,school_id,application_id,key,label,required) values
    (target_organization_id,target_school_id,new_application_id,'approval','Admission approved',true),
    (target_organization_id,target_school_id,new_application_id,'offer_acceptance','Offer accepted',true),
    (target_organization_id,target_school_id,new_application_id,'documents','Required documents verified',true),
    (target_organization_id,target_school_id,new_application_id,'payment','Payment condition satisfied',false),
    (target_organization_id,target_school_id,new_application_id,'placement','Final placement confirmed',true),
    (target_organization_id,target_school_id,new_application_id,'guardian','Guardian details complete',true);
  if guardian_person is not null then
    update public.admission_checklist_items set status='complete', completed_by=caller_id, completed_at=now()
    where application_id=new_application_id and key='guardian';
  end if;
  return new_application_id;
end $$;
revoke all on function public.create_admission_application(uuid,uuid,uuid,uuid,text,text,text,date,text,public.admission_source,text,text,text,text,text,text) from public, anon;
grant execute on function public.create_admission_application(uuid,uuid,uuid,uuid,text,text,text,date,text,public.admission_source,text,text,text,text,text,text) to authenticated;

create or replace function public.transition_admission_application(
  target_application_id uuid, target_status public.admission_application_status
) returns public.admission_application_status language plpgsql security definer set search_path = '' as $$
declare app public.admission_applications; allowed boolean := false;
begin
  select * into app from public.admission_applications where id=target_application_id for update;
  if app.id is null or not public.can_access_admissions(app.organization_id,app.school_id,'admissions.manage') then
    raise exception 'Application is unavailable' using errcode='42501';
  end if;
  allowed := case app.status
    when 'enquiry' then target_status in ('application_started','cancelled')
    when 'application_started' then target_status in ('submitted','incomplete','cancelled')
    when 'incomplete' then target_status in ('submitted','cancelled','expired')
    when 'submitted' then target_status in ('under_review','withdrawn')
    when 'under_review' then target_status in ('exam_scheduled','approved','rejected','incomplete','withdrawn')
    when 'exam_scheduled' then target_status in ('exam_taken','cancelled')
    when 'exam_taken' then target_status='under_assessment'
    when 'under_assessment' then target_status in ('retake','approved','rejected')
    when 'retake' then target_status='exam_scheduled'
    when 'approved' then target_status='admission_offered'
    when 'admission_offered' then target_status in ('accepted','withdrawn','expired')
    when 'accepted' then target_status='enrollment_pending'
    when 'enrollment_pending' then target_status='enrolled'
    else false end;
  if not allowed then raise exception 'Admission status transition is invalid' using errcode='22023'; end if;
  update public.admission_applications set status=target_status,updated_by=auth.uid(),updated_at=now(),
    submitted_at=case when target_status='submitted' and submitted_at is null then now() else submitted_at end
  where id=app.id;
  return target_status;
end $$;
revoke all on function public.transition_admission_application(uuid,public.admission_application_status) from public, anon;
grant execute on function public.transition_admission_application(uuid,public.admission_application_status) to authenticated;

create or replace function public.record_entrance_assessment(
  target_application_id uuid, target_scheduled_at timestamptz, target_score numeric default null,
  target_maximum_score numeric default null, target_notes text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare app public.admission_applications; attempt_id uuid; next_attempt smallint; next_status public.assessment_attempt_status;
begin
  select * into app from public.admission_applications where id=target_application_id for update;
  if app.id is null or not public.can_access_admissions(app.organization_id,app.school_id,'admissions.assess') then
    raise exception 'Application is unavailable' using errcode='42501';
  end if;
  if app.status not in ('under_review','exam_scheduled','exam_taken','under_assessment','retake') then
    raise exception 'Application is not ready for assessment' using errcode='22023'; end if;
  if target_score is not null and (target_maximum_score is null or target_maximum_score <= 0 or target_score < 0 or target_score > target_maximum_score) then
    raise exception 'Assessment score is invalid' using errcode='22023'; end if;
  select coalesce(max(attempt_number),0)+1 into next_attempt from public.entrance_assessment_attempts where application_id=app.id;
  next_status := case when target_score is null then 'scheduled' else 'completed' end;
  insert into public.entrance_assessment_attempts(organization_id,school_id,application_id,attempt_number,status,scheduled_at,completed_at,score,maximum_score,assessor_notes)
  values(app.organization_id,app.school_id,app.id,next_attempt,next_status,target_scheduled_at,case when target_score is null then null else now() end,target_score,target_maximum_score,nullif(trim(target_notes),'')) returning id into attempt_id;
  update public.admission_applications set status=(case when target_score is null then 'exam_scheduled' else 'under_assessment' end)::public.admission_application_status,updated_by=auth.uid(),updated_at=now() where id=app.id;
  return attempt_id;
end $$;
revoke all on function public.record_entrance_assessment(uuid,timestamptz,numeric,numeric,text) from public, anon;
grant execute on function public.record_entrance_assessment(uuid,timestamptz,numeric,numeric,text) to authenticated;

create or replace function public.record_admission_decision(
  target_application_id uuid, target_decision public.admission_decision_kind,
  target_level_id uuid, target_rationale text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare app public.admission_applications; decision_id uuid; next_status public.admission_application_status;
begin
  select * into app from public.admission_applications where id=target_application_id for update;
  if app.id is null or not public.can_access_admissions(app.organization_id,app.school_id,'admissions.decide') then
    raise exception 'Application is unavailable' using errcode='42501'; end if;
  if app.status not in ('under_review','under_assessment') then raise exception 'Application is not ready for a decision' using errcode='22023'; end if;
  if char_length(trim(target_rationale)) not between 3 and 2000 or (target_level_id is not null and not exists(
    select 1 from public.class_levels l where l.id=target_level_id and l.organization_id=app.organization_id and l.school_id=app.school_id and l.status='active'
  )) then raise exception 'Decision details are invalid' using errcode='22023'; end if;
  insert into public.admission_decisions(organization_id,school_id,application_id,decision,recommended_class_level_id,rationale)
  values(app.organization_id,app.school_id,app.id,target_decision,target_level_id,trim(target_rationale)) returning id into decision_id;
  next_status := target_decision::text::public.admission_application_status;
  update public.admission_applications set status=next_status,updated_by=auth.uid(),updated_at=now() where id=app.id;
  if target_decision='approved' then update public.admission_checklist_items set status='complete',completed_by=auth.uid(),completed_at=now() where application_id=app.id and key='approval'; end if;
  return decision_id;
end $$;
revoke all on function public.record_admission_decision(uuid,public.admission_decision_kind,uuid,text) from public, anon;
grant execute on function public.record_admission_decision(uuid,public.admission_decision_kind,uuid,text) to authenticated;

create or replace function public.issue_admission_offer(
  target_application_id uuid, target_session_id uuid, target_level_id uuid,
  target_arm_id uuid, target_expires_at timestamptz
) returns uuid language plpgsql security definer set search_path = '' as $$
declare app public.admission_applications; offer_id uuid;
begin
  select * into app from public.admission_applications where id=target_application_id for update;
  if app.id is null or app.status <> 'approved' or not public.can_access_admissions(app.organization_id,app.school_id,'admissions.decide') then
    raise exception 'Application is unavailable for an offer' using errcode='42501'; end if;
  insert into public.admission_offers(organization_id,school_id,application_id,academic_session_id,offered_class_level_id,offered_class_arm_id,status,issued_at,expires_at)
  values(app.organization_id,app.school_id,app.id,target_session_id,target_level_id,target_arm_id,'issued',now(),target_expires_at) returning id into offer_id;
  update public.admission_applications set status='admission_offered',updated_by=auth.uid(),updated_at=now() where id=app.id;
  return offer_id;
end $$;
revoke all on function public.issue_admission_offer(uuid,uuid,uuid,uuid,timestamptz) from public, anon;
grant execute on function public.issue_admission_offer(uuid,uuid,uuid,uuid,timestamptz) to authenticated;

create or replace function public.respond_to_admission_offer(target_application_id uuid, accept_offer boolean)
returns public.offer_status language plpgsql security definer set search_path = '' as $$
declare app public.admission_applications; next_offer public.offer_status; caller uuid:=auth.uid();
begin
  select * into app from public.admission_applications where id=target_application_id for update;
  if app.id is null or app.status <> 'admission_offered' or not public.can_access_admissions(app.organization_id,app.school_id,'admissions.manage') then
    raise exception 'Offer is unavailable' using errcode='42501'; end if;
  next_offer:=case when accept_offer then 'accepted' else 'declined' end;
  update public.admission_offers set status=next_offer,responded_at=now(),updated_at=now() where application_id=app.id and status='issued';
  if not found then raise exception 'Offer is unavailable' using errcode='42501'; end if;
  update public.admission_applications set status=(case when accept_offer then 'accepted' else 'withdrawn' end)::public.admission_application_status,updated_by=caller,updated_at=now() where id=app.id;
  if accept_offer then update public.admission_checklist_items set status='complete',completed_by=caller,completed_at=now() where application_id=app.id and key='offer_acceptance'; end if;
  return next_offer;
end $$;
revoke all on function public.respond_to_admission_offer(uuid,boolean) from public, anon;
grant execute on function public.respond_to_admission_offer(uuid,boolean) to authenticated;

create or replace function public.set_admission_checklist_item(target_item_id uuid, target_status public.checklist_item_status)
returns public.checklist_item_status language plpgsql security definer set search_path = '' as $$
declare item public.admission_checklist_items;
begin
  select * into item from public.admission_checklist_items where id=target_item_id for update;
  if item.id is null or not public.can_access_admissions(item.organization_id,item.school_id,'admissions.enroll') then
    raise exception 'Checklist item is unavailable' using errcode='42501'; end if;
  update public.admission_checklist_items set status=target_status,
    completed_by=case when target_status='complete' then auth.uid() else null end,
    completed_at=case when target_status='complete' then now() else null end,updated_at=now()
  where id=item.id;
  return target_status;
end $$;
revoke all on function public.set_admission_checklist_item(uuid,public.checklist_item_status) from public, anon;
grant execute on function public.set_admission_checklist_item(uuid,public.checklist_item_status) to authenticated;

create or replace function public.convert_admission_to_student(
  target_application_id uuid, target_student_number text, enrollment_date date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare app public.admission_applications; offer public.admission_offers; student_id uuid; enrollment_id uuid; guardian public.admission_guardians;
begin
  select * into app from public.admission_applications where id=target_application_id for update;
  if app.id is null or app.status not in ('accepted','enrollment_pending')
    or not public.can_access_admissions(app.organization_id,app.school_id,'admissions.enroll')
    or not public.can_access_students(app.organization_id,app.school_id,'students.manage')
  then raise exception 'Application is unavailable for enrollment' using errcode='42501'; end if;
  if exists(select 1 from public.admission_checklist_items where application_id=app.id and required and status not in ('complete','waived')) then
    raise exception 'Required enrollment checklist items are incomplete' using errcode='22023'; end if;
  select * into offer from public.admission_offers where application_id=app.id and status='accepted';
  if offer.id is null then raise exception 'An accepted offer is required' using errcode='22023'; end if;
  insert into public.student_profiles(organization_id,person_id,student_number,date_of_birth,gender,status,created_by,updated_by)
  values(app.organization_id,app.applicant_person_id,upper(trim(target_student_number)),app.date_of_birth,app.gender,'active',auth.uid(),auth.uid()) returning id into student_id;
  insert into public.student_enrollments(organization_id,school_id,student_id,academic_session_id,status,enrolled_on,created_by,updated_by)
  values(app.organization_id,app.school_id,student_id,offer.academic_session_id,'active',enrollment_date,auth.uid(),auth.uid()) returning id into enrollment_id;
  insert into public.class_memberships(organization_id,school_id,student_id,enrollment_id,academic_session_id,class_level_id,class_arm_id,started_on,created_by,updated_by)
  values(app.organization_id,app.school_id,student_id,enrollment_id,offer.academic_session_id,offer.offered_class_level_id,offer.offered_class_arm_id,enrollment_date,auth.uid(),auth.uid());
  for guardian in select * from public.admission_guardians where application_id=app.id loop
    insert into public.guardian_relationships(organization_id,student_id,guardian_person_id,relationship_type,is_primary_contact,is_financially_responsible,created_by,updated_by)
    values(app.organization_id,student_id,guardian.guardian_person_id,guardian.relationship_type,guardian.is_primary_contact,guardian.is_financially_responsible,auth.uid(),auth.uid());
  end loop;
  update public.admission_applications set status='enrolled',enrolled_student_id=student_id,updated_by=auth.uid(),updated_at=now() where id=app.id;
  return student_id;
end $$;
revoke all on function public.convert_admission_to_student(uuid,text,date) from public, anon;
grant execute on function public.convert_admission_to_student(uuid,text,date) to authenticated;

do $$ declare table_name text; begin
  foreach table_name in array array['admission_applications','admission_guardians','entrance_assessment_attempts','admission_decisions','admission_offers','admission_checklist_items'] loop
    execute format('alter table public.%I enable row level security',table_name);
  end loop;
end $$;

create policy admission_applications_select on public.admission_applications for select to authenticated using(public.can_access_admissions(organization_id,school_id,'admissions.view'));
create policy admission_applications_update on public.admission_applications for update to authenticated using(public.can_access_admissions(organization_id,school_id,'admissions.manage')) with check(public.can_access_admissions(organization_id,school_id,'admissions.manage'));
create policy admission_guardians_select on public.admission_guardians for select to authenticated using(public.can_access_admissions(organization_id,school_id,'admissions.view'));
create policy entrance_assessments_select on public.entrance_assessment_attempts for select to authenticated using(public.can_access_admissions(organization_id,school_id,'admissions.view'));
create policy admission_decisions_select on public.admission_decisions for select to authenticated using(public.can_access_admissions(organization_id,school_id,'admissions.view'));
create policy admission_offers_select on public.admission_offers for select to authenticated using(public.can_access_admissions(organization_id,school_id,'admissions.view'));
create policy admission_checklist_select on public.admission_checklist_items for select to authenticated using(public.can_access_admissions(organization_id,school_id,'admissions.view'));

create policy people_select_admissions on public.people for select to authenticated using(
  exists(select 1 from public.admission_applications a where a.applicant_person_id=people.id and public.can_access_admissions(a.organization_id,a.school_id,'admissions.view'))
  or exists(select 1 from public.admission_guardians g where g.guardian_person_id=people.id and public.can_access_admissions(g.organization_id,g.school_id,'admissions.view'))
);

revoke all on public.admission_applications,public.admission_guardians,public.entrance_assessment_attempts,public.admission_decisions,public.admission_offers,public.admission_checklist_items from anon,authenticated;
grant select on public.admission_applications,public.admission_guardians,public.entrance_assessment_attempts,public.admission_decisions,public.admission_offers,public.admission_checklist_items to authenticated;

do $$ declare table_name text; begin
  foreach table_name in array array['admission_applications','admission_offers','admission_checklist_items'] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()',table_name,table_name);
  end loop;
  foreach table_name in array array['admission_applications','admission_guardians','entrance_assessment_attempts','admission_decisions','admission_offers','admission_checklist_items'] loop
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.capture_audit_event()',table_name,table_name);
  end loop;
end $$;

comment on table public.admission_applications is 'School-scoped applicant lifecycle; conversion reuses Person and creates the student master atomically.';
comment on table public.entrance_assessment_attempts is 'Immutable attempt sequence preserving manual entrance-assessment and retake history.';
comment on table public.admission_checklist_items is 'Persisted, configurable enrollment readiness checklist evaluated by atomic conversion.';
