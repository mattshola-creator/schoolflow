import type { HomeTask, OperationalCounts } from "@/features/home/model";
import {
  evaluateAccess,
  type AuthorizationSnapshot,
} from "@/features/authorization/evaluator";
import type { SchoolSummary } from "@/features/reporting/service";
import type { TenantOption } from "@/features/tenancy/context";

export class OwnerContextError extends Error {}

export function assertOwnerSchool(
  active: TenantOption | null,
  auth: AuthorizationSnapshot,
) {
  if (
    !active?.schoolId ||
    active.organizationId !== auth.organizationId ||
    active.schoolId !== auth.schoolId
  )
    throw new OwnerContextError(
      "An explicit authorized school context is required",
    );
  return active as TenantOption & { schoolId: string };
}
export function ownerVisibility(auth: AuthorizationSnapshot) {
  const can = (permission: string, module: string, feature?: string) =>
    evaluateAccess(auth, { permission, module, feature }).allowed;
  const reporting = can(
    "reporting.dashboard.view",
    "reporting",
    "reporting.management_dashboard",
  );
  return {
    enrollment:
      reporting &&
      can("reporting.school.view", "reporting", "reporting.standard_reports") &&
      can("students.view", "students"),
    attendance:
      reporting &&
      can(
        "reporting.attendance.view",
        "reporting",
        "reporting.standard_reports",
      ) &&
      can("attendance.view", "attendance"),
    publications:
      reporting &&
      can(
        "reporting.academic.view",
        "reporting",
        "reporting.standard_reports",
      ) &&
      can("academics.scores.view", "academics", "academics.score_entry"),
    finance: can("finance.view", "finance"),
    approvals: can(
      "shared.approvals.view",
      "foundation",
      "foundation.action_center",
    ),
    notifications: can(
      "shared.notifications.view",
      "foundation",
      "foundation.action_center",
    ),
    work: can("shared.tasks.view", "foundation", "foundation.action_center"),
  };
}
export type OwnerVisibility = ReturnType<typeof ownerVisibility>;
export type OwnerSummary = {
  activeEnrollments?: number;
  attendance?: { presentIncludingLate: number; recordedMarks: number };
  publicationVersions?: number;
};
/** Explicit allowlist: raw reporting envelopes, names and unrelated domain fields never cross the client boundary. */
export function projectOwnerSummary(
  school: SchoolSummary,
  schoolId: string,
  visibility: OwnerVisibility,
): OwnerSummary {
  if (school.schoolId !== schoolId)
    throw new Error("Unexpected reporting school");
  const dto: OwnerSummary = {};
  if (visibility.enrollment)
    dto.activeEnrollments = school.students.activeEnrollments;
  if (visibility.attendance)
    dto.attendance = {
      presentIncludingLate: school.attendance.present,
      recordedMarks: school.attendance.entries,
    };
  if (visibility.publications)
    dto.publicationVersions = school.results.publishedBatches;
  return dto;
}

/** The caller must supply only identity/organization-bound owner assignments. */
export function hasEffectiveOwnerAssignment(
  rows: readonly { effective_from: string; effective_to: string | null }[],
  now = Date.now(),
) {
  return rows.some(
    (row) =>
      new Date(row.effective_from).getTime() <= now &&
      (row.effective_to === null || new Date(row.effective_to).getTime() > now),
  );
}

/** Allowlist presentation fields even if the upstream service later grows. */
export function projectOwnerWork(
  work: { counts: OperationalCounts; tasks: readonly HomeTask[] },
  visibility: OwnerVisibility,
) {
  if (!visibility.work) return null;
  return {
    counts: {
      tasks: work.counts.tasks,
      urgent: work.counts.urgent,
      ...(visibility.approvals ? { approvals: work.counts.approvals } : {}),
      ...(visibility.notifications
        ? { notifications: work.counts.notifications }
        : {}),
    },
    tasks: work.tasks
      .filter(
        (task) =>
          task.kind === "task" ||
          (task.kind === "approval" && visibility.approvals) ||
          (task.kind === "notification" && visibility.notifications),
      )
      .slice(0, 6)
      .map((task) => ({
        id: task.id,
        kind: task.kind,
        title: task.title,
        status: task.status,
        href: task.href,
      })),
  };
}
