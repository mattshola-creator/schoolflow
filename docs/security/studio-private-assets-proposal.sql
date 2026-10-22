-- REVIEW ONLY. Requires the first Studio persistence proposal, in that order.
-- No application, Storage operation or grant is authorized by this file.
do $$ begin raise exception 'Specific Studio asset security approval required'; end $$;

create function public.school_branding_images_allowed(org uuid,school uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.schools s where s.id=school and s.organization_id=org and s.status='active') and public.has_school_membership(org,school)
 and public.has_module_entitlement(org,'foundation')
 and public.is_feature_enabled(org,'foundation.authorization_inspection')
 and 1=(select count(*) from public.organization_plans op join public.plans p on p.id=op.plan_id and p.is_active
  where op.organization_id=org and op.status in ('active','trialing') and op.starts_at<=now() and (op.ends_at is null or op.ends_at>now()))
 and exists(select 1 from public.organization_plans op join public.plans p on p.id=op.plan_id and p.is_active
  where op.organization_id=org and op.status='active' and p.key in ('professional','enterprise')
   and op.starts_at<=now() and (op.ends_at is null or op.ends_at>now()))
$$;
revoke all on function public.school_branding_images_allowed(uuid,uuid) from public,anon;
grant execute on function public.school_branding_images_allowed(uuid,uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('schoolflow-branding','schoolflow-branding',false,5242880,array['image/webp']);
-- RESTRICTIVE policies also defeat any unrelated broad permissive Storage policy.
-- No direct authenticated/anon uploads, reads, signing, replacement or removal.
create policy branding_storage_deny_clients on storage.objects as restrictive
 for all to anon,authenticated
 using(bucket_id<>'schoolflow-branding') with check(bucket_id<>'schoolflow-branding');

create table public.school_branding_assets(
 id uuid primary key,organization_id uuid not null,school_id uuid not null,
 object_key text not null unique,sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 byte_size bigint not null check(byte_size between 1 and 5242880),
 width integer not null check(width between 1 and 1920),
 height integer not null check(height between 1 and 1080),
 mime_type text not null check(mime_type='image/webp'),
 processor_version text not null check(length(processor_version) between 1 and 80),
 created_by uuid not null references public.profiles(id),created_at timestamptz not null default now(),
 unique(id,organization_id,school_id),
 foreign key(school_id,organization_id) references public.schools(id,organization_id),
 check(object_key=organization_id::text||'/'||school_id::text||'/'||id::text||'.webp')
);
-- Rows attest immutable, fully processed bytes. Only the trusted processor inserts.
-- User-controlled metadata or object existence alone is not an attestation.
alter table public.school_branding_assets enable row level security;
revoke all on public.school_branding_assets from public,anon,authenticated,service_role;
grant select,insert on public.school_branding_assets to service_role;

create table public.school_branding_version_assets(
 id uuid primary key default gen_random_uuid(),version_id uuid not null unique,asset_id uuid not null,organization_id uuid not null,school_id uuid not null,
 created_by uuid not null references public.profiles(id),created_at timestamptz not null default now(),
 foreign key(version_id,organization_id,school_id) references public.school_branding_versions(id,organization_id,school_id),
 foreign key(asset_id,organization_id,school_id) references public.school_branding_assets(id,organization_id,school_id)
);
alter table public.school_branding_version_assets enable row level security;
revoke all on public.school_branding_version_assets from public,anon,authenticated,service_role;
grant select on public.school_branding_version_assets to service_role;
-- No direct client writes or reads. The authenticated RPC binds a processed asset
-- only to a newly created draft. Existing or published versions are immutable.
create function public.save_school_branding_asset_draft(org uuid,school uuid,expected_revision bigint,request_id uuid,config jsonb,asset uuid,restore_version uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid; previous uuid; bound uuid;
begin
 if not public.can_manage_school_branding(org,school)
  or not public.school_branding_images_allowed(org,school) then
  raise exception 'Not authorized or not entitled' using errcode='42501'; end if;
 if not exists(select 1 from public.school_branding_assets a where a.id=asset and a.organization_id=org and a.school_id=school) then
  raise exception 'Processed asset unavailable' using errcode='42501'; end if;
 -- Same school lock as the base draft/publication RPC; serializes both entry points.
 insert into public.school_branding_state(organization_id,school_id,updated_by) values(org,school,auth.uid()) on conflict do nothing;
 perform 1 from public.school_branding_state s where s.organization_id=org and s.school_id=school for update;
 select v.id into previous from public.school_branding_versions v where v.organization_id=org and v.school_id=school and v.request_id=save_school_branding_asset_draft.request_id;
 if previous is not null then
  select va.asset_id into bound from public.school_branding_version_assets va where va.version_id=previous;
  if bound is distinct from asset then raise exception 'Request asset differs' using errcode='23514'; end if;
 end if;
 if restore_version is not null and not exists(select 1 from public.school_branding_version_assets va where va.version_id=restore_version and va.asset_id=asset and va.organization_id=org and va.school_id=school) then
  raise exception 'Restore asset differs' using errcode='42501'; end if;
 target:=public.save_school_branding_draft(org,school,expected_revision,request_id,config,restore_version);
 if previous is null then
  insert into public.school_branding_version_assets(version_id,asset_id,organization_id,school_id,created_by) values(target,asset,org,school,auth.uid());
 end if;
 return target;
end $$;
revoke all on function public.save_school_branding_asset_draft(uuid,uuid,bigint,uuid,jsonb,uuid,uuid) from public,anon;
grant execute on function public.save_school_branding_asset_draft(uuid,uuid,bigint,uuid,jsonb,uuid,uuid) to authenticated;

-- Every publication, including base-RPC calls, rechecks premium image entitlement.
create function private.guard_branding_asset_publication() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.published_version_id is distinct from old.published_version_id
  and exists(select 1 from public.school_branding_version_assets va where va.version_id=new.published_version_id)
  and (not public.can_manage_school_branding(new.organization_id,new.school_id)
   or not public.school_branding_images_allowed(new.organization_id,new.school_id)) then
  raise exception 'Image publication not authorized or entitled' using errcode='42501';
 end if;
 return new;
end $$;
revoke all on function private.guard_branding_asset_publication() from public,anon,authenticated;
create trigger guard_branding_asset_publication before update on public.school_branding_state
 for each row execute function private.guard_branding_asset_publication();
-- The processor supplies created_by from server-verified identity, never request JSON.
-- Service JWTs do not carry the originating Owner in auth.uid().
create function private.capture_branding_asset_audit() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.audit_events(organization_id,school_id,actor_user_id,action,entity_type,entity_id,metadata)
 values(new.organization_id,new.school_id,new.created_by,'insert.school_branding_assets','school_branding_assets',new.id,
  jsonb_build_object('processorVersion',new.processor_version));
 return new;
end $$;
revoke all on function private.capture_branding_asset_audit() from public,anon,authenticated,service_role;
create trigger audit_school_branding_assets after insert on public.school_branding_assets
 for each row execute function private.capture_branding_asset_audit();
create trigger audit_school_branding_version_assets after insert on public.school_branding_version_assets
 for each row execute function private.capture_audit_event();
-- No background URL or arbitrary styling enters JSON. Binding stores UUIDs only.
-- Rollback: disable Studio flag and signing/processing endpoints; retain versions,
-- bindings, objects and audit. Any physical purge requires a separate retention decision.
