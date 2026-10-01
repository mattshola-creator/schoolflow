import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadAssessmentWorkspace } from "@/features/assessments/service";
import {
  activateAssessmentScheme,
  advanceResultBatch,
  saveComponent,
  saveGradeBand,
  saveResultBatch,
  saveScheme,
} from "./actions";

const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";
const label = "grid gap-1.5 text-sm font-medium text-slate-700";

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const notice = await searchParams;
  const workspace = await loadAssessmentWorkspace().catch(() => null);
  if (!workspace)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Assessment is not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school and enable Assessment score entry.
        </p>
      </main>
    );
  const canConfigure = workspace.authorization.permissions.includes(
    "academics.assessments.configure",
  );
  const canEnter = workspace.authorization.permissions.includes(
    "academics.scores.enter",
  );
  const names = (items: { id: string; name: string }[]) =>
    new Map(items.map((item) => [item.id, item.name]));
  const sessionNames = names(workspace.sessions),
    periodNames = names(workspace.periods),
    levelNames = names(workspace.levels),
    subjectNames = names(workspace.subjects);
  const nextStatus = {
    draft: "submitted",
    reopened: "submitted",
    submitted: "reviewed",
    reviewed: "approved",
    approved: "published",
  } as const;
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Assessment & Results"
        title={`Academic results at ${workspace.active.schoolName}`}
        description="Configure school-specific assessment rules, manage score sheets, and publish immutable result snapshots."
      />
      {notice.error || notice.message ? (
        <p
          role={notice.error ? "alert" : "status"}
          className={`mt-5 rounded-lg p-3 text-sm font-medium ${notice.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}
        >
          {notice.error ?? notice.message}
        </p>
      ) : null}
      <section
        className="mt-7 grid gap-4 sm:grid-cols-3"
        aria-label="Assessment summary"
      >
        <div className={panel}>
          <p className="text-sm text-slate-500">Schemes</p>
          <p className="mt-2 text-3xl font-semibold">
            {workspace.schemes.length}
          </p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">Active schemes</p>
          <p className="mt-2 text-3xl font-semibold">
            {workspace.schemes.filter((s) => s.status === "active").length}
          </p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">Score sheets</p>
          <p className="mt-2 text-3xl font-semibold">
            {workspace.batches.length}
          </p>
        </div>
      </section>
      {canConfigure ? (
        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <form action={saveScheme} className={panel}>
            <h2 className="text-lg font-semibold">New assessment scheme</h2>
            <div className="mt-4 grid gap-4">
              <label className={label}>
                Name
                <input className={fieldClass} name="name" required />
              </label>
              <label className={label}>
                Session
                <select className={fieldClass} name="sessionId" required>
                  <option value="">Select</option>
                  {workspace.sessions.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                Period
                <select className={fieldClass} name="periodId" required>
                  <option value="">Select</option>
                  {workspace.periods.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                Class level
                <select className={fieldClass} name="classLevelId" required>
                  <option value="">Select</option>
                  {workspace.levels.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                Subject override
                <select className={fieldClass} name="subjectId">
                  <option value="">All applicable subjects</option>
                  {workspace.subjects.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={label}>
                  Total mark
                  <input
                    className={fieldClass}
                    name="totalMark"
                    type="number"
                    defaultValue="100"
                  />
                </label>
                <label className={label}>
                  Pass mark
                  <input
                    className={fieldClass}
                    name="passMark"
                    type="number"
                    defaultValue="50"
                  />
                </label>
              </div>
              <Button type="submit">Create scheme</Button>
            </div>
          </form>
          <form action={saveComponent} className={panel}>
            <h2 className="text-lg font-semibold">Add component</h2>
            <div className="mt-4 grid gap-4">
              <label className={label}>
                Draft scheme
                <select className={fieldClass} name="schemeId" required>
                  <option value="">Select</option>
                  {workspace.schemes
                    .filter((s) => s.status === "draft")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} v{s.version}
                      </option>
                    ))}
                </select>
              </label>
              <label className={label}>
                Code
                <input
                  className={fieldClass}
                  name="code"
                  placeholder="CA1"
                  required
                />
              </label>
              <label className={label}>
                Name
                <input className={fieldClass} name="name" required />
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className={label}>
                  Max
                  <input
                    className={fieldClass}
                    name="maximumScore"
                    type="number"
                    step="0.01"
                    required
                  />
                </label>
                <label className={label}>
                  Weight %
                  <input
                    className={fieldClass}
                    name="weightPercent"
                    type="number"
                    step="0.01"
                    required
                  />
                </label>
                <label className={label}>
                  Order
                  <input
                    className={fieldClass}
                    name="sequence"
                    type="number"
                    defaultValue="1"
                    required
                  />
                </label>
              </div>
              <Button type="submit">Add component</Button>
            </div>
          </form>
          <form action={saveGradeBand} className={panel}>
            <h2 className="text-lg font-semibold">Add grade band</h2>
            <div className="mt-4 grid gap-4">
              <label className={label}>
                Draft scheme
                <select className={fieldClass} name="schemeId" required>
                  <option value="">Select</option>
                  {workspace.schemes
                    .filter((s) => s.status === "draft")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} v{s.version}
                      </option>
                    ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={label}>
                  Minimum %
                  <input
                    className={fieldClass}
                    name="minimumPercent"
                    type="number"
                    step="0.01"
                    required
                  />
                </label>
                <label className={label}>
                  Maximum %
                  <input
                    className={fieldClass}
                    name="maximumPercent"
                    type="number"
                    step="0.01"
                    required
                  />
                </label>
              </div>
              <label className={label}>
                Grade
                <input className={fieldClass} name="grade" required />
              </label>
              <label className={label}>
                Remark
                <input className={fieldClass} name="remark" required />
              </label>
              <label className={label}>
                Order
                <input
                  className={fieldClass}
                  name="sequence"
                  type="number"
                  defaultValue="1"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="isPass" type="checkbox" value="true" /> Passing
                grade
              </label>
              <Button type="submit">Add grade band</Button>
            </div>
          </form>
        </section>
      ) : null}
      <section className={`${panel} mt-6`}>
        <h2 className="text-lg font-semibold">Assessment schemes</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {workspace.schemes.length ? (
            workspace.schemes.map((s) => (
              <article key={s.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {s.name} · v{s.version}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {levelNames.get(s.class_level_id)} ·{" "}
                      {periodNames.get(s.period_id)} ·{" "}
                      {s.subject_id
                        ? subjectNames.get(s.subject_id)
                        : "All subjects"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {s.assessment_components.length} components ·{" "}
                      {s.grade_bands.length} grade bands · pass {s.pass_mark}/
                      {s.total_mark}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">
                    {s.status}
                  </span>
                </div>
                {canConfigure && s.status === "draft" ? (
                  <form action={activateAssessmentScheme} className="mt-3">
                    <input type="hidden" name="schemeId" value={s.id} />
                    <Button type="submit" variant="secondary">
                      Validate & activate
                    </Button>
                  </form>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-600">No assessment schemes yet.</p>
          )}
        </div>
      </section>
      {canEnter ? (
        <form action={saveResultBatch} className={`${panel} mt-6`}>
          <h2 className="text-lg font-semibold">Create score sheet</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <label className={label}>
              Session
              <select className={fieldClass} name="sessionId" required>
                <option value="">Select</option>
                {workspace.sessions.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Period
              <select className={fieldClass} name="periodId" required>
                <option value="">Select</option>
                {workspace.periods.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Level
              <select className={fieldClass} name="classLevelId" required>
                <option value="">Select</option>
                {workspace.levels.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Arm
              <select className={fieldClass} name="classArmId">
                <option value="">Whole level</option>
                {workspace.arms.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Subject
              <select className={fieldClass} name="subjectId" required>
                <option value="">Select</option>
                {workspace.subjects.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Scheme
              <select className={fieldClass} name="schemeId" required>
                <option value="">Select</option>
                {workspace.schemes
                  .filter((s) => s.status === "active")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div className="mt-4">
            <Button type="submit">Create score sheet</Button>
          </div>
        </form>
      ) : null}
      <section className={`${panel} mt-6`}>
        <h2 className="text-lg font-semibold">Result workflow</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="p-3">Context</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Version</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {workspace.batches.map((b) => {
                const next = nextStatus[b.status as keyof typeof nextStatus];
                return (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="p-3">
                      {sessionNames.get(b.session_id)} ·{" "}
                      {periodNames.get(b.period_id)} ·{" "}
                      {levelNames.get(b.class_level_id)}
                    </td>
                    <td className="p-3">{subjectNames.get(b.subject_id)}</td>
                    <td className="p-3">v{b.version}</td>
                    <td className="p-3 capitalize">{b.status}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <ButtonLink
                          href={`/assessments/${b.id}`}
                          variant="secondary"
                        >
                          Open
                        </ButtonLink>
                        {b.status === "published" ? (
                          <ButtonLink
                            href={`/assessments/report-cards/${b.id}`}
                            variant="secondary"
                          >
                            Report
                          </ButtonLink>
                        ) : null}
                        {next ? (
                          <form action={advanceResultBatch}>
                            <input type="hidden" name="batchId" value={b.id} />
                            <input type="hidden" name="status" value={next} />
                            <Button type="submit" variant="secondary">
                              {next}
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!workspace.batches.length ? (
          <p className="mt-4 text-sm text-slate-600">No score sheets yet.</p>
        ) : null}
      </section>
    </main>
  );
}
