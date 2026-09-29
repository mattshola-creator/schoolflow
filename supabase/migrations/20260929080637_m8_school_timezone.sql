-- Reuse the school's location timezone as the authoritative civil-time zone.

create or replace function private.validate_location_timezone()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Timezone is invalid' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger validate_location_timezone before insert or update of timezone
on public.locations for each row execute function private.validate_location_timezone();

create or replace function public.set_school_timezone(
  target_organization_id uuid, target_school_id uuid, target_timezone text
) returns text language plpgsql security definer set search_path = '' as $$
declare target_location_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.has_permission(target_organization_id, target_school_id, 'school.manage')
    and not public.has_permission(target_organization_id, null, 'school.manage') then
    raise exception 'School timezone is unavailable' using errcode = '42501';
  end if;
  if target_timezone is null or not exists (
    select 1 from pg_catalog.pg_timezone_names where name = target_timezone
  ) then
    raise exception 'Timezone is invalid' using errcode = '22023';
  end if;
  select school.location_id into target_location_id from public.schools school
  where school.id = target_school_id and school.organization_id = target_organization_id;
  if target_location_id is null then
    raise exception 'School timezone is unavailable' using errcode = '42501';
  end if;
  update public.locations set timezone = target_timezone, updated_at = now()
  where id = target_location_id and organization_id = target_organization_id;
  return target_timezone;
end;
$$;

create or replace function public.submit_staff_time_request_local(
  target_organization_id uuid, target_school_id uuid,
  target_staff_assignment_id uuid, target_kind public.staff_time_request_kind,
  target_leave_type_id uuid, target_starts_local timestamp,
  target_ends_local timestamp, target_reason text, target_policy_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare school_timezone text;
begin
  select location.timezone into school_timezone
  from public.schools school join public.locations location
    on location.id = school.location_id and location.organization_id = school.organization_id
  where school.id = target_school_id and school.organization_id = target_organization_id;
  if school_timezone is null then
    raise exception 'School timezone is unavailable' using errcode = '42501';
  end if;
  return public.submit_staff_time_request(
    target_organization_id, target_school_id, target_staff_assignment_id,
    target_kind, target_leave_type_id,
    target_starts_local at time zone school_timezone,
    target_ends_local at time zone school_timezone,
    target_reason, target_policy_id
  );
end;
$$;

revoke all on function private.validate_location_timezone() from public, anon, authenticated;
revoke all on function public.set_school_timezone(uuid, uuid, text) from public, anon;
revoke all on function public.submit_staff_time_request_local(
  uuid, uuid, uuid, public.staff_time_request_kind, uuid,
  timestamp, timestamp, text, uuid
) from public, anon;
grant execute on function public.set_school_timezone(uuid, uuid, text) to authenticated;
grant execute on function public.submit_staff_time_request_local(
  uuid, uuid, uuid, public.staff_time_request_kind, uuid,
  timestamp, timestamp, text, uuid
) to authenticated;
