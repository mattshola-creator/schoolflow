import "server-only";
import { requireCapability, AuthorizationError } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readGalleryAccess } from "./entitlements";
export class BrandingSubscriptionError extends Error {}
export async function requireBrandingContext() {
  const authorization = await requireCapability({
    module: "foundation",
    permission: "school.manage",
    feature: "foundation.authorization_inspection",
  });
  const { supabase, user } = await requireUser();
  const tenant = await loadTenantContext();
  const active = tenant.active;
  if (
    !active?.schoolId ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new AuthorizationError("invalid_context");
  const roles = await supabase
    .from("role_assignments")
    .select("effective_from,effective_to,roles!inner(key)")
    .eq("user_id", user.id)
    .eq("organization_id", active.organizationId)
    .eq("scope", "organization")
    .eq("status", "active")
    .eq("roles.key", "organization_owner");
  if (roles.error) throw new Error("Branding authority lookup failed");
  const now = Date.now();
  if (
    !roles.data?.some(
      (r) =>
        Date.parse(r.effective_from) <= now &&
        (r.effective_to === null || Date.parse(r.effective_to) > now),
    )
  )
    throw new AuthorizationError("permission_denied");
  const client = supabase as unknown as SupabaseClient;
  const plan = await readGalleryAccess(
    async (name, args) => client.rpc(name, args),
    active.organizationId,
    active.schoolId,
  );
  if (!plan)
    throw new BrandingSubscriptionError(
      "An effective gallery entitlement is required",
    );
  return {
    schoolId: active.schoolId,
    organizationId: active.organizationId,
    schoolName: active.schoolName ?? "Selected school",
    plan,
  };
}
