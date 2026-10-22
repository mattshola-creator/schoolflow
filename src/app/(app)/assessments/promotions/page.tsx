import { randomUUID } from "node:crypto";
import { Button, ButtonLink } from "@/components/ui/button";
import { fieldClass } from "@/components/auth-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusNotice } from "@/components/ui/status-notice";
import { AuthorizationError } from "@/lib/authorization";
import { loadPromotionWorkspace } from "@/features/assessments/service";
import { recordStudentPromotion } from "./actions";

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  let workspace: Awaited<ReturnType<typeof loadPromotionWorkspace>>;
  try {
    workspace = await loadPromotionWorkspace();
  } catch (error) {
    if (!(error instanceof AuthorizationError)) throw error;
    return (
      <main className="py-12">
        <h1 className="text-2xl font-semibold">Promotion access unavailable</h1>
        <p className="mt-3">
          Select an authorized school with promotion access.
        </p>
      </main>
    );
  }
  const notice = await searchParams;
  const names = (rows: { id: string; name: string }[]) =>
    new Map(rows.map((row) => [row.id, row.name]));
  const sessions = names(workspace.sessions),
    periods = names(workspace.periods),
    levels = names(workspace.levels);
  const students = new Map(
    workspace.students.map((row) => [
      row.id,
      `${row.people.first_name} ${row.people.last_name} · ${row.student_number}`,
    ]),
  );
  const label = "grid gap-1.5 text-sm font-medium";
  return (
    <main className="space-y-6 py-10">
      <PageHeader
        eyebrow="Assessment & Results"
        title="Student promotion"
        description="Record an authorized progression decision after published results. Source enrollments and published reports remain in history."
      />
      <ButtonLink href="/assessments" variant="secondary">
        Back to Assessment
      </ButtonLink>
      {notice.error && <StatusNotice tone="error">{notice.error}</StatusNotice>}
      {notice.message && (
        <StatusNotice tone="success">{notice.message}</StatusNotice>
      )}
      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Record promotion decision</h2>
        <p className="mt-2 text-sm text-slate-600">
          Promoted or repeated outcomes require a target session and class.
          Select a target arm only when it belongs to that class. Academic locks
          and published-result requirements are enforced when saving.
        </p>
        <form
          action={recordStudentPromotion}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="idempotencyKey" value={randomUUID()} />
          <label className={label}>
            Student
            <select name="studentId" required className={fieldClass}>
              <option value="">Select student</option>
              {workspace.students.map((row) => (
                <option key={row.id} value={row.id}>
                  {students.get(row.id)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Source period
            <select name="sourcePeriodId" required className={fieldClass}>
              <option value="">Select published-result period</option>
              {workspace.periods.map((row) => (
                <option key={row.id} value={row.id}>
                  {sessions.get(row.session_id)} · {row.name}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Outcome
            <select name="outcome" required className={fieldClass}>
              <option value="promoted">Promoted</option>
              <option value="repeated">Repeated</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
            </select>
          </label>
          <label className={label}>
            Target session
            <select name="targetSessionId" className={fieldClass}>
              <option value="">No target session</option>
              {workspace.sessions
                .filter((row) => row.status !== "closed")
                .map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
            </select>
          </label>
          <label className={label}>
            Target class
            <select name="targetClassLevelId" className={fieldClass}>
              <option value="">No target class</option>
              {workspace.levels.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Target arm
            <select name="targetClassArmId" className={fieldClass}>
              <option value="">No target arm</option>
              {workspace.arms.map((row) => (
                <option key={row.id} value={row.id}>
                  {levels.get(row.class_level_id)} · {row.name}
                </option>
              ))}
            </select>
          </label>
          <label className={`${label} sm:col-span-2`}>
            Decision notes
            <textarea name="notes" maxLength={500} className={fieldClass} />
          </label>
          <Button type="submit">Record promotion</Button>
        </form>
      </section>
      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Promotion history</h2>
        {workspace.history.length ? (
          <ul className="mt-4 grid gap-3">
            {workspace.history.map((row) => (
              <li key={row.id} className="rounded-lg border p-3">
                <p className="font-medium">
                  {students.get(row.student_id) ?? "Historical student"}
                </p>
                <p>
                  {periods.get(row.source_period_id) ?? "Historical period"} ·{" "}
                  {row.outcome}
                </p>
                <p>
                  {row.target_session_id
                    ? (sessions.get(row.target_session_id) ??
                      "Historical session")
                    : "No target session"}{" "}
                  ·{" "}
                  {row.target_class_level_id
                    ? (levels.get(row.target_class_level_id) ??
                      "Historical class")
                    : "No target class"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            No promotion decisions recorded.
          </p>
        )}
      </section>
    </main>
  );
}
