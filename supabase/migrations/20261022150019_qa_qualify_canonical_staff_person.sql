-- QA-only execution authorized 2026-10-22. No production application authorized.
create or replace function public.create_staff_record(
  target_organization_id uuid,
  target_school_id uuid,
  target_department_id uuid,
  target_position_id uuid,
  staff_first_name text,
  staff_last_name text,
  target_staff_number text,
  target_employment_type public.employment_type,
  target_started_on date,
  target_work_email text default null,
  target_phone text default null,
  linked_user_id uuid default null,
  linked_role_id uuid default null
) returns uuid language plpgsql security definer set search_path = '' as $$
<<staff_creation>>
declare caller_id uuid := (select auth.uid()); person_id uuid; profile_id uuid; employment_id uuid; role_assignment_id uuid; existing_employment public.employments%rowtype; existing_assignment public.staff_assignments%rowtype;
begin
  if caller_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not public.can_access_staff(target_organization_id, target_school_id, 'staff.manage') then
    raise exception 'Staff management is unavailable' using errcode = '42501';
  end if;
  if char_length(trim(staff_first_name)) not between 1 and 100
    or char_length(trim(staff_last_name)) not between 1 and 100
    or target_started_on is null
    or not exists (select 1 from public.positions p where p.id = target_position_id
      and p.organization_id = target_organization_id and p.school_id = target_school_id and p.status = 'active')
    or (target_department_id is not null and not exists (
      select 1 from public.departments d where d.id = target_department_id
        and d.organization_id = target_organization_id and d.school_id = target_school_id and d.status = 'active'))
  then raise exception 'Staff details or assignment are invalid' using errcode = '22023'; end if;
  if linked_user_id is not null then
    if linked_role_id is null
      or not exists (select 1 from public.organization_memberships m where m.organization_id = target_organization_id
        and m.user_id = linked_user_id and m.status = 'active')
      or not exists (select 1 from public.roles r where r.id = linked_role_id and r.organization_id = target_organization_id)
    then raise exception 'Linked staff access is invalid' using errcode = '22023'; end if;
    if not public.can_access_staff(target_organization_id, target_school_id, 'staff.access.manage') then
      raise exception 'Staff access management is unavailable' using errcode = '42501'; end if;
    -- Lock the canonical account row: concurrent linked-user retries serialize.
    select p.person_id into person_id from public.profiles p
      where p.id=linked_user_id and p.status='active' for update;
    if person_id is null then raise exception 'Active canonical identity required' using errcode='23514'; end if;
    select sp.id into profile_id from public.staff_profiles sp
      where sp.organization_id=target_organization_id and sp.person_id=staff_creation.person_id for update;
    if profile_id is not null then
      if not exists(select 1 from public.staff_profiles sp where sp.id=profile_id and sp.staff_number=upper(trim(target_staff_number)))
        then raise exception 'Existing canonical staff details differ' using errcode='23514'; end if;
      select e.* into existing_employment from public.employments e
        where e.organization_id=target_organization_id and e.staff_profile_id=profile_id and e.status='active' for update;
      if found then
        if existing_employment.user_id is distinct from linked_user_id or existing_employment.employment_type<>target_employment_type
          or existing_employment.started_on<>target_started_on then
          raise exception 'Existing active employment differs' using errcode='23514'; end if;
        select sa.* into existing_assignment from public.staff_assignments sa
          where sa.organization_id=target_organization_id and sa.employment_id=existing_employment.id
            and sa.school_id=target_school_id and sa.status='active' for update;
        if found and existing_assignment.position_id=target_position_id
          and existing_assignment.department_id is not distinct from target_department_id
          and existing_assignment.started_on=target_started_on
          and exists(select 1 from public.role_assignments ra where ra.id=existing_assignment.role_assignment_id
            and ra.organization_id=target_organization_id and ra.user_id=linked_user_id and ra.role_id=linked_role_id
            and ra.school_id=target_school_id and ra.scope='school' and ra.status='active'
            and ra.effective_from<=now() and (ra.effective_to is null or ra.effective_to>now()))
          then return profile_id; end if;
        raise exception 'Existing active assignment requires its established management workflow' using errcode='23514';
      end if;
    end if;
    select ra.id into role_assignment_id from public.role_assignments ra
      where ra.organization_id=target_organization_id and ra.user_id=linked_user_id
        and ra.role_id=linked_role_id and ra.scope='school' and ra.school_id=target_school_id
        and ra.management_group_id is null and ra.status='active'
        and ra.effective_from<=now() and (ra.effective_to is null or ra.effective_to>now())
      order by ra.created_at limit 1 for update;
    if role_assignment_id is null then
      insert into public.role_assignments(organization_id,user_id,role_id,scope,school_id,status,effective_from)
        values(target_organization_id,linked_user_id,linked_role_id,'school',target_school_id,'active',target_started_on::timestamptz)
        returning id into role_assignment_id;
    end if;
  else
    insert into public.people(first_name,last_name) values(trim(staff_first_name),trim(staff_last_name)) returning id into person_id;
  end if;
  if profile_id is null then
  insert into public.staff_profiles(
    organization_id, person_id, staff_number, work_email, phone, created_by, updated_by
  ) values (
    target_organization_id, person_id, upper(trim(target_staff_number)),
    nullif(lower(trim(target_work_email)), ''), nullif(trim(target_phone), ''), caller_id, caller_id
  ) returning id into profile_id;
  end if;
  insert into public.employments(
    organization_id, staff_profile_id, user_id, employment_type, status,
    started_on, created_by, updated_by
  ) values (
    target_organization_id, profile_id, linked_user_id, target_employment_type, 'active',
    target_started_on, caller_id, caller_id
  ) returning id into employment_id;
  insert into public.staff_assignments(
    organization_id, school_id, employment_id, staff_profile_id, department_id,
    position_id, role_assignment_id, is_primary, status, started_on, created_by, updated_by
  ) values (
    target_organization_id, target_school_id, employment_id, profile_id, target_department_id,
    target_position_id, role_assignment_id, true, 'active', target_started_on, caller_id, caller_id
  );
  return profile_id;
end $$;

