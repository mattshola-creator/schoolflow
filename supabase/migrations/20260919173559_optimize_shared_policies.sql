-- Apply Supabase's init-plan guidance to M6 policies and avoid FOR ALL
-- policies participating redundantly in SELECT evaluation.
drop policy documents_insert on public.documents;
create policy documents_insert on public.documents for insert to authenticated with check (
  created_by = (select auth.uid()) and public.can_access_shared(organization_id, school_id, 'shared.documents.manage', 'foundation.document_storage')
  and object_path like organization_id::text || '/' || school_id::text || '/' || id::text || '/%'
);

drop policy action_tasks_select on public.action_tasks;
create policy action_tasks_select on public.action_tasks for select to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.tasks.view', 'foundation.action_center')
  and (owner_user_id is null or owner_user_id = (select auth.uid())
    or public.has_permission(organization_id, school_id, 'shared.tasks.manage'))
);
drop policy action_tasks_insert on public.action_tasks;
create policy action_tasks_insert on public.action_tasks for insert to authenticated with check (
  created_by = (select auth.uid()) and public.can_access_shared(organization_id, school_id, 'shared.tasks.manage', 'foundation.action_center')
);

drop policy approval_requests_select on public.approval_requests;
create policy approval_requests_select on public.approval_requests for select to authenticated using (
  requested_by = (select auth.uid()) or public.can_access_shared(organization_id, school_id, 'shared.approvals.view', 'foundation.action_center')
);
drop policy approval_requests_insert on public.approval_requests;
create policy approval_requests_insert on public.approval_requests for insert to authenticated with check (
  requested_by = (select auth.uid()) and public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
);

drop policy notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated
  using (recipient_user_id = (select auth.uid()));
drop policy notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated
  using (recipient_user_id = (select auth.uid())) with check (recipient_user_id = (select auth.uid()));

drop policy approval_policies_manage on public.approval_policies;
create policy approval_policies_insert on public.approval_policies for insert to authenticated with check (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
);
create policy approval_policies_update on public.approval_policies for update to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
) with check (public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center'));
create policy approval_policies_delete on public.approval_policies for delete to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
);

drop policy approval_steps_manage on public.approval_policy_steps;
create policy approval_steps_insert on public.approval_policy_steps for insert to authenticated with check (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
);
create policy approval_steps_update on public.approval_policy_steps for update to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
) with check (public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center'));
create policy approval_steps_delete on public.approval_policy_steps for delete to authenticated using (
  public.can_access_shared(organization_id, school_id, 'shared.approvals.manage', 'foundation.action_center')
);

create index audit_events_actor_idx on public.audit_events(actor_user_id, occurred_at desc) where actor_user_id is not null;
create index documents_creator_idx on public.documents(created_by);
create index action_tasks_creator_idx on public.action_tasks(created_by);
create index approval_policies_scope_idx on public.approval_policies(organization_id, school_id, is_active);
create index approval_policies_creator_idx on public.approval_policies(created_by);
create index approval_policy_steps_role_idx on public.approval_policy_steps(approver_role_id, organization_id);
create index approval_requests_policy_idx on public.approval_requests(policy_id, organization_id, school_id);
create index approval_requests_requester_idx on public.approval_requests(requested_by, created_at desc);
create index approval_decisions_decider_idx on public.approval_decisions(decided_by, decided_at desc);
create index notifications_scope_idx on public.notifications(organization_id, school_id, created_at desc);
