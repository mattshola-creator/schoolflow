import { Button, ButtonLink } from "@/components/ui/button";
import { fieldClass } from "@/components/auth-card";
import { PageHeader } from "@/components/ui/page-header";
import { loadTimetableWorkspace } from "@/features/academics/teaching-service";
import { saveTimetableEntry, saveTimetablePeriod } from "./actions";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; warning?: string }>;
}) {
  const notice = await searchParams;
  const workspace = await loadTimetableWorkspace().catch(() => null);
  if (!workspace)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Timetable is not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school workspace. Teaching management must be
          enabled first.
        </p>
      </main>
    );
  const canManage = workspace.authorization.permissions.includes(
    "academics.timetable.manage",
  );
  const assignments = new Map(
    workspace.assignments.map((item) => [item.id, item]),
  );
  const levels = new Map(workspace.levels.map((item) => [item.id, item.name]));
  const arms = new Map(workspace.arms.map((item) => [item.id, item.name]));
  const subjects = new Map(
    workspace.subjects.map((item) => [item.id, item.name]),
  );
  const staff = new Map(workspace.staff.map((item) => [item.id, item]));
  const describeAssignment = (id: string) => {
    const item = assignments.get(id);
    if (!item) return "Authorized teaching assignment";
    const teacher = staff.get(item.staff_assignment_id);
    const person = teacher?.staff_profiles.people;
    const teacherName = person
      ? `${person.first_name} ${person.last_name}`
      : "Teacher";
    const className = `${levels.get(item.class_level_id) ?? "Class"}${item.class_arm_id ? ` ${arms.get(item.class_arm_id) ?? ""}` : ""}`;
    const subject = item.subject_id ? subjects.get(item.subject_id) : null;
    return `${teacherName} · ${className}${subject ? ` · ${subject}` : " · Class teacher"}`;
  };

  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Teaching management"
        title={`Manual timetable at ${workspace.active.schoolName}`}
        description="Build the weekly timetable from approved teaching assignments. Potential teacher and class clashes require an explicit review."
        actions={
          <>
            <ButtonLink href="/teaching" variant="secondary">
              Assignments
            </ButtonLink>
            <ButtonLink href="/teaching/curriculum" variant="secondary">
              Curriculum
            </ButtonLink>
          </>
        }
      />
      {notice.error || notice.message || notice.warning ? (
        <p
          role={notice.error ? "alert" : "status"}
          className={`mt-5 rounded-lg p-3 text-sm font-medium ${notice.error ? "bg-red-50 text-red-800" : notice.warning ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"}`}
        >
          {notice.error ?? notice.warning ?? notice.message}
        </p>
      ) : null}

      {canManage ? (
        <div className="mt-7 grid gap-5 xl:grid-cols-2">
          <section className={panel} aria-labelledby="period-heading">
            <h2 id="period-heading" className="text-xl font-semibold">
              Add a period
            </h2>
            <form
              action={saveTimetablePeriod}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <label className="text-sm font-medium sm:col-span-2">
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
                Weekday
                <select className={fieldClass} name="weekday" required>
                  {days.slice(0, 5).map((day, index) => (
                    <option key={day} value={index + 1}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Period name
                <input
                  className={fieldClass}
                  name="name"
                  placeholder="Period 1"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Starts at
                <input
                  className={fieldClass}
                  name="startsAt"
                  type="time"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Ends at
                <input
                  className={fieldClass}
                  name="endsAt"
                  type="time"
                  required
                />
              </label>
              <Button type="submit" className="sm:col-span-2 sm:w-fit">
                Create period
              </Button>
            </form>
          </section>

          <section className={panel} aria-labelledby="allocation-heading">
            <h2 id="allocation-heading" className="text-xl font-semibold">
              Allocate a lesson
            </h2>
            <form action={saveTimetableEntry} className="mt-5 grid gap-4">
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
                Timetable period
                <select className={fieldClass} name="periodId" required>
                  <option value="">Select period</option>
                  {workspace.periods.map((item) => (
                    <option key={item.id} value={item.id}>
                      {days[item.weekday - 1]} · {item.name} ·{" "}
                      {item.starts_at.slice(0, 5)}–{item.ends_at.slice(0, 5)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Teaching assignment
                <select
                  className={fieldClass}
                  name="teachingAssignmentId"
                  required
                >
                  <option value="">Select teacher and class</option>
                  {workspace.assignments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {describeAssignment(item.id)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Notes <span className="text-slate-500">(optional)</span>
                <input className={fieldClass} name="notes" />
              </label>
              <label className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
                <input
                  className="mt-1 size-4"
                  name="acknowledgeConflict"
                  type="checkbox"
                />
                <span>
                  <strong>Conflict acknowledgement.</strong> Select only after
                  reviewing a teacher or class clash warning.
                </span>
              </label>
              <Button type="submit" className="sm:w-fit">
                Check and allocate
              </Button>
            </form>
          </section>
        </div>
      ) : null}

      <section className="mt-7" aria-labelledby="weekly-heading">
        <h2 id="weekly-heading" className="text-xl font-semibold">
          Weekly timetable
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {days.slice(0, 5).map((day, dayIndex) => {
            const dayPeriods = workspace.periods.filter(
              (period) => period.weekday === dayIndex + 1,
            );
            return (
              <article className={panel} key={day}>
                <h3 className="text-brand font-semibold">{day}</h3>
                {dayPeriods.length ? (
                  <ul className="mt-3 space-y-3">
                    {dayPeriods.map((period) => {
                      const matches = workspace.entries.filter(
                        (entry) => entry.period_id === period.id,
                      );
                      return (
                        <li
                          className="rounded-lg bg-slate-50 p-3"
                          key={period.id}
                        >
                          <p className="text-sm font-semibold">{period.name}</p>
                          <p className="text-xs text-slate-500">
                            {period.starts_at.slice(0, 5)}–
                            {period.ends_at.slice(0, 5)}
                          </p>
                          {matches.length ? (
                            matches.map((entry) => (
                              <p className="mt-2 text-sm" key={entry.id}>
                                {describeAssignment(
                                  entry.teaching_assignment_id,
                                )}
                                {entry.conflict_acknowledged ? (
                                  <span className="mt-1 block text-xs font-semibold text-amber-800">
                                    Conflict reviewed
                                  </span>
                                ) : null}
                              </p>
                            ))
                          ) : (
                            <p className="mt-2 text-sm text-slate-500">
                              Unallocated
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No periods configured.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
