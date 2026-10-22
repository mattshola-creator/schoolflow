import "server-only";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { AuthorizationError, requireCapability } from "@/lib/authorization";
import { loadAcademicContext } from "@/lib/academic-context";
import { loadReportingWorkspace } from "@/features/reporting/service";
import { loadFinanceDashboard } from "@/features/finance/service";
import { loadOperationalHome } from "@/features/home/service";
import {
  assertOwnerSchool,
  hasEffectiveOwnerAssignment,
  ownerVisibility,
  projectOwnerSummary,
  type OwnerSummary,
} from "./model";

export async function loadOwnerDashboard() {
  const authorization = await requireCapability({
    module: "foundation",
    permission: "organization.view",
    feature: "foundation.authorization_inspection",
  });
  const [{ supabase, user }, tenant] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  const active = assertOwnerSchool(tenant.active, authorization);
  // Identity-bound role check; neither a query parameter nor a build flag grants owner authority.
  const { data: assignments, error } = await supabase
    .from("role_assignments")
    .select("effective_from,effective_to,roles!inner(key)")
    .eq("organization_id", active.organizationId)
    .eq("user_id", user.id)
    .eq("scope", "organization")
    .eq("status", "active")
    .eq("roles.key", "organization_owner");
  if (error || !hasEffectiveOwnerAssignment(assignments ?? []))
    throw new AuthorizationError("permission_denied");
  const academic = await loadAcademicContext(
    active.organizationId,
    active.schoolId,
  );
  const visibility = ownerVisibility(authorization);
  const [report, finance, work] = await Promise.all([
    visibility.enrollment || visibility.attendance || visibility.publications
      ? loadReportingWorkspace({
          schoolIds: [active.schoolId],
          sessionId: academic.sessionId ?? undefined,
          periodId: academic.periodId ?? undefined,
        })
          .then((value) => ({ value, error: false }))
          .catch(() => ({ value: null, error: true }))
      : Promise.resolve({ value: null, error: false }),
    visibility.finance
      ? loadFinanceDashboard()
          .then((value) => ({ value, error: false }))
          .catch(() => ({ value: null, error: true }))
      : Promise.resolve({ value: null, error: false }),
    visibility.work
      ? loadOperationalHome(active, authorization)
          .then((value) => ({ value, error: false }))
          .catch(() => ({ value: null, error: true }))
      : Promise.resolve({ value: null, error: false }),
  ]);
  let summary: OwnerSummary = {};
  if (report.value) {
    const r = report.value;
    if (
      r.dashboard.organizationId !== active.organizationId ||
      r.dashboard.schools.length !== 1 ||
      r.dashboard.schoolIds.length !== 1 ||
      r.dashboard.schoolIds[0] !== active.schoolId
    )
      throw new Error("Reporting context changed");
    summary = projectOwnerSummary(
      r.dashboard.schools[0],
      active.schoolId,
      visibility,
    );
  }
  if (
    finance.value &&
    (finance.value.active.organizationId !== active.organizationId ||
      finance.value.active.schoolId !== active.schoolId)
  )
    throw new Error("Finance context changed");
  // Construct only permitted presentation fields. Never return clients, authorization snapshots, raw records or alternate schools.
  const f = finance.value;
  return {
    userEmail: user.email,
    tenant,
    authorization,
    academic,
    dto: {
      schoolName: active.schoolName ?? "Selected school",
      organizationName: active.organizationName,
      sessionName: academic.sessionName ?? "All academic sessions",
      periodName: academic.periodName ?? "All academic periods",
      summary,
      reportingWindow: report.value
        ? {
            from: report.value.filters.dateFrom,
            to: report.value.filters.dateTo,
          }
        : null,
      reportingError: report.error,
      visibility,
      financeError: finance.error,
      finance: f
        ? {
            windowStart: f.windowStart,
            ...(f.visibility.billing
              ? { outstandingByCurrency: f.outstandingByCurrency }
              : {}),
            ...(f.visibility.collections
              ? {
                  collectionsByCurrency: f.verifiedCollectionsByCurrency,
                  pendingPayments: f.pendingPayments,
                }
              : {}),
          }
        : null,
      workError: work.error,
      work: work.value
        ? {
            counts: {
              tasks: work.value.counts.tasks,
              urgent: work.value.counts.urgent,
              ...(visibility.approvals
                ? { approvals: work.value.counts.approvals }
                : {}),
              ...(visibility.notifications
                ? { notifications: work.value.counts.notifications }
                : {}),
            },
            tasks: work.value.tasks
              .filter(
                (task) =>
                  task.kind === "task" ||
                  (task.kind === "approval" && visibility.approvals) ||
                  (task.kind === "notification" && visibility.notifications),
              )
              .slice(0, 6),
          }
        : null,
    },
  };
}
export type OwnerDashboardDTO = Awaited<
  ReturnType<typeof loadOwnerDashboard>
>["dto"];
