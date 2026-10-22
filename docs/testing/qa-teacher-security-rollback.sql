-- Review-only rollback. Never run automatically. Restores the prior vulnerable behavior; retain HOLD.
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
declare caller_id uuid := (select auth.uid()); person_id uuid; profile_id uuid; employment_id uuid; role_assignment_id uuid;
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
    insert into public.role_assignments (
      organization_id, user_id, role_id, scope, school_id, status, effective_from
    ) values (
      target_organization_id, linked_user_id, linked_role_id, 'school', target_school_id,
      'active', target_started_on::timestamptz
    ) on conflict (user_id, role_id, scope, management_group_id, school_id)
      do update set status = 'active', effective_to = null, updated_at = now()
    returning id into role_assignment_id;
  end if;
  insert into public.people(first_name, last_name)
  values (trim(staff_first_name), trim(staff_last_name)) returning id into person_id;
  insert into public.staff_profiles(
    organization_id, person_id, staff_number, work_email, phone, created_by, updated_by
  ) values (
    target_organization_id, person_id, upper(trim(target_staff_number)),
    nullif(lower(trim(target_work_email)), ''), nullif(trim(target_phone), ''), caller_id, caller_id
  ) returning id into profile_id;
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
alter policy result_batches_select on public.result_batches using(
 public.can_access_assessments(organization_id,school_id,'academics.scores.view','academics.score_entry') or
 public.can_access_assessments(organization_id,school_id,'academics.results.view','academics.result_workflow'));
alter policy assessment_scores_select on public.assessment_scores using(
 public.can_access_assessments(organization_id,school_id,'academics.scores.view','academics.score_entry'));
drop function public.can_read_result_batch(uuid);
