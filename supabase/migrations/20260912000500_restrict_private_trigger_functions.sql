-- Trigger-only functions must not be directly executable by API roles.
revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.bootstrap_organization_owner() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
