-- Keep lock history immutable and make subject + applicability creation atomic.
revoke update on public.academic_locks from authenticated;
grant update (unlocked_by, unlocked_at, unlock_reason) on public.academic_locks to authenticated;

create or replace function public.create_school_subject(
  target_organization_id uuid,
  target_school_id uuid,
  subject_name text,
  subject_code text default null,
  target_level_id uuid default null,
  subject_classification public.subject_classification default 'core',
  subject_sort_order smallint default 1
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare created_subject_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.can_access_academic_setup(
    target_organization_id,
    target_school_id,
    'academics.subjects.manage'
  ) then
    raise exception 'Academic subject is unavailable' using errcode = '42501';
  end if;
  if char_length(trim(subject_name)) not between 2 and 120
    or subject_sort_order not between 1 and 999 then
    raise exception 'Subject details are invalid' using errcode = '22023';
  end if;
  if target_level_id is not null and not exists (
    select 1 from public.class_levels l
    where l.id = target_level_id
      and l.organization_id = target_organization_id
      and l.school_id = target_school_id
      and l.status = 'active'
  ) then
    raise exception 'Class level is unavailable' using errcode = '42501';
  end if;

  insert into public.subjects (
    organization_id, school_id, name, code, sort_order, created_by, updated_by
  ) values (
    target_organization_id, target_school_id, trim(subject_name),
    nullif(upper(trim(subject_code)), ''), subject_sort_order,
    (select auth.uid()), (select auth.uid())
  ) returning id into created_subject_id;

  if target_level_id is not null then
    insert into public.subject_level_applicability (
      organization_id, school_id, subject_id, class_level_id,
      classification, sort_order, created_by
    ) values (
      target_organization_id, target_school_id, created_subject_id,
      target_level_id, subject_classification, subject_sort_order,
      (select auth.uid())
    );
  end if;
  return created_subject_id;
end;
$$;

comment on function public.create_school_subject(uuid, uuid, text, text, uuid, public.subject_classification, smallint) is
  'Atomically creates a school subject and optional same-school level applicability for the authenticated caller.';

revoke all on function public.create_school_subject(uuid, uuid, text, text, uuid, public.subject_classification, smallint)
  from public, anon;
grant execute on function public.create_school_subject(uuid, uuid, text, text, uuid, public.subject_classification, smallint)
  to authenticated;
