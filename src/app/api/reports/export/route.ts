import { NextResponse } from "next/server";
import {
  loadReportingWorkspace,
  recordReportExport,
} from "@/features/reporting/service";

const csv = (value: unknown) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET(request: Request) {
  const url = new URL(request.url);
  const schoolIds = (url.searchParams.get("schools") ?? "")
    .split(",")
    .filter(Boolean);
  try {
    const workspace = await loadReportingWorkspace({
      schoolIds,
      sessionId: url.searchParams.get("session") ?? undefined,
      periodId: url.searchParams.get("period") ?? undefined,
      dateFrom: url.searchParams.get("from") ?? undefined,
      dateTo: url.searchParams.get("to") ?? undefined,
    });
    await recordReportExport(
      workspace.filters.schoolIds,
      "management_summary",
      workspace.filters,
    );
    const headings = [
      "School",
      "Active enrollment",
      "Applications",
      "Enrolled applicants",
      "Attendance entries",
      "Present or late",
      "Absent",
      "Late",
      "Active staff",
      "Approved plans",
      "Delivered lessons",
      "Billed NGN",
      "Collected NGN",
      "Outstanding NGN",
      "Expenses NGN",
      "Other income NGN",
      "Published result batches",
      "Published subject results",
      "Passed subject results",
      "Promotions",
      "Published notices",
      "Notice reads",
      "Open tasks",
      "Overdue tasks",
    ];
    const rows = workspace.dashboard.schools.map((s) => [
      s.schoolName,
      s.students.activeEnrollments,
      s.admissions.applications,
      s.admissions.enrolled,
      s.attendance.entries,
      s.attendance.present,
      s.attendance.absent,
      s.attendance.late,
      s.staff.activeAssignments,
      s.teaching.approvedPlans,
      s.teaching.deliveredLessons,
      s.finance.billed,
      s.finance.collected,
      s.finance.outstanding,
      s.finance.expenses,
      s.finance.otherIncome,
      s.results.publishedBatches,
      s.results.publishedResults,
      s.results.passedResults,
      s.results.promoted,
      s.communication.publishedNotices,
      s.communication.noticeReads,
      s.operations.openTasks,
      s.operations.overdueTasks,
    ]);
    const body = [headings, ...rows]
      .map((row) => row.map(csv).join(","))
      .join("\r\n");
    return new NextResponse(body, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="schoolflow-management-${workspace.filters.dateTo}.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Report export is unavailable" },
      { status: 403 },
    );
  }
}
