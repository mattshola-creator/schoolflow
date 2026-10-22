-- NOT APPROVED / NOT APPLIED. Review-only first persistence slice.
-- Move to a CLI-generated migration only after specific founder authorization.
-- Execution guard must be removed by a separately reviewed commit.
do $$ begin raise exception 'Studio persistence security approval is required'; end $$;

create function public.can_manage_school_branding(org uuid,school uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and public.has_school_membership(org,school)
 and public.has_permission(org,school,'school.manage')
 and public.has_module_entitlement(org,'foundation')
 and public.is_feature_enabled(org,'foundation.authorization_inspection')
 and exists(select 1 from public.role_assignments ra join public.roles r on r.id=ra.role_id
   where ra.user_id=auth.uid() and ra.organization_id=org and r.organization_id=org
    and r.key='organization_owner' and ra.scope='organization' and ra.status='active'
    and ra.effective_from<=now() and (ra.effective_to is null or ra.effective_to>now()))
$$;
revoke all on function public.can_manage_school_branding(uuid,uuid) from public,anon;
grant execute on function public.can_manage_school_branding(uuid,uuid) to authenticated;

create function public.school_branding_theme_allowed(org uuid,school uuid,theme text)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and public.has_school_membership(org,school)
 and public.has_module_entitlement(org,'foundation') and coalesce((
  select case
   when theme in ('emerald','ocean','amethyst','sunrise','slate','midnight','premium-emerald','classic-light','midnight-emerald') then true
   when theme in ('obsidian','aurora') then op.status='active' and p.key in ('growth','professional','enterprise')
   when theme in ('winter-frost','autumn-heritage','spring-bloom','midnight-luxe') then op.status='active' and p.key in ('professional','enterprise')
   else false end
  from public.organization_plans op join public.plans p on p.id=op.plan_id and p.is_active
  where op.organization_id=org and op.status in ('active','trialing') and op.starts_at<=now()
   and (op.ends_at is null or op.ends_at>now())
   and 1=(select count(*) from public.organization_plans x join public.plans px on px.id=x.plan_id and px.is_active
      where x.organization_id=org and x.status in ('active','trialing') and x.starts_at<=now() and (x.ends_at is null or x.ends_at>now()))
 ),false)
$$;
revoke all on function public.school_branding_theme_allowed(uuid,uuid,text) from public,anon;
grant execute on function public.school_branding_theme_allowed(uuid,uuid,text) to authenticated;

create function private.valid_school_branding(c jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
begin
 if jsonb_typeof(c)<>'object' or not c ?& array['themeId','preset','focalX','focalY','overlay']
  or (c-array['themeId','preset','focalX','focalY','overlay'])<>'{}'::jsonb then return false; end if;
 if jsonb_typeof(c->'themeId')<>'string' or jsonb_typeof(c->'preset')<>'string'
  or jsonb_typeof(c->'focalX')<>'number' or jsonb_typeof(c->'focalY')<>'number' or jsonb_typeof(c->'overlay')<>'number' then return false; end if;
 return c->>'themeId' in ('emerald','ocean','amethyst','sunrise','slate','midnight','obsidian','aurora','winter-frost','autumn-heritage','spring-bloom','midnight-luxe','premium-emerald','classic-light','midnight-emerald')
  and c->>'preset' in ('executive','analytics','action-first')
  and (c->>'focalX')::numeric between 0 and 100 and (c->>'focalY')::numeric between 0 and 100
  and (c->>'overlay')::numeric between 0.65 and 0.85;
end $$;
revoke all on function private.valid_school_branding(jsonb) from public,anon,authenticated;

create table public.school_branding_versions(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null,
 school_id uuid not null,version bigint not null check(version>0),request_id uuid not null,
 config jsonb not null check(private.valid_school_branding(config)),
 restored_from uuid,created_by uuid not null references public.profiles(id),created_at timestamptz not null default now(),
 unique(id,organization_id,school_id),unique(organization_id,school_id,version),unique(organization_id,school_id,request_id),
 foreign key(school_id,organization_id) references public.schools(id,organization_id),
 foreign key(restored_from,organization_id,school_id) references public.school_branding_versions(id,organization_id,school_id)
);
create table public.school_branding_state(
 organization_id uuid not null,school_id uuid not null,revision bigint not null default 0,
 draft_version_id uuid,published_version_id uuid,updated_by uuid not null references public.profiles(id),updated_at timestamptz not null default now(),
 primary key(organization_id,school_id),foreign key(school_id,organization_id) references public.schools(id,organization_id),
 foreign key(draft_version_id,organization_id,school_id) references public.school_branding_versions(id,organization_id,school_id),
 foreign key(published_version_id,organization_id,school_id) references public.school_branding_versions(id,organization_id,school_id)
);
create table public.school_appearance_preferences(
 organization_id uuid not null,school_id uuid not null,user_id uuid not null references public.profiles(id),
 theme_id text,revision bigint not null default 0,updated_at timestamptz not null default now(),
 primary key(organization_id,school_id,user_id),foreign key(school_id,organization_id) references public.schools(id,organization_id)
);
alter table public.school_branding_versions enable row level security;
alter table public.school_branding_state enable row level security;
alter table public.school_appearance_preferences enable row level security;
revoke all on public.school_branding_versions,public.school_branding_state,public.school_appearance_preferences from public,anon,authenticated;
grant select on public.school_branding_versions,public.school_branding_state,public.school_appearance_preferences to authenticated;
create policy branding_state_read on public.school_branding_state for select to authenticated using(public.has_school_membership(organization_id,school_id));
create policy branding_versions_read on public.school_branding_versions for select to authenticated using(
 public.can_manage_school_branding(organization_id,school_id) or
 (public.has_school_membership(organization_id,school_id) and exists(select 1 from public.school_branding_state s
  where s.organization_id=school_branding_versions.organization_id and s.school_id=school_branding_versions.school_id and s.published_version_id=school_branding_versions.id)));
create policy appearance_preference_read on public.school_appearance_preferences for select to authenticated using(user_id=auth.uid() and public.has_school_membership(organization_id,school_id));
-- No direct authenticated INSERT/UPDATE/DELETE grants or policies.

create function public.save_school_branding_draft(org uuid,school uuid,expected_revision bigint,request_id uuid,config jsonb,restore_version uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare state_row public.school_branding_state%rowtype; existing public.school_branding_versions%rowtype; version_id uuid;
begin
 if not public.can_manage_school_branding(org,school) then raise exception 'Not authorized' using errcode='42501'; end if;
 if not private.valid_school_branding(config) or not public.school_branding_theme_allowed(org,school,config->>'themeId') then raise exception 'Appearance not permitted' using errcode='23514'; end if;
 insert into public.school_branding_state(organization_id,school_id,updated_by) values(org,school,auth.uid()) on conflict do nothing;
 select * into state_row from public.school_branding_state s where s.organization_id=org and s.school_id=school for update;
 select * into existing from public.school_branding_versions v where v.organization_id=org and v.school_id=school and v.request_id=save_school_branding_draft.request_id;
 if found then
  if existing.config is distinct from config or existing.restored_from is distinct from restore_version then raise exception 'Request reuse differs' using errcode='23514'; end if;
  return existing.id;
 end if;
 if state_row.revision<>expected_revision then raise exception 'Appearance changed; reload before saving' using errcode='40001'; end if;
 if restore_version is not null and not exists(select 1 from public.school_branding_versions v where v.id=restore_version and v.organization_id=org and v.school_id=school and v.config=save_school_branding_draft.config) then raise exception 'Restore source unavailable' using errcode='42501'; end if;
 insert into public.school_branding_versions(organization_id,school_id,version,request_id,config,restored_from,created_by)
  values(org,school,(select coalesce(max(v.version),0)+1 from public.school_branding_versions v where v.organization_id=org and v.school_id=school),request_id,config,restore_version,auth.uid()) returning id into version_id;
 update public.school_branding_state set draft_version_id=version_id,revision=revision+1,updated_by=auth.uid(),updated_at=now() where organization_id=org and school_id=school;
 return version_id;
end $$;
revoke all on function public.save_school_branding_draft(uuid,uuid,bigint,uuid,jsonb,uuid) from public,anon;
grant execute on function public.save_school_branding_draft(uuid,uuid,bigint,uuid,jsonb,uuid) to authenticated;

create function public.publish_school_branding(org uuid,school uuid,target_version uuid,expected_revision bigint)
returns uuid language plpgsql security definer set search_path='' as $$
declare state_row public.school_branding_state%rowtype; target_config jsonb;
begin
 if not public.can_manage_school_branding(org,school) then raise exception 'Not authorized' using errcode='42501'; end if;
 select * into state_row from public.school_branding_state s where s.organization_id=org and s.school_id=school for update;
 if not found then raise exception 'Draft unavailable' using errcode='P0002'; end if;
 select v.config into target_config from public.school_branding_versions v where v.id=target_version and v.organization_id=org and v.school_id=school;
 if not found or not public.school_branding_theme_allowed(org,school,target_config->>'themeId') then raise exception 'Draft unavailable or no longer entitled' using errcode='42501'; end if;
 if state_row.published_version_id=target_version then return target_version; end if;
 if state_row.revision<>expected_revision or state_row.draft_version_id<>target_version then raise exception 'Draft changed; reload' using errcode='40001'; end if;
 update public.school_branding_state set published_version_id=target_version,revision=revision+1,updated_by=auth.uid(),updated_at=now() where organization_id=org and school_id=school;
 insert into public.audit_events(organization_id,school_id,actor_user_id,action,entity_type,entity_id,metadata)
 values(org,school,auth.uid(),'branding.published','school_branding_versions',target_version,
  jsonb_build_object('previousVersionId',state_row.published_version_id,'publishedVersionId',target_version));
 return target_version;
end $$;
revoke all on function public.publish_school_branding(uuid,uuid,uuid,bigint) from public,anon;
grant execute on function public.publish_school_branding(uuid,uuid,uuid,bigint) to authenticated;

create function public.set_school_appearance_preference(org uuid,school uuid,theme text,expected_revision bigint)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.has_school_membership(org,school) or (theme is not null and not public.school_branding_theme_allowed(org,school,theme)) then raise exception 'Not authorized' using errcode='42501'; end if;
 insert into public.school_appearance_preferences(organization_id,school_id,user_id) values(org,school,auth.uid()) on conflict do nothing;
 update public.school_appearance_preferences set theme_id=theme,revision=revision+1,updated_at=now()
 where organization_id=org and school_id=school and user_id=auth.uid() and revision=expected_revision;
 if not found then raise exception 'Preference changed; reload' using errcode='40001'; end if;
end $$;
revoke all on function public.set_school_appearance_preference(uuid,uuid,text,bigint) from public,anon;
grant execute on function public.set_school_appearance_preference(uuid,uuid,text,bigint) to authenticated;

create trigger audit_school_branding_versions after insert on public.school_branding_versions for each row execute function private.capture_audit_event();
create trigger audit_school_branding_state after insert or update on public.school_branding_state for each row execute function private.capture_audit_event();
create trigger audit_school_appearance_preferences after insert or update on public.school_appearance_preferences for each row execute function private.capture_audit_event();
-- Private background Storage/asset attestation is a separate bounded slice. No bucket or image-publishing authority is added here.
-- Rollback: disable the Studio application opt-in; keep append-only versions/audit. Do not drop retained customer history.
