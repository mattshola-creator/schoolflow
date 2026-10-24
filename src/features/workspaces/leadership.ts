import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import { evaluateAccess } from "@/features/authorization/evaluator";
import {
  ownerVisibility,
  projectOwnerSummary,
} from "@/features/owner-dashboard/model";
import type { SchoolSummary } from "@/features/reporting/service";
export function projectLeadership(
  school: SchoolSummary,
  schoolId: string,
  auth: AuthorizationSnapshot,
) {
  const visible = ownerVisibility(auth);
  const summary = projectOwnerSummary(school, schoolId, visible);
  const canTeach =
    evaluateAccess(auth, {
      module: "reporting",
      permission: "reporting.dashboard.view",
      feature: "reporting.management_dashboard",
    }).allowed &&
    evaluateAccess(auth, {
      module: "reporting",
      permission: "reporting.academic.view",
      feature: "reporting.standard_reports",
    }).allowed &&
    evaluateAccess(auth, {
      module: "academics",
      permission: "academics.teaching_assignments.view",
      feature: "academics.teaching_management",
    }).allowed;
  return {
    ...summary,
    ...(canTeach
      ? {
          teaching: {
            approvedPlans: school.teaching.approvedPlans,
            deliveredLessons: school.teaching.deliveredLessons,
          },
        }
      : {}),
  };
}
