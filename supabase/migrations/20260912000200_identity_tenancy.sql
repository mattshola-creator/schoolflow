-- M1 Identity and Tenancy. Organization is the tenant boundary.
create extension if not exists pgcrypto with schema extensions;

create type public.lifecycle_status as enum ('active', 'inactive', 'archived');
create type public.membership_status as enum ('invited', 'active', 'suspended', 'ended');
create type public.assignment_scope as enum ('organization', 'management_group', 'school');
create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

create table public.people (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(trim(first_name)) between 1 and 100),
  last_name text not null check (char_length(trim(last_name)) between 1 and 100),
  preferred_name text check (preferred_name is null or char_length(trim(preferred_name)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  person_id uuid not null unique references public.people(id) on delete restrict,
  email text not null,
  status public.lifecycle_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_normalized check (email = lower(trim(email)))
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.lifecycle_status not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.management_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 160),
  status public.lifecycle_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (id, organization_id)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 160),
  address_line text,
  city text,
  state text,
  country_code text not null default 'NG' check (country_code ~ '^[A-Z]{2}$'),
  timezone text not null default 'Africa/Lagos',
  status public.lifecycle_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (id, organization_id)
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  location_id uuid not null references public.locations(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 180),
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,31}$'),
  status public.lifecycle_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code),
  unique (id, organization_id),
  foreign key (location_id, organization_id) references public.locations(id, organization_id)
);

create table public.management_group_schools (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  management_group_id uuid not null references public.management_groups(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (management_group_id, school_id),
  foreign key (management_group_id, organization_id) references public.management_groups(id, organization_id),
  foreign key (school_id, organization_id) references public.schools(id, organization_id)
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  status public.membership_status not null default 'active',
  all_schools boolean not null default false,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_to > effective_from),
  unique (organization_id, user_id)
);

create table public.school_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  school_id uuid not null,
  user_id uuid not null references auth.users(id) on delete restrict,
  status public.membership_status not null default 'active',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_to > effective_from),
  unique (school_id, user_id),
  foreign key (school_id, organization_id) references public.schools(id, organization_id)
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z]+(?:[._][a-z]+)*$'),
  description text not null,
  created_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key text not null check (key ~ '^[a-z]+(?:_[a-z]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, key),
  unique (id, organization_id)
);

create table public.role_permissions (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role_id uuid not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id),
  foreign key (role_id, organization_id) references public.roles(id, organization_id)
);

create table public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  role_id uuid not null,
  scope public.assignment_scope not null,
  management_group_id uuid references public.management_groups(id) on delete cascade,
  school_id uuid,
  status public.membership_status not null default 'active',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_to > effective_from),
  check (
    (scope = 'organization' and management_group_id is null and school_id is null) or
    (scope = 'management_group' and management_group_id is not null and school_id is null) or
    (scope = 'school' and management_group_id is null and school_id is not null)
  ),
  foreign key (role_id, organization_id) references public.roles(id, organization_id),
  foreign key (school_id, organization_id) references public.schools(id, organization_id),
  unique nulls not distinct (user_id, role_id, scope, management_group_id, school_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid,
  role_id uuid not null,
  email text not null,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  invited_by uuid not null references auth.users(id) on delete restrict,
  accepted_by uuid references auth.users(id) on delete restrict,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check (email = lower(trim(email))),
  check (expires_at > created_at),
  foreign key (school_id, organization_id) references public.schools(id, organization_id),
  foreign key (role_id, organization_id) references public.roles(id, organization_id)
);

create index organization_memberships_user_active_idx on public.organization_memberships(user_id, status, organization_id);
create index school_memberships_user_active_idx on public.school_memberships(user_id, status, school_id);
create index schools_organization_status_idx on public.schools(organization_id, status);
create index locations_organization_status_idx on public.locations(organization_id, status);
create index role_assignments_user_scope_idx on public.role_assignments(user_id, organization_id, status, scope);
create index invitations_organization_status_idx on public.invitations(organization_id, status, expires_at);

insert into public.permissions (key, description) values
  ('organization.view', 'View organization details'),
  ('organization.manage', 'Manage organization settings'),
  ('school.view', 'View schools and locations'),
  ('school.manage', 'Manage schools and locations'),
  ('membership.view', 'View organization members'),
  ('membership.manage', 'Invite and manage members'),
  ('role.view', 'View roles and assignments'),
  ('role.manage', 'Manage roles, permissions and assignments'),
  ('profile.view', 'View permitted user profiles'),
  ('profile.manage', 'Manage permitted user profiles');

create or replace function public.has_org_membership(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_memberships m
    where m.organization_id = target_organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.effective_from <= now()
      and (m.effective_to is null or m.effective_to > now())
  );
$$;

create or replace function public.has_school_membership(target_organization_id uuid, target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.user_id = (select auth.uid()) and om.status = 'active'
      and om.effective_from <= now() and (om.effective_to is null or om.effective_to > now())
      and (
        om.all_schools or exists (
          select 1 from public.school_memberships sm
          where sm.organization_id = target_organization_id
            and sm.school_id = target_school_id
            and sm.user_id = (select auth.uid()) and sm.status = 'active'
            and sm.effective_from <= now() and (sm.effective_to is null or sm.effective_to > now())
        )
      )
  );
