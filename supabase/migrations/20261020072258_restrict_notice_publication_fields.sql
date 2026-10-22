-- Notice publication and actor fields are owned by the guarded publish RPC.
-- Content edits remain authorized by existing tenant-scoped policies.
revoke insert, update on public.communication_notices from authenticated;
grant insert (id,organization_id,school_id,title,body,priority,publish_at,expires_at)
  on public.communication_notices to authenticated;
grant update (title,body,priority,publish_at,expires_at)
  on public.communication_notices to authenticated;
