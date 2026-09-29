-- Read-only caller-bound options for the Staff/HR time-off workspace.

create or replace function public.list_staff_time_request_assignments(
  target_organization_id uuid,
  target_school_id uuid
) returns table (
  staff_assignment_id uuid,
  staff_name text,
  staff_number text
)
language sql
stable
security definer
set search_path = ''
as $$
  select assignment.id,
    concat_ws(' ', person.first_name, person.last_name),
    profile.staff_number
  from public.staff_assignments assignment
  join public.staff_profiles profile
    on profile.id = assignment.staff_profile_id
    and profile.organization_id = assignment.organization_id
  join public.people person
    on person.id = profile.person_id
  where assignment.organization_id = target_organization_id
    and assignment.school_id = target_school_id
    and assignment.status = 'active'
    and public.can_access_staff_time_request_assignment(
      assignment.organization_id,
      assignment.school_id,
      assignment.id,
      'staff.time_off.request'
    )
  order by person.first_name, person.last_name, profile.staff_number;
$$;

create or replace function public.list_staff_time_request_policies(
  target_organization_id uuid,
  target_school_id uuid
) returns table (
  policy_id uuid,
  policy_key text,
  policy_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select policy.id, policy.key, policy.name
  from public.approval_policies policy
  where policy.organization_id = target_organization_id
    and policy.school_id = target_school_id
    and policy.is_active
    and policy.key in ('staff.leave', 'staff.permission')
    and public.can_access_staff(
      target_organization_id,
      target_school_id,
      'staff.time_off.request',
      'staff.leave_permission'
    )
  order by policy.name;
$$;

revoke all on function public.list_staff_time_request_assignments(uuid, uuid)
  from public, anon;
revoke all on function public.list_staff_time_request_policies(uuid, uuid)
  from public, anon;
grant execute on function public.list_staff_time_request_assignments(uuid, uuid)
  to authenticated;
grant execute on function public.list_staff_time_request_policies(uuid, uuid)
  to authenticated;
