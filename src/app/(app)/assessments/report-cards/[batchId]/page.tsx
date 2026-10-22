import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadPublishedReport } from "@/features/assessments/service";
import { publishedReportResults } from "@/features/assessments/published-report";
import { AuthorizationError } from "@/lib/authorization";
import { StatePanel } from "@/components/ui/state-panel";

export default async function ReportCardPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const workspace = await loadPublishedReport(batchId).catch(
    (error: unknown) => {
      if (error instanceof AuthorizationError) return null;
      throw error;
    },
  );
  if (!workspace)
    return (
      <main className="py-10 sm:py-12">
        <h1 className="mb-5 text-3xl font-semibold">
          Report access unavailable
        </h1>
        <StatePanel
          kind="unauthorized"
          title="This report is not available in your current workspace"
          description="Select an authorized school and account with published-result access. An administrator can review your permissions and module availability."
          action={
            <ButtonLink href="/dashboard">Back to school overview</ButtonLink>
          }
        />
      </main>
    );
  const batch = workspace.publication.result_batches;
  const results = publishedReportResults(workspace.publication.snapshot);
  return (
    <main className="py-10 sm:py-12 print:py-0">
      <PageHeader
        eyebrow="Published report"
        title={`${batch.subjects.name} · ${batch.class_levels.name}`}
        description={`${workspace.active.schoolName} · ${batch.academic_sessions.name} · ${batch.academic_periods.name} · version ${workspace.publication.version}`}
        actions={
          <ButtonLink href="/assessments" variant="secondary">
            Back
          </ButtonLink>
        }
      />
      <section className="mt-7 rounded-xl border bg-white p-5 sm:p-6">
        <p className="text-sm text-slate-500">
          Published{" "}
          {new Date(workspace.publication.published_at).toLocaleString()}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Student</th>
                <th className="p-3">Total</th>
                <th className="p-3">Percent</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Remark</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.student_id} className="border-b last:border-0">
                  <td className="p-3">
                    <p>{r.studentName ?? "Name not captured at publication"}</p>
                    <p className="text-xs text-slate-500">
                      {r.studentNumber ?? r.student_id}
                    </p>
                  </td>
                  <td className="p-3">{r.total_score}</td>
                  <td className="p-3">{r.weighted_percent}%</td>
                  <td className="p-3 font-semibold">{r.grade}</td>
                  <td className="p-3">{r.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-xs text-slate-500">
          This report is generated from the immutable published result snapshot.
        </p>
      </section>
    </main>
  );
}
