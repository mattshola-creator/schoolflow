import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAssessmentWorkspace } from "@/features/assessments/service";
import { readScoreSheetContext } from "@/features/assessments/score-sheet-context";
import { assessmentWorkflowLabel } from "@/features/assessments/presentation";
import {
  teacherWorkAreas,
  scoreSheetSummary,
} from "@/features/teacher-workspace/model";
import { ownerEntryEnabled } from "@/features/owner-dashboard/entry";
import { AuthorizationError } from "@/lib/authorization";
import {
  ExecutiveHeader,
  ExecutiveMetric,
} from "@/components/operational/premium";
import { StatePanel } from "@/components/ui/state-panel";
import "@/features/teacher-workspace/academic.css";
export default async function TeacherWorkspacePage() {
  if (!ownerEntryEnabled()) notFound();
  const w = await loadAssessmentWorkspace().catch((error: unknown) => {
    if (error instanceof AuthorizationError) return null;
    throw error;
  });
  if (!w)
    return (
      <StatePanel
        kind="unauthorized"
        title="Teacher workspace unavailable"
        description="Select an authorized school with Assessment score-sheet access."
      />
    );
  const batches = w.batches.slice(0, 30);
  const rows = await Promise.all(
    batches.map(async (batch) => ({
      id: batch.id,
      status: batch.status,
      version: batch.version,
      labels: await readScoreSheetContext(
        (name, args) => w.supabase.rpc(name, args),
        {
          target_batch_id: batch.id,
          target_organization_id: w.active.organizationId,
          target_school_id: w.active.schoolId!,
        },
      ),
    })),
  );
  const counts = scoreSheetSummary(batches);
  return (
    <main className="sf-academic-workspace min-w-0 space-y-6 py-4">
      <ExecutiveHeader
        eyebrow="Teacher · authorized academic workspace"
        title="Your teaching day"
        context={`${w.active.schoolName ?? "Selected school"} · Permission-scoped academic work`}
      >
        <Link
          href="/workspaces"
          className="min-h-11 rounded-xl border px-4 py-3 underline"
        >
          My workspaces
        </Link>
      </ExecutiveHeader>
      <p className="text-sm leading-6">
        Score sheets follow the existing school and assignment authorization.
        Displaying the latest {rows.length} of {w.batches.length} visible
        batches, maximum 30. Counts below describe this list, not the school’s
        full teaching workload.
      </p>
      <section
        aria-label="Visible academic work"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <ExecutiveMetric
          title="Classes in score sheets"
          value={String(counts.classes)}
        >
          <p>Distinct class and arm combinations in this list.</p>
        </ExecutiveMetric>
        <ExecutiveMetric
          title="Subjects in score sheets"
          value={String(counts.subjects)}
        >
          <p>Distinct subjects in this list.</p>
        </ExecutiveMetric>
        <ExecutiveMetric
          title="Draft or reopened sheets"
          value={String(counts.drafts)}
          href="/assessments#result-workflow"
          linkLabel="Open score sheets"
        >
          <p>
            Draft and reopened records in this list. Academic locks still apply.
          </p>
        </ExecutiveMetric>
        <ExecutiveMetric
          title="Submitted sheets"
          value={String(counts.submitted)}
          href="/assessments?status=submitted#result-workflow"
          linkLabel="Open submitted sheets"
        >
          <p>Submitted records in this list; score entry is read-only.</p>
        </ExecutiveMetric>
      </section>
      <section aria-labelledby="teacher-work-areas">
        <h2 id="teacher-work-areas" className="mb-3 text-xl font-semibold">
          Your work areas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {teacherWorkAreas(w.authorization).map((area) => (
            <Link
              key={area.href}
              href={area.href}
              className="sf-academic-panel block min-h-11 rounded-2xl border p-5 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <h3 className="font-semibold underline underline-offset-4">
                {area.title} →
              </h3>
              <p className="mt-2 text-sm leading-6">{area.description}</p>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-sm">
          Timetable, attendance, lessons and tasks appear only when your
          existing permissions and entitlements include them.
        </p>
      </section>
      <section aria-labelledby="teacher-score-sheets">
        <h2 id="teacher-score-sheets" className="mb-3 text-xl font-semibold">
          Score sheets & submission status
        </h2>
        {rows.length ? (
          <ul className="grid min-w-0 gap-4 lg:grid-cols-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className="sf-academic-panel min-w-0 rounded-2xl border p-5"
              >
                <p className="text-sm font-semibold">
                  {assessmentWorkflowLabel(row.status)} · Version {row.version}
                </p>
                <h3 className="mt-2 text-lg font-semibold break-words">
                  {row.labels.subjectName ?? "Subject label unavailable"} ·{" "}
                  {row.labels.className ?? "Class label unavailable"}{" "}
                  {row.labels.armName ?? ""}
                </h3>
                <p className="mt-2 text-sm">
                  {row.labels.sessionName ?? "Session label unavailable"} ·{" "}
                  {row.labels.periodName ?? "Period label unavailable"}
                </p>
                <p className="mt-2 text-sm">
                  Assigned teacher:{" "}
                  {row.labels.assignedTeacherName ??
                    "Assigned teacher details unavailable in this workspace"}
                </p>
                <Link
                  className="mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                  href={`/assessments/${row.id}`}
                >
                  Open score sheet →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <StatePanel
            kind="empty"
            title="No visible score sheets"
            description="No batches are available under your current school and assignment permissions. An authorized administrator can check your assignment."
          />
        )}
      </section>
    </main>
  );
}
