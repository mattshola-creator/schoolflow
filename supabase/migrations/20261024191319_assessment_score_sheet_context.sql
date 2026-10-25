-- Founder-approved PR136 contract; isolated QA only. Production requires separate release approval.
create function public.get_assessment_score_sheet_context(
  target_batch_id uuid,
  target_organization_id uuid,
  target_school_id uuid
) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  b public.result_batches%rowtype;
  context_data jsonb;
begin
  if auth.uid() is null then
    raise exception 'Score sheet context unavailable' using errcode='42501';
  end if;
  select * into b from public.result_batches
  where id=target_batch_id and organization_id=target_organization_id
    and school_id=target_school_id;
  if not found then
    raise exception 'Score sheet context unavailable' using errcode='42501';
  end if;
  -- Reuse the exact existing assignment/management, membership and entitlement
  -- boundary. A known UUID or a requested school is never an authorization.
  if not public.can_read_result_batch(b.id) then
    raise exception 'Score sheet context unavailable' using errcode='42501';
  end if;
  select jsonb_build_object(
    'subjectName', subject.name,
    'sessionName', session.name,
    'periodName', period.name,
    'className', level.name,
    'armName', arm.name,
    'assignedTeacherName', case
      when public.can_view_staff(staff.id)
        or (private.is_assigned_result_teacher(b) and exists (
          select 1 from public.profiles own_profile
          where own_profile.id=auth.uid() and own_profile.person_id=staff.person_id
        ))
      then nullif(trim(concat_ws(' ', person.first_name, person.last_name)), '')
      else null end
  ) into context_data
  from public.result_batches scoped
  left join public.subjects subject on subject.id=scoped.subject_id
    and subject.organization_id=scoped.organization_id and subject.school_id=scoped.school_id
  left join public.academic_sessions session on session.id=scoped.session_id
    and session.organization_id=scoped.organization_id and session.school_id=scoped.school_id
  left join public.academic_periods period on period.id=scoped.period_id
    and period.organization_id=scoped.organization_id and period.school_id=scoped.school_id
    and period.session_id=scoped.session_id
  left join public.class_levels level on level.id=scoped.class_level_id
    and level.organization_id=scoped.organization_id and level.school_id=scoped.school_id
  left join public.class_arms arm on arm.id=scoped.class_arm_id
    and arm.organization_id=scoped.organization_id and arm.school_id=scoped.school_id
    and arm.class_level_id=scoped.class_level_id
  left join public.teaching_assignments teaching on teaching.id=scoped.teaching_assignment_id
    and teaching.organization_id=scoped.organization_id and teaching.school_id=scoped.school_id
    and teaching.session_id=scoped.session_id and teaching.class_level_id=scoped.class_level_id
    and (teaching.class_arm_id is null or teaching.class_arm_id is not distinct from scoped.class_arm_id)
    and (teaching.assignment_type='class_teacher' or teaching.subject_id=scoped.subject_id)
  left join public.staff_assignments assignment on assignment.id=teaching.staff_assignment_id
    and assignment.organization_id=scoped.organization_id and assignment.school_id=scoped.school_id
  left join public.staff_profiles staff on staff.id=assignment.staff_profile_id
    and staff.organization_id=scoped.organization_id
  left join public.people person on person.id=staff.person_id
  where scoped.id=b.id and scoped.organization_id=b.organization_id and scoped.school_id=b.school_id;
  return context_data;
end;
$$;
revoke all on function public.get_assessment_score_sheet_context(uuid,uuid,uuid) from public,anon;
grant execute on function public.get_assessment_score_sheet_context(uuid,uuid,uuid) to authenticated;
