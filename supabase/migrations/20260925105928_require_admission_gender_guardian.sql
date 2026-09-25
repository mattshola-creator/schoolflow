create or replace function public.create_admission_application(
  target_organization_id uuid, target_school_id uuid, target_session_id uuid,
  target_level_id uuid, target_application_number text, applicant_first_name text,
  applicant_last_name text, applicant_date_of_birth date, applicant_gender text,
  application_source public.admission_source default 'staff', previous_class_name text default null,
  guardian_first_name text default null, guardian_last_name text default null,
  guardian_relationship text default null, guardian_email text default null,
  guardian_phone text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); applicant_person uuid; guardian_person uuid; new_application_id uuid;
begin
  if caller_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not public.can_access_admissions(target_organization_id, target_school_id, 'admissions.manage') then
    raise exception 'Admissions management is unavailable' using errcode = '42501';
  end if;
  if char_length(trim(applicant_first_name)) not between 1 and 100
    or char_length(trim(applicant_last_name)) not between 1 and 100
    or applicant_date_of_birth is null or applicant_date_of_birth > current_date
    or applicant_gender is null or trim(applicant_gender) not in ('Female', 'Male')
    or nullif(trim(guardian_first_name), '') is null
    or nullif(trim(guardian_last_name), '') is null
    or nullif(trim(guardian_relationship), '') is null
    or not exists (select 1 from public.academic_sessions s where s.id = target_session_id
      and s.organization_id = target_organization_id and s.school_id = target_school_id)
    or not exists (select 1 from public.class_levels l where l.id = target_level_id
      and l.organization_id = target_organization_id and l.school_id = target_school_id and l.status = 'active')
  then raise exception 'Application, guardian or academic placement details are invalid' using errcode = '22023'; end if;

  insert into public.people(first_name,last_name)
  values(trim(applicant_first_name),trim(applicant_last_name)) returning id into applicant_person;
  insert into public.admission_applications(
    organization_id,school_id,applicant_person_id,application_number,source,status,
    academic_session_id,applied_class_level_id,date_of_birth,gender,previous_class,created_by,updated_by
  ) values (
    target_organization_id,target_school_id,applicant_person,upper(trim(target_application_number)),application_source,'application_started',
    target_session_id,target_level_id,applicant_date_of_birth,trim(applicant_gender),nullif(trim(previous_class_name),''),caller_id,caller_id
  ) returning id into new_application_id;

  insert into public.people(first_name,last_name)
  values(trim(guardian_first_name),trim(guardian_last_name)) returning id into guardian_person;
  insert into public.admission_guardians(
    organization_id,school_id,application_id,guardian_person_id,relationship_type,
    email,phone,is_primary_contact,is_financially_responsible,created_by
  ) values (
    target_organization_id,target_school_id,new_application_id,guardian_person,trim(guardian_relationship),
    nullif(lower(trim(guardian_email)),''),nullif(trim(guardian_phone),''),true,true,caller_id
  );

  insert into public.admission_checklist_items(organization_id,school_id,application_id,key,label,required) values
    (target_organization_id,target_school_id,new_application_id,'approval','Admission approved',true),
    (target_organization_id,target_school_id,new_application_id,'offer_acceptance','Offer accepted',true),
    (target_organization_id,target_school_id,new_application_id,'documents','Required documents verified',true),
    (target_organization_id,target_school_id,new_application_id,'payment','Payment condition satisfied',false),
    (target_organization_id,target_school_id,new_application_id,'placement','Final placement confirmed',true),
    (target_organization_id,target_school_id,new_application_id,'guardian','Guardian details complete',true);
  update public.admission_checklist_items set status='complete', completed_by=caller_id, completed_at=now()
  where application_id=new_application_id and key='guardian';
  return new_application_id;
end $$;

revoke all on function public.create_admission_application(uuid,uuid,uuid,uuid,text,text,text,date,text,public.admission_source,text,text,text,text,text,text) from public, anon;
grant execute on function public.create_admission_application(uuid,uuid,uuid,uuid,text,text,text,date,text,public.admission_source,text,text,text,text,text,text) to authenticated;
