-- M5 follow-up: privacy-limited access candidates and atomic school transfer.
create or replace function public.list_staff_access_candidates(
  target_organization_id uuid,
  target_school_id uuid
) returns table(user_id uuid, display_name text, email text)
language sql stable security definer set search_path = '' as $$
  select p.id, concat_ws(' ', person.first_name, person.last_name), p.email
  from public.organization_memberships membership
  join public.profiles p on p.id = membership.user_id
  join public.people person on person.id = p.person_id
  where membership.organization_id = target_organization_id
    and membership.status = 'active'
    and public.can_access_staff(
      target_organization_id, target_school_id, 'staff.access.manage'
    )
  order by person.first_name, person.last_name, p.email
$$;
revoke all on function public.list_staff_access_candidates(uuid, uuid) from public, anon;
grant execute on function public.list_staff_access_candidates(uuid, uuid) to authenticated;

create or replace function public.transfer_staff_assignment(
  target_assignment_id uuid,
  target_school_id uuid,
  target_department_id uuid,
  target_position_id uuid,
  target_started_on date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  caller_id uuid := (select auth.uid());
  current_assignment public.staff_assignments%rowtype;
  linked_role_record public.role_assignments%rowtype;
  new_role_assignment_id uuid;
  new_assignment_id uuid;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  select * into current_assignment
  from public.staff_assignments where id = target_assignment_id for update;
  if current_assignment.id is null
    or current_assignment.status not in ('planned', 'active')
    or target_started_on <= current_assignment.started_on
  then
    raise exception 'Staff assignment cannot be transferred' using errcode = '22023';
  end if;
  if not public.can_access_staff(
    current_assignment.organization_id, current_assignment.school_id,
    'staff.assignments.manage'
  ) or not public.can_access_staff(
    current_assignment.organization_id, target_school_id,
    'staff.assignments.manage'
  ) then
    raise exception 'Staff assignment management is unavailable' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.positions p
    where p.id = target_position_id
      and p.organization_id = current_assignment.organization_id
      and p.school_id = target_school_id and p.status = 'active'
  ) or (target_department_id is not null and not exists (
    select 1 from public.departments d
    where d.id = target_department_id
      and d.organization_id = current_assignment.organization_id
      and d.school_id = target_school_id and d.status = 'active'
  )) then
    raise exception 'Transfer destination is invalid' using errcode = '22023';
  end if;

  if current_assignment.role_assignment_id is not null then
    if not public.can_access_staff(
      current_assignment.organization_id, current_assignment.school_id,
      'staff.access.manage'
    ) or not public.can_access_staff(
      current_assignment.organization_id, target_school_id,
      'staff.access.manage'
    ) then
      raise exception 'Staff access management is unavailable' using errcode = '42501';
    end if;
    select * into linked_role_record from public.role_assignments
    where id = current_assignment.role_assignment_id for update;
    update public.role_assignments set
      status = 'ended', effective_to = target_started_on::timestamptz,
      updated_at = now()
    where id = linked_role_record.id;
    insert into public.role_assignments (
      organization_id, user_id, role_id, scope, school_id, status,
      effective_from
    ) values (
      linked_role_record.organization_id, linked_role_record.user_id,
      linked_role_record.role_id,
      'school', target_school_id, 'active', target_started_on::timestamptz
    ) on conflict (user_id, role_id, scope, management_group_id, school_id)
      do update set status = 'active', effective_from = excluded.effective_from,
        effective_to = null, updated_at = now()
    returning id into new_role_assignment_id;
  end if;

  update public.staff_assignments set
    status = 'ended', ended_on = target_started_on - 1,
    updated_by = caller_id, updated_at = now()
  where id = current_assignment.id;
  insert into public.staff_assignments (
    organization_id, school_id, employment_id, staff_profile_id,
    department_id, position_id, role_assignment_id, is_primary, status,
    started_on, created_by, updated_by
  ) values (
    current_assignment.organization_id, target_school_id,
    current_assignment.employment_id, current_assignment.staff_profile_id,
    target_department_id, target_position_id, new_role_assignment_id,
    current_assignment.is_primary, 'active', target_started_on,
    caller_id, caller_id
  ) returning id into new_assignment_id;
  return new_assignment_id;
end $$;
revoke all on function public.transfer_staff_assignment(uuid, uuid, uuid, uuid, date)
  from public, anon;
grant execute on function public.transfer_staff_assignment(uuid, uuid, uuid, uuid, date)
  to authenticated;
