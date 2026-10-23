import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import { evaluateAccess } from "@/features/authorization/evaluator";
import type { TenantOption } from "@/features/tenancy/context";
import { hasEffectiveOwnerAssignment } from "./model";

export function ownerEntryEnabled() {
  return (
    process.env.CONTEXT === "deploy-preview" &&
    process.env.SCHOOLFLOW_SHELL_REVIEW === "true" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL ===
      "https://afqykqlxecpzspjoyegc.supabase.co"
  );
}
/** The build marker enables presentation; this identity-bound check grants no authority. */
export async function shouldOpenOwnerDashboard(
  client: SupabaseClient,
  userId: string,
  active: TenantOption | null,
  authorization: AuthorizationSnapshot | null,
  legacy = false,
) {
  if (
    !ownerEntryEnabled() ||
    legacy ||
    !active?.schoolId ||
    !authorization ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId ||
    !evaluateAccess(authorization, {
      permission: "organization.view",
      module: "foundation",
      feature: "foundation.authorization_inspection",
    }).allowed
  )
    return false;
  const result = await client
    .from("role_assignments")
    .select("effective_from,effective_to,roles!inner(key)")
    .eq("user_id", userId)
    .eq("organization_id", active.organizationId)
    .eq("scope", "organization")
    .eq("status", "active")
    .eq("roles.key", "organization_owner");
  if (result.error) throw new Error("Owner entry authority lookup failed");
  return hasEffectiveOwnerAssignment(result.data ?? []);
}
