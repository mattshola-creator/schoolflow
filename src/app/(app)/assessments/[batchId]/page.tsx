import { AuthorizationError } from "@/lib/authorization";
import { StatePanel } from "@/components/ui/state-panel";
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
  const workspace = await loadScoreSheet(batchId).catch((error: unknown) => {
    if (error instanceof AuthorizationError) return null;
    throw error;
  });
  if (!workspace)
    return (
      <main className="py-10 sm:py-12">
        <h1 className="mb-5 text-3xl font-semibold">
          Assessment access unavailable
        </h1>
        <StatePanel
          kind="unauthorized"
          title="This score sheet is not available in your current workspace"
          description="Select an authorized school and account with Assessment access. An administrator can review your permissions and module availability."
          action={
            <ButtonLink href="/dashboard">Back to school overview</ButtonLink>
          }
        />
      </main>
    );
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
      <section className="mt-7 rounded-xl border bg-white">
        <div className="grid gap-3 p-3 sm:hidden">
          {workspace.students.map((student) => {
            const result = resultMap.get(student.student_id);
            const studentName =
              `${student.student_profiles[0]?.people.first_name ?? ""} ${student.student_profiles[0]?.people.last_name ?? ""}`.trim();
            return (
              <article
                key={student.student_id}
                className="rounded-lg border p-4"
                aria-label={`Scores for ${studentName || "student"}`}
              >
                <div className="flex items-start justify-between gap-3 border-b pb-3">
                  <div>
                    <h2 className="font-semibold">
                      {studentName || "Student"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {student.student_profiles[0]?.student_number}
                    </p>
                  </div>
                  {result ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-800">
                      {result.grade} · {result.weighted_percent}%
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      Draft
                    </span>
                  )}
                </div>
                <div className="mt-3 grid gap-3">
                  {components.map((component) => (
                    <div
                      key={component.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{component.name}</p>
                        <p className="text-xs text-slate-500">
                          Maximum {component.maximum_score}
                        </p>
                      </div>
                      {editable ? (
                        <form
                          action={saveAssessmentScore}
                          className="flex shrink-0 items-center gap-2"
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
                          <label
                            className="sr-only"
                            htmlFor={`${student.student_id}-${component.id}`}
                          >
                            {component.name} score for{" "}
                            {studentName || "student"}
                          </label>
                          <input
                            id={`${student.student_id}-${component.id}`}
                            className={`${fieldClass} w-24`}
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
                        <span className="font-medium tabular-nums">
                          {scoreMap.get(
                            `${student.student_id}:${component.id}`,
                          ) ?? "—"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {result ? (
                  <p className="mt-3 border-t pt-3 text-sm text-slate-600">
                    {result.remark}
                  </p>
                ) : null}
              </article>
            );
          })}
          {!workspace.students.length ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              No active students are enrolled in this class.
            </p>
          ) : null}
        </div>
        <div className="hidden overflow-x-auto sm:block">
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
                  <tr
                    key={student.student_id}
                    className="border-b last:border-0"
                  >
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
                            <input
                              type="hidden"
                              name="batchId"
                              value={batchId}
                            />
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
        </div>
      </section>
    </main>
  );
}
