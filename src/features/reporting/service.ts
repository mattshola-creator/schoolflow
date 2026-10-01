import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import type { ReportingFilters } from "./schemas";

export type ReportingSchoolScope = {
  school_id: string;
  school_name: string;
  location_name: string | null;
  can_cross_school: boolean;
};

export type SchoolSummary = {
  schoolId: string;
  schoolName: string;
  students: { activeEnrollments: number; female: number; male: number };
  admissions: { applications: number; accepted: number; enrolled: number };
  attendance: {
    entries: number;
    present: number;
    absent: number;
    late: number;
  };
  staff: { activeAssignments: number };
  teaching: { approvedPlans: number; deliveredLessons: number };
  finance: {
    billed: string;
    collected: string;
    outstanding: string;
    expenses: string;
    otherIncome: string;
  };
  results: {
    publishedBatches: number;
    publishedResults: number;
    passedResults: number;
    gradeDistribution: Record<string, number>;
    promoted: number;
  };
  communication: { publishedNotices: number; noticeReads: number };
  operations: {
    openTasks: number;
    overdueTasks: number;
    pendingLessonPlans: number;
  };
};

export type ManagementDashboard = {
  organizationId: string;
  schoolIds: string[];
  dateFrom: string;
  dateTo: string;
  schools: SchoolSummary[];
};

async function requireReporting(permission: string, feature: string) {
  const authorization = await requireCapability({
    module: "reporting",
    permission,
    feature,
  });
  const [{ supabase }, { active }] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (
    !active?.schoolId ||
    active.organizationId !== authorization.organizationId
  )
    throw new Error("The active reporting context is invalid");
  return { supabase, active, authorization };
}

export async function loadReportingWorkspace(
  filters?: Partial<ReportingFilters>,
) {
  const context = await requireReporting(
    "reporting.dashboard.view",
    "reporting.management_dashboard",
  );
  const scopeResult = await context.supabase.rpc(
    "reporting_scope" as never,
    { org: context.active.organizationId } as never,
  );
  if (scopeResult.error) throw new Error("Reporting scope could not be loaded");
  const scope = (scopeResult.data ?? []) as unknown as ReportingSchoolScope[];
  const defaultSchool =
    scope.find((school) => school.school_id === context.active.schoolId) ??
    scope[0];
  if (!defaultSchool)
    throw new Error("No authorized reporting school is available");
  const schoolIds = filters?.schoolIds?.length
    ? filters.schoolIds
    : [defaultSchool.school_id];
  const now = new Date();
  const prior = new Date(now);
  prior.setUTCDate(prior.getUTCDate() - 30);
  const dateFrom = filters?.dateFrom ?? prior.toISOString().slice(0, 10);
  const dateTo = filters?.dateTo ?? now.toISOString().slice(0, 10);
  const [dashboardResult, sessionsResult, periodsResult] = await Promise.all([
    context.supabase.rpc(
      "management_dashboard" as never,
      {
        org: context.active.organizationId,
        requested_schools: schoolIds,
        session: filters?.sessionId ?? null,
        period: filters?.periodId ?? null,
        date_from: dateFrom,
        date_to: dateTo,
      } as never,
    ),
    context.supabase
      .from("academic_sessions")
      .select("id,name,status,school_id")
      .in("school_id", schoolIds)
      .order("start_date", { ascending: false }),
    context.supabase
      .from("academic_periods")
      .select("id,name,status,school_id,session_id")
      .in("school_id", schoolIds)
      .order("start_date", { ascending: false }),
  ]);
  if (dashboardResult.error || sessionsResult.error || periodsResult.error)
    throw new Error("Management dashboard could not be loaded");
  return {
    ...context,
    scope,
    dashboard: dashboardResult.data as unknown as ManagementDashboard,
    sessions: sessionsResult.data ?? [],
    periods: periodsResult.data ?? [],
    filters: {
      schoolIds,
      sessionId: filters?.sessionId,
      periodId: filters?.periodId,
      dateFrom,
      dateTo,
    },
  };
}

export async function searchReporting(query: string, schoolIds: string[]) {
  const context = await requireReporting(
    "reporting.search",
    "reporting.global_search",
  );
  const result = await context.supabase.rpc(
    "reporting_global_search" as never,
    {
      org: context.active.organizationId,
      school_ids: schoolIds,
      query_text: query,
    } as never,
  );
  if (result.error) throw new Error("Global search could not be completed");
  return (result.data ?? []) as unknown as Array<{
    kind: string;
    id: string;
    schoolId: string;
    label: string;
    context: string;
  }>;
}

export async function recordReportExport(
  schoolIds: string[],
  reportKey: string,
  filters: Record<string, unknown>,
) {
  const context = await requireReporting(
    "reporting.export",
    "reporting.exports",
  );
  const result = await context.supabase.rpc(
    "record_reporting_export" as never,
    {
      org: context.active.organizationId,
      school_ids: schoolIds,
      report_key: reportKey,
      filters,
    } as never,
  );
  if (result.error) throw new Error("Report export was denied");
  return result.data as unknown as string;
}

export async function closeAcademicTarget(
  kind: "period" | "session",
  targetId: string,
  reason: string,
) {
  const context = await requireReporting(
    "reporting.academic_close",
    "reporting.academic_rollover",
  );
  const result =
    kind === "period"
      ? await context.supabase.rpc(
          "close_academic_period" as never,
          { target_period: targetId, reason } as never,
        )
      : await context.supabase.rpc(
          "close_academic_session" as never,
          { target_session: targetId, reason } as never,
        );
  if (result.error) throw new Error("Academic close was rejected");
  return result.data as unknown as string;
}

export async function prepareSessionRollover(input: {
  sourceSessionId: string;
  targetName: string;
  targetStart: string;
  targetEnd: string;
  idempotencyKey: string;
}) {
  const context = await requireReporting(
    "reporting.academic_close",
    "reporting.academic_rollover",
  );
  const result = await context.supabase.rpc(
    "prepare_session_rollover" as never,
    {
      source_session: input.sourceSessionId,
      target_name: input.targetName,
      target_start: input.targetStart,
      target_end: input.targetEnd,
      idempotency_key: input.idempotencyKey,
    } as never,
  );
  if (result.error) throw new Error("Session rollover was rejected");
  return result.data as unknown as string;
}
