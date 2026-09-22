create type public.admission_document_status as enum (
  'required', 'submitted', 'verified', 'rejected', 'not_applicable'
);

insert into public.permissions (key, description) values
  ('admissions.documents.configure', 'Configure school admission document requirements'),
  ('admissions.documents.submit', 'Submit admission document evidence'),
  ('admissions.documents.review', 'Review admission document evidence')
on conflict (key) do nothing;

insert into public.role_permissions (organization_id, role_id, permission_id)
select r.organization_id, r.id, p.id
from public.roles r cross join public.permissions p
where r.key = 'organization_owner' and p.key like 'admissions.documents.%'
on conflict do nothing;

create table public.admission_document_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  category_key text not null check (category_key ~ '^[a-z]+(?:_[a-z]+)*$'),
  label text not null check (char_length(trim(label)) between 2 and 120),
  required boolean not null default true,
  enabled boolean not null default true,
  not_applicable_allowed boolean not null default false,
  version integer not null default 1 check (version > 0),
  created_by uuid references auth.users(id) on delete restrict,
  updated_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (school_id, organization_id) references public.schools(id, organization_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (school_id, category_key)
);

create table public.admission_application_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  school_id uuid not null,
  application_id uuid not null,
  policy_id uuid,
  policy_version integer not null check (policy_version > 0),
  category_key text not null check (category_key ~ '^[a-z]+(?:_[a-z]+)*$'),
  label text not null check (char_length(trim(label)) between 2 and 120),
  required boolean not null default true,
  not_applicable_allowed boolean not null default false,
  status public.admission_document_status not null default 'required',
  document_id uuid,
  submitted_by uuid references auth.users(id) on delete restrict,
  submitted_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  review_comment text check (review_comment is null or char_length(trim(review_comment)) between 3 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (application_id, organization_id, school_id)
    references public.admission_applications(id, organization_id, school_id) on delete restrict,
  foreign key (policy_id, organization_id, school_id)
    references public.admission_document_policies(id, organization_id, school_id) on delete restrict,
  foreign key (document_id, organization_id, school_id)
    references public.documents(id, organization_id, school_id) on delete restrict,
  unique (id, organization_id, school_id),
  unique (application_id, category_key),
  check (
    (status = 'required' and document_id is null and submitted_by is null and submitted_at is null and reviewed_by is null and reviewed_at is null)
    or (status = 'submitted' and document_id is not null and submitted_by is not null and submitted_at is not null and reviewed_by is null and reviewed_at is null)
    or (status in ('verified','rejected') and document_id is not null and submitted_by is not null and submitted_at is not null and reviewed_by is not null and reviewed_at is not null)
    or (status = 'not_applicable' and document_id is null and reviewed_by is not null and reviewed_at is not null and review_comment is not null and not_applicable_allowed)
  )
);

create index admission_document_policies_school_idx
  on public.admission_document_policies (organization_id, school_id, enabled, category_key);
create index admission_application_documents_application_idx
  on public.admission_application_documents (application_id, status, required);
create unique index admission_application_documents_document_idx
  on public.admission_application_documents (document_id) where document_id is not null;

insert into public.admission_document_policies (
  organization_id, school_id, category_key, label, required, enabled, not_applicable_allowed
)
select s.organization_id, s.id, v.category_key, v.label, true, true, false
from public.schools s
cross join (values
  ('birth_certificate_or_age_declaration', 'Birth certificate or age declaration'),
  ('applicant_passport_photograph', 'Applicant passport photograph')
) as v(category_key, label)
on conflict (school_id, category_key) do nothing;

create or replace function private.seed_admission_document_policies()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.admission_document_policies (
    organization_id, school_id, category_key, label, required, enabled, not_applicable_allowed
  ) values
    (new.organization_id, new.id, 'birth_certificate_or_age_declaration', 'Birth certificate or age declaration', true, true, false),
    (new.organization_id, new.id, 'applicant_passport_photograph', 'Applicant passport photograph', true, true, false)
  on conflict (school_id, category_key) do nothing;
  return new;
end $$;
revoke all on function private.seed_admission_document_policies() from public, anon, authenticated;
create trigger seed_admission_document_policies
after insert on public.schools for each row execute function private.seed_admission_document_policies();

create or replace function private.snapshot_admission_document_policy(
  target_application_id uuid,
  target_organization_id uuid,
  target_school_id uuid
) returns void language sql security definer set search_path = '' as $$
  insert into public.admission_application_documents (
    organization_id, school_id, application_id, policy_id, policy_version,
    category_key, label, required, not_applicable_allowed
  )
  select p.organization_id, p.school_id, target_application_id, p.id, p.version,
    p.category_key, p.label, p.required, p.not_applicable_allowed
  from public.admission_document_policies p
  where p.organization_id = target_organization_id and p.school_id = target_school_id and p.enabled
  on conflict (application_id, category_key) do nothing
