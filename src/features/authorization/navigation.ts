import {
  evaluateAccess,
  type AccessDecision,
  type AuthorizationSnapshot,
} from "./evaluator";
import { moduleNavigation } from "./catalog";

export type WorkspaceAccessItem = (typeof moduleNavigation)[number] &
  AccessDecision;

export function buildWorkspaceAccess(authorization: AuthorizationSnapshot) {
  const evaluated: WorkspaceAccessItem[] = moduleNavigation.map((item) => ({
    ...item,
    ...evaluateAccess(authorization, item),
  }));

  return {
    available: evaluated.filter((item) => item.allowed),
    unavailable: evaluated.filter(
      (item) =>
        !item.allowed && authorization.permissions.includes(item.permission),
    ),
  };
}

export function describeAccessReason(reason: AccessDecision["reason"]) {
  switch (reason) {
    case "not_entitled":
      return "Not included in the current plan";
    case "module_disabled":
      return "Module is unavailable";
    case "feature_disabled":
      return "Not activated for this organization";
    case "permission_denied":
      return "Your role does not grant access";
    default:
      return "Available";
  }
}
