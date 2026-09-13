-- Preserve placement history and close cross-session/cross-person mutation paths.
alter table public.student_enrollments
  add constraint student_enrollments_identity_session_unique
  unique (id, student_id, academic_session_id, organization_id, school_id);

alter table public.class_memberships
  drop constraint class_memberships_enrollment_id_student_id_organization_id_fkey,
  add constraint class_memberships_enrollment_identity_session_fkey
  foreign key (enrollment_id, student_id, academic_session_id, organization_id, school_id)
  references public.student_enrollments(id, student_id, academic_session_id, organization_id, school_id)
  on delete restrict;

create or replace function private.validate_guardian_relationship()
returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (
    select 1 from public.student_profiles s
    where s.id = new.student_id and s.person_id = new.guardian_person_id
  ) then raise exception 'A student cannot be their own guardian' using errcode = '23514'; end if;
  return new;
end $$;
create trigger validate_guardian_relationship before insert or update on public.guardian_relationships
for each row execute function private.validate_guardian_relationship();
revoke all on function private.validate_guardian_relationship() from public, anon, authenticated;

revoke update on public.student_profiles, public.student_enrollments,
  public.class_memberships, public.guardian_relationships from authenticated;
grant update (status, date_of_birth, gender, updated_by, updated_at)
  on public.student_profiles to authenticated;
grant update (status, ended_on, exit_reason, updated_by, updated_at)
  on public.student_enrollments to authenticated;
grant update (status, ended_on, updated_by, updated_at)
  on public.class_memberships to authenticated;
grant update (
  relationship_type, is_primary_contact, has_portal_access,
  is_financially_responsible, effective_to, updated_by, updated_at
) on public.guardian_relationships to authenticated;
