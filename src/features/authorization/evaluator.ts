export type ModuleState = {
  key: string;
  entitled: boolean;
  enabled: boolean;
};

export type FeatureState = {
  key: string;
  module: string;
  enabled: boolean;
};

export type AuthorizationSnapshot = {
  organizationId: string;
  schoolId: string | null;
  permissions: string[];
  modules: ModuleState[];
  features: FeatureState[];
};

export type CapabilityRequirement = {
  permission: string;
  module: string;
  feature?: string;
};

export type AccessDecision =
  | { allowed: true; reason: "allowed" }
  | {
      allowed: false;
      reason:
        | "permission_denied"
        | "not_entitled"
        | "module_disabled"
        | "feature_disabled";
    };

export function evaluateAccess(
  authorization: AuthorizationSnapshot,
  requirement: CapabilityRequirement,
): AccessDecision {
  const moduleState = authorization.modules.find(
    (module) => module.key === requirement.module,
  );
  if (!moduleState?.entitled) return { allowed: false, reason: "not_entitled" };
  if (!moduleState.enabled)
    return { allowed: false, reason: "module_disabled" };
  if (requirement.feature) {
    const feature = authorization.features.find(
      (candidate) =>
        candidate.key === requirement.feature &&
        candidate.module === requirement.module,
    );
    if (!feature?.enabled)
      return { allowed: false, reason: "feature_disabled" };
  }
  if (!authorization.permissions.includes(requirement.permission))
    return { allowed: false, reason: "permission_denied" };
  return { allowed: true, reason: "allowed" };
}
