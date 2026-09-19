-- Correct organization/school identity derivation for generic audit triggers and
-- provide atomic approval policy/request entry points.
create or replace function private.capture_audit_event()
returns trigger language plpgsql security definer set search_path = '' as $$
declare row_data jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
declare old_data jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
declare org_id uuid; school uuid; entity uuid; changed text[];
begin
  org_id := nullif(row_data->>'organization_id','')::uuid;
  if org_id is null and tg_table_name = 'organizations' then org_id := nullif(row_data->>'id','')::uuid; end if;
  school := nullif(row_data->>'school_id','')::uuid;
  if school is null and tg_table_name = 'schools' then school := nullif(row_data->>'id','')::uuid; end if;
  entity := nullif(row_data->>'id','')::uuid;
  if org_id is null then
    raise exception 'Audited row has no organization scope' using errcode = '23502';
  end if;
  if tg_op = 'UPDATE' then
    select coalesce(array_agg(k order by k), '{}') into changed
    from jsonb_object_keys(row_data) k where row_data->k is distinct from old_data->k;
  end if;
  insert into public.audit_events
    (organization_id, school_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (org_id, school, auth.uid(), lower(tg_op) || '.' || tg_table_name, tg_table_name, entity,
    jsonb_strip_nulls(jsonb_build_object('changedColumns', changed)));
  return coalesce(new, old);
end $$;
revoke all on function private.capture_audit_event() from public, anon, authenticated;

create or replace function public.create_approval_policy(
  target_organization_id uuid,
  target_school_id uuid,
  policy_key text,
  policy_name text,
  policy_description text,
  first_approver_role_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare policy_id uuid;
begin
  if not public.can_access_shared(target_organization_id, target_school_id, 'shared.approvals.manage', 'foundation.action_center') then
    raise exception 'Approval policy is unavailable' using errcode = '42501';
  end if;
  if not exists (select 1 from public.roles r where r.id = first_approver_role_id and r.organization_id = target_organization_id) then
    raise exception 'Approver role is unavailable' using errcode = '42501';
  end if;
  insert into public.approval_policies
    (organization_id, school_id, key, name, description)
  values (target_organization_id, target_school_id, lower(trim(policy_key)), trim(policy_name), nullif(trim(policy_description),''))
  returning id into policy_id;
  insert into public.approval_policy_steps
    (organization_id, school_id, policy_id, sequence, approver_role_id)
  values (target_organization_id, target_school_id, policy_id, 1, first_approver_role_id);
  return policy_id;
end $$;
revoke all on function public.create_approval_policy(uuid, uuid, text, text, text, uuid) from public, anon;
grant execute on function public.create_approval_policy(uuid, uuid, text, text, text, uuid) to authenticated;

create or replace function public.submit_approval_request(
  target_organization_id uuid,
  target_school_id uuid,
  target_policy_id uuid,
  target_subject_type text,
  target_subject_id uuid,
  target_title text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare request_id uuid;
begin
  if not public.can_access_shared(target_organization_id, target_school_id, 'shared.approvals.manage', 'foundation.action_center') then
    raise exception 'Approval request is unavailable' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.approval_policies p
    where p.id = target_policy_id and p.organization_id = target_organization_id
      and p.school_id = target_school_id and p.is_active
      and exists (select 1 from public.approval_policy_steps s where s.policy_id = p.id and s.sequence = 1)
  ) then raise exception 'Approval policy is unavailable' using errcode = '42501'; end if;
  insert into public.approval_requests
    (organization_id, school_id, policy_id, subject_type, subject_id, title)
  values (target_organization_id, target_school_id, target_policy_id,
    lower(trim(target_subject_type)), target_subject_id, trim(target_title))
  returning id into request_id;
  return request_id;
end $$;
revoke all on function public.submit_approval_request(uuid, uuid, uuid, text, uuid, text) from public, anon;
grant execute on function public.submit_approval_request(uuid, uuid, uuid, text, uuid, text) to authenticated;

-- Approval state is mutated only through the caller-bound decision function.
revoke insert on public.approval_policy_steps from authenticated;
revoke insert on public.approval_policies from authenticated;
revoke insert on public.approval_requests from authenticated;
