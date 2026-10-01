import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadPublishedReport } from "@/features/assessments/service";
import type { Json } from "@/types/database.generated";

type SnapshotResult = {
  student_id: string;
  weighted_percent: number;
  total_score: number;
  grade: string;
  remark: string;
  is_pass: boolean;
};
function resultsFrom(snapshot: Json): SnapshotResult[] {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot))
    return [];
  const value = snapshot.results;
  return Array.isArray(value)
    ? value.filter((item): item is SnapshotResult =>
        Boolean(
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          typeof item.student_id === "string",
        ),
      )
    : [];
}

export default async function ReportCardPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const workspace = await loadPublishedReport(batchId);
  const batch = workspace.publication.result_batches;
  const results = resultsFrom(workspace.publication.snapshot);
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
                <th className="p-3">Student ID</th>
                <th className="p-3">Total</th>
                <th className="p-3">Percent</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Remark</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.student_id} className="border-b last:border-0">
                  <td className="p-3">{r.student_id}</td>
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
