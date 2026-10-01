import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadScoreSheet } from "@/features/assessments/service";
import { saveAssessmentScore } from "../actions";

export default async function ScoreSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ batchId: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [{ batchId }, notice] = await Promise.all([params, searchParams]);
  const workspace = await loadScoreSheet(batchId);
  const components = [
    ...workspace.batch.assessment_schemes.assessment_components,
  ].sort((a, b) => a.sequence - b.sequence);
  const scoreMap = new Map(
    workspace.scores.map((score) => [
      `${score.student_id}:${score.component_id}`,
      score.score,
    ]),
  );
  const resultMap = new Map(
    workspace.results.map((result) => [result.student_id, result]),
  );
  const editable =
    workspace.batch.status === "draft" || workspace.batch.status === "reopened";
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Score sheet"
        title={`${workspace.batch.subjects.name} · ${workspace.batch.class_levels.name}${workspace.batch.class_arms ? ` ${workspace.batch.class_arms.name}` : ""}`}
        description={`${workspace.batch.academic_sessions.name} · ${workspace.batch.academic_periods.name} · ${workspace.batch.assessment_schemes.name}`}
        actions={
          <ButtonLink href="/assessments" variant="secondary">
            Back
          </ButtonLink>
        }
      />
      {notice.error || notice.message ? (
        <p
          role={notice.error ? "alert" : "status"}
          className={`mt-5 rounded-lg p-3 text-sm ${notice.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}
        >
          {notice.error ?? notice.message}
        </p>
      ) : null}
      <section className="mt-7 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3">Student</th>
              {components.map((c) => (
                <th key={c.id} className="p-3">
                  {c.name}
                  <span className="block text-xs font-normal text-slate-500">
                    /{c.maximum_score}
                  </span>
                </th>
              ))}
              <th className="p-3">Result</th>
            </tr>
          </thead>
          <tbody>
            {workspace.students.map((student) => {
              const result = resultMap.get(student.student_id);
              return (
                <tr key={student.student_id} className="border-b last:border-0">
                  <td className="p-3 font-medium">
                {student.student_profiles[0]?.people.first_name}{" "}
                {student.student_profiles[0]?.people.last_name}
                    <span className="block text-xs font-normal text-slate-500">
                  {student.student_profiles[0]?.student_number}
                    </span>
                  </td>
                  {components.map((component) => (
                    <td key={component.id} className="p-3">
                      {editable ? (
                        <form
                          action={saveAssessmentScore}
                          className="flex min-w-32 gap-2"
                        >
                          <input type="hidden" name="batchId" value={batchId} />
                          <input
                            type="hidden"
                            name="studentId"
                            value={student.student_id}
                          />
                          <input
                            type="hidden"
                            name="componentId"
                            value={component.id}
                          />
                          <input
                            className={`${fieldClass} w-20`}
                            name="score"
                            type="number"
                            min="0"
                            max={component.maximum_score}
                            step="0.01"
                            defaultValue={
                              scoreMap.get(
                                `${student.student_id}:${component.id}`,
                              ) ?? ""
                            }
                            required
                          />
                          <Button type="submit" variant="secondary">
                            Save
                          </Button>
                        </form>
                      ) : (
                        (scoreMap.get(
                          `${student.student_id}:${component.id}`,
                        ) ?? "—")
                      )}
                    </td>
                  ))}
                  <td className="p-3">
                    {result ? (
                      <>
                        <span className="font-semibold">{result.grade}</span>
                        <span className="block text-xs text-slate-500">
                          {result.weighted_percent}% · {result.remark}
                        </span>
                      </>
                    ) : (
                      "Draft"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!workspace.students.length ? (
          <p className="p-5 text-sm text-slate-600">
            No active students are enrolled in this class.
          </p>
        ) : null}
      </section>
    </main>
  );
}