$$;

create or replace function public.has_permission(target_organization_id uuid, target_school_id uuid, permission_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_org_membership(target_organization_id) and exists (
    select 1
    from public.role_assignments ra
    join public.role_permissions rp on rp.role_id = ra.role_id and rp.organization_id = ra.organization_id
    join public.permissions p on p.id = rp.permission_id
    where ra.organization_id = target_organization_id
      and ra.user_id = (select auth.uid())
      and ra.status = 'active'
      and ra.effective_from <= now() and (ra.effective_to is null or ra.effective_to > now())
      and p.key = permission_key
      and (
        ra.scope = 'organization'
        or (target_school_id is not null and ra.scope = 'school' and ra.school_id = target_school_id)
        or (target_school_id is not null and ra.scope = 'management_group' and exists (
          select 1 from public.management_group_schools mgs
          where mgs.management_group_id = ra.management_group_id and mgs.school_id = target_school_id
        ))
      )
  );
$$;

revoke all on function public.has_org_membership(uuid) from public, anon;
revoke all on function public.has_school_membership(uuid, uuid) from public, anon;
revoke all on function public.has_permission(uuid, uuid, text) from public, anon;
grant execute on function public.has_org_membership(uuid) to authenticated;
grant execute on function public.has_school_membership(uuid, uuid) to authenticated;
grant execute on function public.has_permission(uuid, uuid, text) to authenticated;

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  new_person_id uuid;
  supplied_name text := trim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
begin
  insert into public.people (first_name, last_name)
  values (
    coalesce(nullif(split_part(supplied_name, ' ', 1), ''), split_part(coalesce(new.email, 'User'), '@', 1)),
    coalesce(nullif(trim(substr(supplied_name, length(split_part(supplied_name, ' ', 1)) + 1)), ''), 'Account')
  ) returning id into new_person_id;
  insert into public.profiles (id, person_id, email)
  values (new.id, new_person_id, lower(coalesce(new.email, new.id::text || '@invalid.local')));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function private.handle_new_user();

create or replace function private.bootstrap_organization_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
declare owner_role_id uuid;
begin
  insert into public.organization_memberships (organization_id, user_id, status, all_schools)
  values (new.id, new.created_by, 'active', true);
  insert into public.roles (organization_id, key, name, description, is_system)
  values (new.id, 'organization_owner', 'Organization Owner', 'Full organization administration', true)
  returning id into owner_role_id;
  insert into public.role_permissions (organization_id, role_id, permission_id)
  select new.id, owner_role_id, id from public.permissions;
  insert into public.role_assignments (organization_id, user_id, role_id, scope)
  values (new.id, new.created_by, owner_role_id, 'organization');
  return new;
end;
$$;

create trigger on_organization_created
after insert on public.organizations for each row execute function private.bootstrap_organization_owner();

create or replace function public.accept_invitation(p_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite public.invitations%rowtype;
  caller_email text := lower(coalesce((select auth.jwt() ->> 'email'), ''));
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  select * into invite from public.invitations
    where token_hash = lower(p_token_hash) and status = 'pending' and expires_at > now()
    for update;
  if not found then raise exception 'invitation is invalid or expired'; end if;
  if caller_email = '' or caller_email <> invite.email then raise exception 'invitation email does not match'; end if;
  insert into public.organization_memberships (organization_id, user_id, status, all_schools)
  values (invite.organization_id, (select auth.uid()), 'active', false)
  on conflict (organization_id, user_id) do nothing;
  if not exists (select 1 from public.organization_memberships where organization_id = invite.organization_id and user_id = (select auth.uid()) and status = 'active') then
    raise exception 'membership is not active';
  end if;
  if invite.school_id is not null then
    insert into public.school_memberships (organization_id, school_id, user_id, status)
    values (invite.organization_id, invite.school_id, (select auth.uid()), 'active')
    on conflict (school_id, user_id) do nothing;
  end if;
  insert into public.role_assignments (organization_id, user_id, role_id, scope, school_id)
  values (invite.organization_id, (select auth.uid()), invite.role_id,
    case when invite.school_id is null then 'organization'::public.assignment_scope else 'school'::public.assignment_scope end,
    invite.school_id)
  on conflict do nothing;
  update public.invitations set status = 'accepted', accepted_by = (select auth.uid()), accepted_at = now() where id = invite.id;
  return invite.organization_id;
end;
$$;

revoke all on function public.accept_invitation(text) from public, anon;
grant execute on function public.accept_invitation(text) to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['people','profiles','organizations','management_groups','locations','schools','organization_memberships','school_memberships','roles','role_assignments']
  loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name, table_name);
  end loop;
end $$;

alter table public.people enable row level security;
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.management_groups enable row level security;
alter table public.locations enable row level security;
alter table public.schools enable row level security;
alter table public.management_group_schools enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.school_memberships enable row level security;
alter table public.permissions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.role_assignments enable row level security;
alter table public.invitations enable row level security;

create policy people_select_own on public.people for select to authenticated using (exists (select 1 from public.profiles p where p.person_id = id and p.id = (select auth.uid())));
create policy people_update_own on public.people for update to authenticated using (exists (select 1 from public.profiles p where p.person_id = id and p.id = (select auth.uid()))) with check (exists (select 1 from public.profiles p where p.person_id = id and p.id = (select auth.uid())));
create policy profiles_select_own on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy organizations_select_member on public.organizations for select to authenticated using (public.has_org_membership(id));
create policy organizations_insert_self on public.organizations for insert to authenticated with check (created_by = (select auth.uid()));
create policy organizations_update_authorized on public.organizations for update to authenticated using (public.has_permission(id, null, 'organization.manage')) with check (public.has_permission(id, null, 'organization.manage'));

create policy management_groups_select_member on public.management_groups for select to authenticated using (public.has_org_membership(organization_id));
create policy management_groups_manage on public.management_groups for all to authenticated using (public.has_permission(organization_id, null, 'organization.manage')) with check (public.has_permission(organization_id, null, 'organization.manage'));
create policy locations_select_member on public.locations for select to authenticated using (public.has_org_membership(organization_id));
create policy locations_manage on public.locations for all to authenticated using (public.has_permission(organization_id, null, 'school.manage')) with check (public.has_permission(organization_id, null, 'school.manage'));
create policy schools_select_scoped on public.schools for select to authenticated using (public.has_school_membership(organization_id, id));
create policy schools_manage on public.schools for all to authenticated using (public.has_permission(organization_id, id, 'school.manage') or public.has_permission(organization_id, null, 'school.manage')) with check (public.has_permission(organization_id, null, 'school.manage'));
create policy group_schools_select_member on public.management_group_schools for select to authenticated using (public.has_org_membership(organization_id));
create policy group_schools_manage on public.management_group_schools for all to authenticated using (public.has_permission(organization_id, null, 'school.manage')) with check (public.has_permission(organization_id, null, 'school.manage'));

create policy organization_memberships_select on public.organization_memberships for select to authenticated using (user_id = (select auth.uid()) or public.has_permission(organization_id, null, 'membership.view'));
create policy organization_memberships_manage on public.organization_memberships for all to authenticated using (public.has_permission(organization_id, null, 'membership.manage')) with check (public.has_permission(organization_id, null, 'membership.manage'));
create policy school_memberships_select on public.school_memberships for select to authenticated using (user_id = (select auth.uid()) or public.has_permission(organization_id, school_id, 'membership.view'));
create policy school_memberships_manage on public.school_memberships for all to authenticated using (public.has_permission(organization_id, school_id, 'membership.manage') or public.has_permission(organization_id, null, 'membership.manage')) with check (public.has_permission(organization_id, null, 'membership.manage'));

create policy permissions_select_authenticated on public.permissions for select to authenticated using (true);
create policy roles_select_member on public.roles for select to authenticated using (public.has_org_membership(organization_id));
create policy roles_manage on public.roles for all to authenticated using (public.has_permission(organization_id, null, 'role.manage')) with check (public.has_permission(organization_id, null, 'role.manage'));
create policy role_permissions_select_member on public.role_permissions for select to authenticated using (public.has_org_membership(organization_id));
create policy role_permissions_manage on public.role_permissions for all to authenticated using (public.has_permission(organization_id, null, 'role.manage')) with check (public.has_permission(organization_id, null, 'role.manage'));
create policy role_assignments_select on public.role_assignments for select to authenticated using (user_id = (select auth.uid()) or public.has_permission(organization_id, null, 'role.view'));
create policy role_assignments_manage on public.role_assignments for all to authenticated using (public.has_permission(organization_id, null, 'role.manage')) with check (public.has_permission(organization_id, null, 'role.manage'));
create policy invitations_select_authorized on public.invitations for select to authenticated using (public.has_permission(organization_id, school_id, 'membership.view') or public.has_permission(organization_id, null, 'membership.view'));
create policy invitations_manage on public.invitations for all to authenticated using (public.has_permission(organization_id, school_id, 'membership.manage') or public.has_permission(organization_id, null, 'membership.manage')) with check (invited_by = (select auth.uid()) and (public.has_permission(organization_id, school_id, 'membership.manage') or public.has_permission(organization_id, null, 'membership.manage')));

grant select, update on public.people, public.profiles to authenticated;
grant select, insert, update on public.organizations to authenticated;
grant select, insert, update, delete on public.management_groups, public.locations, public.schools, public.management_group_schools to authenticated;
grant select, insert, update, delete on public.organization_memberships, public.school_memberships to authenticated;
grant select on public.permissions to authenticated;
grant select, insert, update, delete on public.roles, public.role_permissions, public.role_assignments, public.invitations to authenticated;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