$$;
revoke all on function private.snapshot_admission_document_policy(uuid,uuid,uuid) from public, anon, authenticated;

create or replace function private.snapshot_new_admission_documents()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.snapshot_admission_document_policy(new.id, new.organization_id, new.school_id);
  return new;
end $$;
revoke all on function private.snapshot_new_admission_documents() from public, anon, authenticated;
create trigger snapshot_new_admission_documents
after insert on public.admission_applications for each row execute function private.snapshot_new_admission_documents();

create or replace function public.configure_admission_document_policy(
  target_school_id uuid, target_category_key text, target_label text,
  target_required boolean, target_enabled boolean
) returns uuid language plpgsql security definer set search_path = '' as $$
declare target_school public.schools; policy_id uuid; caller uuid := (select auth.uid());
begin
  select * into target_school from public.schools where id = target_school_id;
  if caller is null or target_school.id is null or not public.can_access_admissions(
    target_school.organization_id, target_school.id, 'admissions.documents.configure'
  ) then raise exception 'Document policy is unavailable' using errcode = '42501'; end if;
  if target_category_key !~ '^[a-z]+(?:_[a-z]+)*$' or char_length(trim(target_label)) not between 2 and 120 then
    raise exception 'Document policy is invalid' using errcode = '22023'; end if;
  insert into public.admission_document_policies (
    organization_id, school_id, category_key, label, required, enabled,
    not_applicable_allowed, created_by, updated_by
  ) values (
    target_school.organization_id, target_school.id, target_category_key, trim(target_label),
    target_required, target_enabled, false, caller, caller
  ) on conflict (school_id, category_key) do update set
    label = excluded.label, required = excluded.required, enabled = excluded.enabled,
    version = admission_document_policies.version + 1, updated_by = caller, updated_at = now()
  returning id into policy_id;
  return policy_id;
end $$;
revoke all on function public.configure_admission_document_policy(uuid,text,text,boolean,boolean) from public, anon;
grant execute on function public.configure_admission_document_policy(uuid,text,text,boolean,boolean) to authenticated;

