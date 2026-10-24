import {
  evaluateAccess,
  type AuthorizationSnapshot,
} from "@/features/authorization/evaluator";
export const loginWorkspaces = [
  ["auto", "My authorized workspace"],
  ["owner", "Organization / School Owner"],
  ["leadership", "Principal / Headteacher / Vice Principal"],
  ["finance", "Bursar / Finance"],
  ["teaching", "Teacher"],
  ["admissions", "Admissions Officer"],
  ["staff", "School staff"],
  ["family", "Parent / Guardian / Student"],
  ["platform", "Platform Administrator"],
] as const;
export function parseWorkspace(value: unknown) {
  return loginWorkspaces.some(([key]) => key === value)
    ? String(value)
    : "auto";
}
const destinations = {
  leadership: {
    href: "/workspace/leadership",
    permission: "reporting.dashboard.view",
    module: "reporting",
    feature: "reporting.management_dashboard",
  },
  finance: {
    href: "/finance/overview",
    permission: "finance.view",
    module: "finance",
    feature: "finance.fee_management",
  },
  teaching: {
    href: "/teaching",
    permission: "academics.teaching_assignments.view",
    module: "academics",
    feature: "academics.teaching_management",
  },
  admissions: {
    href: "/admissions",
    permission: "admissions.view",
    module: "admissions",
    feature: "admissions.application_workflow",
  },
} as const;
export function workspaceDestination(
  value: unknown,
  auth: AuthorizationSnapshot,
) {
  if (!auth.schoolId || typeof value !== "string" || !(value in destinations))
    return null;
  const target = destinations[value as keyof typeof destinations];
  return evaluateAccess(auth, target).allowed ? target.href : null;
}
