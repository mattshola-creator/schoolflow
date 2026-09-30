import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadCurriculumWorkspace } from "@/features/academics/curriculum-service";
import { changeCurriculumCoverage, saveCurriculumItem } from "./actions";

const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";

export default async function CurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const notice = await searchParams;
  const workspace = await loadCurriculumWorkspace().catch(() => null);
  if (!workspace)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Curriculum coverage is not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school workspace. Teaching management must be
          enabled first.
        </p>
      </main>
    );
  const canManage = workspace.authorization.permissions.includes(
    "academics.curriculum.manage",
  );
  const levels = new Map(workspace.levels.map((item) => [item.id, item.name]));
  const arms = new Map(workspace.arms.map((item) => [item.id, item.name]));
  const subjects = new Map(
    workspace.subjects.map((item) => [item.id, item.name]),
  );
  const staff = new Map(workspace.staff.map((item) => [item.id, item]));
  const assignments = new Map(
    workspace.assignments.map((item) => [item.id, item]),
  );
  const describeAssignment = (id: string) => {
    const item = assignments.get(id);
    if (!item) return "Authorized subject assignment";
    const person = staff.get(item.staff_assignment_id)?.staff_profiles.people;
    const teacher = person
      ? `${person.first_name} ${person.last_name}`
      : "Teacher";
    const className = `${levels.get(item.class_level_id) ?? "Class"}${item.class_arm_id ? ` ${arms.get(item.class_arm_id) ?? ""}` : ""}`;
    return `${subjects.get(item.subject_id!) ?? "Subject"} · ${className} · ${teacher}`;
  };
  const completed = workspace.items.filter(
    (item) => item.status === "completed",
  ).length;
  const active = workspace.items.filter(
    (item) => item.status === "in_progress",
  ).length;
  const completion = workspace.items.length
    ? Math.round((completed / workspace.items.length) * 100)
    : 0;

  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Teaching management"
        title={`Curriculum coverage at ${workspace.active.schoolName}`}
        description="Plan ordered subject coverage and record progress without deleting the historical teaching record."
        actions={
          <>
            <ButtonLink href="/teaching" variant="secondary">
              Assignments
            </ButtonLink>
            <ButtonLink href="/teaching/timetable" variant="secondary">
              Timetable
            </ButtonLink>
            <ButtonLink href="/teaching/lessons" variant="secondary">
              Lessons
            </ButtonLink>
          </>
        }
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
        aria-label="Curriculum coverage summary"
      >
        <div className={panel}>
          <p className="text-sm text-slate-500">Planned items</p>
          <p className="mt-2 text-3xl font-semibold">
            {workspace.items.length}
          </p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">In progress</p>
          <p className="mt-2 text-3xl font-semibold">{active}</p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-semibold">{completion}%</p>
        </div>
      </section>

      {canManage ? (
        <section
          className={`${panel} mt-7`}
          aria-labelledby="new-curriculum-heading"
        >
          <h2 id="new-curriculum-heading" className="text-xl font-semibold">
            Add curriculum item
          </h2>
          <form
            action={saveCurriculumItem}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <label className="text-sm font-medium">
              Academic session
              <select className={fieldClass} name="sessionId" required>
                <option value="">Select session</option>
                {workspace.sessions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Academic period <span className="text-slate-500">(optional)</span>
              <select className={fieldClass} name="academicPeriodId">
                <option value="">Whole session</option>
                {workspace.periods.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Subject teaching assignment
              <select
                className={fieldClass}
                name="teachingAssignmentId"
                required
              >
                <option value="">Select subject, class and teacher</option>
                {workspace.assignments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {describeAssignment(item.id)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Sequence
              <input
                className={fieldClass}
                name="sequence"
                type="number"
                min="1"
                max="999"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Topic or unit title
              <input className={fieldClass} name="title" required />
            </label>
            <label className="text-sm font-medium">
              Planned start
              <input
                className={fieldClass}
                name="plannedStart"
                type="date"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Planned end
              <input
                className={fieldClass}
                name="plannedEnd"
                type="date"
                required
              />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Learning objectives{" "}
              <span className="text-slate-500">(optional)</span>
              <textarea
                className={`${fieldClass} min-h-28`}
                name="learningObjectives"
              />
            </label>
            <Button type="submit" className="sm:col-span-2 sm:w-fit">
              Create curriculum item
            </Button>
          </form>
        </section>
      ) : null}

      <section className="mt-7" aria-labelledby="coverage-heading">
        <h2 id="coverage-heading" className="text-xl font-semibold">
          Coverage plan
        </h2>
        {workspace.items.length ? (
          <ol className="mt-4 grid gap-4 lg:grid-cols-2">
            {workspace.items.map((item) => (
              <li className={panel} key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-brand text-xs font-semibold">
                      ITEM {item.sequence}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold break-words">
                      {item.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {describeAssignment(item.teaching_assignment_id)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.planned_start}–{item.planned_end}
                </p>
                {item.learning_objectives ? (
                  <p className="mt-3 text-sm leading-6">
                    {item.learning_objectives}
                  </p>
                ) : null}
                {canManage ? (
                  <form
                    action={changeCurriculumCoverage}
                    className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                  >
                    <input
                      type="hidden"
                      name="curriculumItemId"
                      value={item.id}
                    />
                    <label className="text-sm font-medium">
                      Coverage status
                      <select
                        className={fieldClass}
                        name="status"
                        defaultValue={item.status}
                      >
                        <option value="planned">Planned</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                        <option value="deferred">Deferred</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </label>
                    <label className="text-sm font-medium">
                      Completed on
                      <input
                        className={fieldClass}
                        name="completedOn"
                        type="date"
                        defaultValue={item.completed_on ?? ""}
                      />
                    </label>
                    <Button type="submit" variant="secondary">
                      Update
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className={`${panel} mt-4 text-slate-600`}>
            No curriculum items have been planned.
          </p>
        )}
      </section>
    </main>
  );
}
