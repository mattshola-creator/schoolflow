import "server-only";
import { requireCapability, AuthorizationError } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import type { ShowroomPlan } from "@/features/showroom/catalog";
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
  const now = Date.now();
  if (
    roles.error ||
    !roles.data?.some(
      (r) =>
        Date.parse(r.effective_from) <= now &&
        (r.effective_to === null || Date.parse(r.effective_to) > now),
    )
  )
    throw new AuthorizationError("permission_denied");
  const instant = new Date().toISOString();
  const subscriptions = await supabase
    .from("organization_plans")
    .select("status,plans!inner(key,is_active)")
    .eq("organization_id", active.organizationId)
    .in("status", ["active", "trialing"])
    .lte("starts_at", instant)
    .or(`ends_at.is.null,ends_at.gt.${instant}`)
    .eq("plans.is_active", true)
    .limit(2);
  if (subscriptions.error) throw new Error("Subscription lookup failed");
  if (subscriptions.data?.length !== 1)
    throw new BrandingSubscriptionError(
      "An unambiguous effective subscription is required",
    );
  const subscription = subscriptions.data[0];
  const key =
    subscription.status === "trialing" ? "starter" : subscription.plans.key;
  if (!["starter", "growth", "professional", "enterprise"].includes(key))
    throw new BrandingSubscriptionError(
      "Subscription has no approved theme mapping",
    );
  return {
    schoolId: active.schoolId,
    organizationId: active.organizationId,
    schoolName: active.schoolName ?? "Selected school",
    plan: key as ShowroomPlan,
  };
}
