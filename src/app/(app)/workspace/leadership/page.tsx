import Link from "next/link";
import { evaluateAccess } from "@/features/authorization/evaluator";
import { loadAssessmentWorkspace } from "@/features/assessments/service";
import { projectAssessmentQueue } from "@/features/workspaces/assessment-queue";
import { notFound } from "next/navigation";
import { ownerEntryEnabled } from "@/features/owner-dashboard/entry";
import { requireCapability, AuthorizationError } from "@/lib/authorization";
import { loadTenantContext } from "@/lib/tenant-context";
import { loadAcademicContext } from "@/lib/academic-context";
import { loadReportingWorkspace } from "@/features/reporting/service";
import { projectLeadership } from "@/features/workspaces/leadership";
import { loadOperationalHome } from "@/features/home/service";
import {
  projectOwnerWork,
  ownerVisibility,
} from "@/features/owner-dashboard/model";
import { ProgressCard } from "@/features/showroom/charts";
import { StatePanel } from "@/components/ui/state-panel";
import {
  WorkspaceHeader,
  WorkspaceCard,
} from "@/components/workspace-presentation";
import "@/features/showroom/visualizations.css";
export default async function LeadershipPage() {
  if (!ownerEntryEnabled()) notFound();
  const auth = await requireCapability({
    module: "reporting",
    permission: "reporting.dashboard.view",
    feature: "reporting.management_dashboard",
  }).catch((error) => {
    if (error instanceof AuthorizationError) return null;
    throw error;
  });
  if (!auth)
    return (
      <StatePanel
        kind="unauthorized"
        title="Leadership workspace unavailable"
        description="Your current access does not include school leadership reporting."
      />
    );
  const { active } = await loadTenantContext();
  if (
    !active?.schoolId ||
    active.organizationId !== auth.organizationId ||
    active.schoolId !== auth.schoolId
  )
    return (
      <StatePanel
        kind="unauthorized"
        title="Choose an authorized school"
        description="Use the school switcher to select a school before opening leadership reporting."
      />
    );
  const academic = await loadAcademicContext(
    active.organizationId,
    active.schoolId,
  );
  const report = await loadReportingWorkspace({
    schoolIds: [active.schoolId],
    sessionId: academic.sessionId ?? undefined,
    periodId: academic.periodId ?? undefined,
  });
  if (
    report.dashboard.organizationId !== active.organizationId ||
    report.dashboard.schools.length !== 1 ||
    report.dashboard.schoolIds.length !== 1 ||
    report.dashboard.schoolIds[0] !== active.schoolId
  )
    throw new Error("Leadership reporting scope changed");
  const summary = projectLeadership(
    report.dashboard.schools[0],
    active.schoolId,
    auth,
  );
  const work = projectOwnerWork(
    await loadOperationalHome(active, auth),
    ownerVisibility(auth),
  );
  const canReadAssessment = evaluateAccess(auth, {
    module: "academics",
    permission: "academics.scores.view",
    feature: "academics.score_entry",
  }).allowed;
  const assessment = canReadAssessment ? await loadAssessmentWorkspace() : null;
  if (
    assessment &&
    (assessment.active.organizationId !== active.organizationId ||
      assessment.active.schoolId !== active.schoolId)
  )
    throw new Error("Leadership Assessment scope changed");
  const queue = assessment
    ? projectAssessmentQueue(assessment.batches, academic, auth)
    : null;
  return (
    <main className="min-w-0 space-y-6 py-4">
      <WorkspaceHeader
        eyebrow="School leadership"
        title={`${active.schoolName} overview`}
        description={`${academic.sessionName ?? "All sessions"} · ${academic.periodName ?? "All periods"}`}
      >
        <Link
          href="/workspaces"
          className="min-h-11 rounded-xl border px-4 py-3 text-sm"
        >
          My workspaces
        </Link>
      </WorkspaceHeader>
      <section
        aria-label="Leadership school summaries"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {summary.activeEnrollments !== undefined ? (
          <WorkspaceCard
            title="Active enrollments"
            value={summary.activeEnrollments.toLocaleString()}
            description={`Enrollment records in ${academic.sessionName ?? "the selected scope"}; not unique learners.`}
            href="/students"
          />
        ) : null}
        {summary.publicationVersions !== undefined ? (
          <WorkspaceCard
            title="Published result versions"
            value={summary.publicationVersions.toLocaleString()}
            description="Includes historical batch publications in the selected academic scope."
            href="/assessments"
          />
        ) : null}
        {summary.teaching ? (
          <>
            <WorkspaceCard
              title="Approved lesson plans"
              value={summary.teaching.approvedPlans.toLocaleString()}
              description="Existing Management report count in this school and reporting scope."
              href="/teaching/lessons"
            />
            <WorkspaceCard
              title="Delivered lessons"
              value={summary.teaching.deliveredLessons.toLocaleString()}
              description="Existing Management report count; not a completion percentage."
              href="/teaching/lessons"
            />
          </>
        ) : null}
      </section>
      {summary.attendance ? (
        <ProgressCard
          dataKind="authorized"
          title="Recorded attendance"
          description="Present plus late / recorded marks. Missing marks are not absences. Session/date scoped; not period-filtered."
          period={`${report.filters.dateFrom} through ${report.filters.dateTo}, inclusive`}
          numerator={summary.attendance.presentIncludingLate}
          denominator={summary.attendance.recordedMarks}
        />
      ) : null}
      {queue ? (
        <section aria-labelledby="assessment-progress" className="space-y-3">
          <h2 id="assessment-progress" className="text-xl font-semibold">
            Assessment workflow
          </h2>
          <p className="text-sm">
            Result batches in {academic.sessionName ?? "all sessions"} ·{" "}
            {academic.periodName ?? "all periods"}. Counts include versioned
            batches; not unique learners. Review and publication actions retain
            their own permissions.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {queue.map((item) => (
              <WorkspaceCard
                key={item.status}
                title={
                  item.status === "submitted"
                    ? "Awaiting review"
                    : item.status === "reviewed"
                      ? "Awaiting approval"
                      : item.status === "approved"
                        ? "Awaiting publication"
                        : `${item.status[0].toUpperCase()}${item.status.slice(1)} batches`
                }
                value={item.count.toLocaleString()}
                description="Open the matching result workflow."
                href={`/assessments?status=${item.status}${academic.sessionId ? `&session=${encodeURIComponent(academic.sessionId)}` : ""}${academic.periodId ? `&period=${encodeURIComponent(academic.periodId)}` : ""}#result-workflow`}
              />
            ))}
          </div>
        </section>
      ) : null}
      {work ? (
        <section className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Your next actions</h2>
          <p className="mt-2">
            {work.counts.tasks} open tasks
            {work.counts.approvals !== undefined
              ? ` · ${work.counts.approvals} pending approvals`
              : ""}
          </p>
          <ul className="mt-4 grid gap-3">
            {work.tasks.map((t) => (
              <li key={`${t.kind}:${t.id}`}>
                <Link
                  href={t.href}
                  className="block min-h-11 rounded-xl border p-3 font-medium"
                >
                  {t.title}
                  <span className="block text-sm font-normal">{t.status}</span>
                </Link>
              </li>
            ))}
          </ul>
          {!work.tasks.length ? (
            <p className="mt-4">
              No pending work returned for your current school.
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
