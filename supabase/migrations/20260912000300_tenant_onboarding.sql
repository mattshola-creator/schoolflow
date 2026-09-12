create or replace function public.create_organization_with_school(
  p_organization_name text,
  p_organization_slug text,
  p_location_name text,
  p_school_name text,
  p_school_code text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  organization_id uuid;
  location_id uuid;
begin
  if actor is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not exists (select 1 from public.profiles where id = actor) then
    raise exception 'Profile not found' using errcode = 'P0001';
  end if;
  insert into public.organizations (name, slug, created_by)
  values (trim(p_organization_name), lower(trim(p_organization_slug)), actor)
  returning id into organization_id;
  insert into public.locations (organization_id, name, created_by)
  values (organization_id, trim(p_location_name), actor)
  returning id into location_id;
  insert into public.schools (organization_id, location_id, name, code, created_by)
  values (organization_id, location_id, trim(p_school_name), upper(trim(p_school_code)), actor);
  return organization_id;
end;
$$;

revoke all on function public.create_organization_with_school(text, text, text, text, text) from public, anon;
grant execute on function public.create_organization_with_school(text, text, text, text, text) to authenticated;

comment on function public.create_organization_with_school(text, text, text, text, text) is
  'Atomically creates an organization, first location and school for the authenticated owner.';

