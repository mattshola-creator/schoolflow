-- M5 least privilege: Supabase project default grants include broad table DML.
-- Remove them explicitly, then restore only operations protected and required by M5.
revoke all on public.departments, public.positions, public.staff_profiles,
  public.employments, public.staff_assignments from anon, authenticated;

grant select, insert on public.departments, public.positions to authenticated;
grant select on public.staff_profiles, public.employments to authenticated;
grant select, insert on public.staff_assignments to authenticated;

grant update (name, code, status, updated_by, updated_at)
  on public.departments to authenticated;
grant update (department_id, name, code, is_teaching, status, updated_by, updated_at)
  on public.positions to authenticated;
grant update (
  work_email, phone, emergency_contact_name, emergency_contact_phone,
  qualifications, status, updated_by, updated_at
) on public.staff_profiles to authenticated;
grant update (status, ended_on, exit_reason, updated_by, updated_at)
  on public.employments to authenticated;
grant update (
  department_id, position_id, reports_to_assignment_id, is_primary,
  status, ended_on, updated_by, updated_at
) on public.staff_assignments to authenticated;
