import { z } from "zod";
import {
  evaluateAccess,
  type AuthorizationSnapshot,
  type CapabilityRequirement,
} from "@/features/authorization/evaluator";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";

const authorizationSchema = z.object({
  organizationId: z.string().uuid(),
  schoolId: z.string().uuid().nullable(),
  permissions: z.array(z.string()),
  modules: z.array(
    z.object({ key: z.string(), entitled: z.boolean(), enabled: z.boolean() }),
  ),
  features: z.array(
    z.object({ key: z.string(), module: z.string(), enabled: z.boolean() }),
  ),
});

export class AuthorizationError extends Error {
  constructor(
    public readonly reason:
      | "invalid_context"
      | "permission_denied"
      | "not_entitled"
      | "module_disabled"
      | "feature_disabled",
  ) {
    super("This capability is not available in the current workspace.");
  }
}

export async function loadEffectiveAuthorization(): Promise<AuthorizationSnapshot | null> {
  const [{ supabase }, { active }] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (!active) return null;
  const { data, error } = await supabase.rpc("get_my_authorization", {
    target_organization_id: active.organizationId,
    ...(active.schoolId ? { target_school_id: active.schoolId } : {}),
  });
  if (error) throw new AuthorizationError("invalid_context");
  const parsed = authorizationSchema.safeParse(data);
  if (!parsed.success) throw new Error("Authorization response was invalid");
  return parsed.data;
}

export async function requireCapability(requirement: CapabilityRequirement) {
  const authorization = await loadEffectiveAuthorization();
  if (!authorization) throw new AuthorizationError("invalid_context");
  const decision = evaluateAccess(authorization, requirement);
  if (!decision.allowed) throw new AuthorizationError(decision.reason);
  return authorization;
}
