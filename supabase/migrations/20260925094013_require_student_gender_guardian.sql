create or replace function public.create_student_record(
  target_organization_id uuid,
  target_school_id uuid,
  target_session_id uuid,
  target_level_id uuid,
  target_arm_id uuid,
  student_first_name text,
  student_last_name text,
  target_student_number text,
  target_date_of_birth date,
  target_gender text,
  enrollment_date date,
  guardian_first_name text default null,
  guardian_last_name text default null,
  guardian_relationship text default null,
  guardian_primary boolean default false,
  guardian_financial boolean default false
) returns uuid language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); student_person uuid; student_id uuid; enrollment_id uuid; guardian_person uuid;
begin
  if caller_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not public.can_access_students(target_organization_id, target_school_id, 'students.manage') then
    raise exception 'Student management is unavailable' using errcode = '42501';
  end if;
  if char_length(trim(student_first_name)) not between 1 and 100
    or char_length(trim(student_last_name)) not between 1 and 100
    or target_date_of_birth is null or target_date_of_birth > current_date
    or target_gender is null or trim(target_gender) not in ('Female', 'Male')
    or nullif(trim(guardian_first_name), '') is null
    or nullif(trim(guardian_last_name), '') is null
    or nullif(trim(guardian_relationship), '') is null
    or guardian_primary is not true
    or not exists (select 1 from public.academic_sessions s where s.id = target_session_id
      and s.organization_id = target_organization_id and s.school_id = target_school_id)
    or not exists (select 1 from public.class_levels l where l.id = target_level_id
      and l.organization_id = target_organization_id and l.school_id = target_school_id and l.status = 'active')
  then raise exception 'Student, guardian or academic placement details are invalid' using errcode = '22023'; end if;

  insert into public.people (first_name, last_name)
  values (trim(student_first_name), trim(student_last_name)) returning id into student_person;
  insert into public.student_profiles (
    organization_id, person_id, student_number, date_of_birth, gender,
    status, created_by, updated_by
  ) values (
    target_organization_id, student_person, upper(trim(target_student_number)),
    target_date_of_birth, trim(target_gender), 'active', caller_id, caller_id
  ) returning id into student_id;
  insert into public.student_enrollments (
    organization_id, school_id, student_id, academic_session_id,
    status, enrolled_on, created_by, updated_by
  ) values (
    target_organization_id, target_school_id, student_id, target_session_id,
    'active', enrollment_date, caller_id, caller_id
  ) returning id into enrollment_id;
  insert into public.class_memberships (
    organization_id, school_id, student_id, enrollment_id, academic_session_id,
    class_level_id, class_arm_id, started_on, created_by, updated_by
  ) values (
    target_organization_id, target_school_id, student_id, enrollment_id,
    target_session_id, target_level_id, target_arm_id, enrollment_date, caller_id, caller_id
  );

  insert into public.people (first_name, last_name)
  values (trim(guardian_first_name), trim(guardian_last_name)) returning id into guardian_person;
  insert into public.guardian_relationships (
    organization_id, student_id, guardian_person_id, relationship_type,
    is_primary_contact, is_financially_responsible, created_by, updated_by
  ) values (
    target_organization_id, student_id, guardian_person, trim(guardian_relationship),
    true, guardian_financial, caller_id, caller_id
  );
  return student_id;
end $$;

revoke all on function public.create_student_record(uuid, uuid, uuid, uuid, uuid, text, text, text, date, text, date, text, text, text, boolean, boolean) from public, anon;
grant execute on function public.create_student_record(uuid, uuid, uuid, uuid, uuid, text, text, text, date, text, date, text, text, text, boolean, boolean) to authenticated;