create or replace function public.initialize_admission_document_requirements(target_application_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare app public.admission_applications; before_count integer; after_count integer;
begin
  select * into app from public.admission_applications where id = target_application_id for update;
  if app.id is null or not public.can_access_admissions(app.organization_id, app.school_id, 'admissions.documents.configure') then
    raise exception 'Application is unavailable' using errcode = '42501'; end if;
  select count(*) into before_count from public.admission_application_documents where application_id = app.id;
  if before_count > 0 then raise exception 'Application requirements are already initialized' using errcode = '22023'; end if;
  perform private.snapshot_admission_document_policy(app.id, app.organization_id, app.school_id);
  select count(*) into after_count from public.admission_application_documents where application_id = app.id;
  if after_count = 0 then raise exception 'No enabled document policy is available' using errcode = '22023'; end if;
  return after_count;
end $$;
revoke all on function public.initialize_admission_document_requirements(uuid) from public, anon;
grant execute on function public.initialize_admission_document_requirements(uuid) to authenticated;

create or replace function public.submit_admission_document(
  target_requirement_id uuid, target_document_id uuid
) returns public.admission_document_status language plpgsql security definer set search_path = '' as $$
declare requirement public.admission_application_documents; evidence public.documents; caller uuid := (select auth.uid());
begin
  select * into requirement from public.admission_application_documents where id = target_requirement_id for update;
  if requirement.id is null or not public.can_access_admissions(
    requirement.organization_id, requirement.school_id, 'admissions.documents.submit'
  ) then raise exception 'Document requirement is unavailable' using errcode = '42501'; end if;
  select * into evidence from public.documents where id = target_document_id;
  if evidence.id is null or evidence.organization_id <> requirement.organization_id
    or evidence.school_id <> requirement.school_id or evidence.status <> 'available'
    or evidence.entity_type <> 'admission_application' or evidence.entity_id <> requirement.application_id
  then raise exception 'Document evidence is unavailable' using errcode = '42501'; end if;
  update public.admission_application_documents set
    document_id = evidence.id, status = 'submitted', submitted_by = caller, submitted_at = now(),
    reviewed_by = null, reviewed_at = null, review_comment = null, updated_at = now()
  where id = requirement.id;
  update public.admission_checklist_items set status = 'pending', completed_by = null, completed_at = null, updated_at = now()
  where application_id = requirement.application_id and key = 'documents';
  return 'submitted';
end $$;
revoke all on function public.submit_admission_document(uuid,uuid) from public, anon;
grant execute on function public.submit_admission_document(uuid,uuid) to authenticated;

create or replace function public.review_admission_document(
  target_requirement_id uuid, target_status public.admission_document_status, target_comment text default null
) returns public.admission_document_status language plpgsql security definer set search_path = '' as $$
declare requirement public.admission_application_documents; caller uuid := (select auth.uid()); satisfied boolean;
begin
  select * into requirement from public.admission_application_documents where id = target_requirement_id for update;
  if requirement.id is null or not public.can_access_admissions(
    requirement.organization_id, requirement.school_id, 'admissions.documents.review'
  ) then raise exception 'Document requirement is unavailable' using errcode = '42501'; end if;
  if target_status in ('verified','rejected') and requirement.status <> 'submitted' then
    raise exception 'Submitted evidence is required' using errcode = '22023'; end if;
  if target_status = 'not_applicable' and (
    not requirement.not_applicable_allowed or nullif(trim(target_comment),'') is null
  ) then raise exception 'Not applicable is unavailable' using errcode = '22023'; end if;
  if target_status not in ('verified','rejected','not_applicable') then
    raise exception 'Review decision is invalid' using errcode = '22023'; end if;
  update public.admission_application_documents set
    status = target_status,
    document_id = case when target_status = 'not_applicable' then null else document_id end,
    reviewed_by = caller, reviewed_at = now(), review_comment = nullif(trim(target_comment),''), updated_at = now()
  where id = requirement.id;
  select exists(select 1 from public.admission_application_documents where application_id = requirement.application_id and required)
    and not exists(
      select 1 from public.admission_application_documents
      where application_id = requirement.application_id and required
        and not (status = 'verified' or (status = 'not_applicable' and not_applicable_allowed))
    ) into satisfied;
  update public.admission_checklist_items set
    status = case when satisfied then 'complete'::public.checklist_item_status else 'pending'::public.checklist_item_status end,
    completed_by = case when satisfied then caller else null end,
    completed_at = case when satisfied then now() else null end,
    updated_at = now()
  where application_id = requirement.application_id and key = 'documents';
  return target_status;
end $$;
revoke all on function public.review_admission_document(uuid,public.admission_document_status,text) from public, anon;
grant execute on function public.review_admission_document(uuid,public.admission_document_status,text) to authenticated;

create or replace function public.set_admission_checklist_item(target_item_id uuid, target_status public.checklist_item_status)
returns public.checklist_item_status language plpgsql security definer set search_path = '' as $$
declare item public.admission_checklist_items;
begin
  select * into item from public.admission_checklist_items where id=target_item_id for update;
  if item.id is null or not public.can_access_admissions(item.organization_id,item.school_id,'admissions.enroll') then
    raise exception 'Checklist item is unavailable' using errcode='42501'; end if;
  if item.key = 'documents' and target_status <> 'pending' then
    if target_status = 'waived' or not exists(
      select 1 from public.admission_application_documents where application_id=item.application_id and required
    ) or exists(
      select 1 from public.admission_application_documents where application_id=item.application_id and required
        and not (status='verified' or (status='not_applicable' and not_applicable_allowed))
    ) then raise exception 'Required document evidence is incomplete' using errcode='22023'; end if;
  end if;
  update public.admission_checklist_items set status=target_status,
    completed_by=case when target_status='complete' then auth.uid() else null end,
    completed_at=case when target_status='complete' then now() else null end,updated_at=now()
  where id=item.id;
  return target_status;
end $$;

alter table public.admission_document_policies enable row level security;
alter table public.admission_application_documents enable row level security;
create policy admission_document_policies_select on public.admission_document_policies for select to authenticated
using (public.can_access_admissions(organization_id, school_id, 'admissions.view'));
create policy admission_application_documents_select on public.admission_application_documents for select to authenticated
using (public.can_access_admissions(organization_id, school_id, 'admissions.view'));

revoke all on public.admission_document_policies, public.admission_application_documents from anon, authenticated;
grant select on public.admission_document_policies, public.admission_application_documents to authenticated;

create trigger set_admission_document_policies_updated_at before update on public.admission_document_policies
for each row execute function private.set_updated_at();
create trigger set_admission_application_documents_updated_at before update on public.admission_application_documents
for each row execute function private.set_updated_at();
create trigger audit_admission_document_policies after insert or update or delete on public.admission_document_policies
for each row execute function private.capture_audit_event();
create trigger audit_admission_application_documents after insert or update or delete on public.admission_application_documents
for each row execute function private.capture_audit_event();

comment on table public.admission_document_policies is 'School-scoped, versioned admissions document policy; changes affect future application snapshots.';
comment on table public.admission_application_documents is 'Per-application immutable policy snapshot and current evidence review state using shared private documents.';
