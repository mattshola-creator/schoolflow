-- Explicit deny policies document the Data API boundary in addition to revoked grants.
create policy product_modules_api_deny on public.product_modules for all to authenticated using (false) with check (false);
create policy product_features_api_deny on public.product_features for all to authenticated using (false) with check (false);
create policy plans_api_deny on public.plans for all to authenticated using (false) with check (false);
create policy plan_module_entitlements_api_deny on public.plan_module_entitlements for all to authenticated using (false) with check (false);
create policy organization_plans_api_deny on public.organization_plans for all to authenticated using (false) with check (false);
create policy organization_feature_flags_api_deny on public.organization_feature_flags for all to authenticated using (false) with check (false);

create index organization_plans_plan_idx on public.organization_plans(plan_id);
create index organization_feature_flags_feature_idx on public.organization_feature_flags(feature_id);

create trigger set_organization_feature_flags_updated_at
before update on public.organization_feature_flags
for each row execute function private.set_updated_at();
