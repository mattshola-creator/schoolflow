import { fieldClass } from "@/components/auth-card";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  UsersRound,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadLessonWorkspace } from "@/features/academics/lesson-service";
import {
  loadTeachingAssignmentWorkspace,
  loadTimetableWorkspace,
} from "@/features/academics/teaching-service";
import { changeTeachingAssignment, saveTeachingAssignment } from "./actions";

const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";

export default async function TeachingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const notice = await searchParams;
  const workspace = await loadTeachingAssignmentWorkspace().catch(() => null);
  if (!workspace)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Teaching management is not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school workspace. Teaching management must be
          enabled before assignments can be viewed.
        </p>
      </main>
    );
  const canManage = workspace.authorization.permissions.includes(
    "academics.teaching_assignments.manage",
  );
  const sessions = new Map(workspace.sessions.map((item) => [item.id, item]));
  const levels = new Map(workspace.levels.map((item) => [item.id, item.name]));
  const arms = new Map(workspace.arms.map((item) => [item.id, item.name]));
  const subjects = new Map(
    workspace.subjects.map((item) => [item.id, item.name]),
  );
  const staff = new Map(workspace.staff.map((item) => [item.id, item]));
  const classes = new Set(
    workspace.assignments.map(
      (item) => `${item.class_level_id}:${item.class_arm_id ?? "none"}`,
    ),
  );
  const subjectCount = new Set(
    workspace.assignments.flatMap((item) =>
      item.subject_id ? [item.subject_id] : [],
    ),
  ).size;
  const canViewTimetable = workspace.authorization.permissions.includes(
    "academics.timetable.view",
  );
  const canViewCurriculum = workspace.authorization.permissions.includes(
    "academics.curriculum.view",
  );
  const canViewLessons = [
    "academics.lesson_plans.manage",
    "academics.lesson_plans.approve",
    "academics.lesson_delivery.record",
    "academics.homework.manage",
  ].some((permission) =>
    workspace.authorization.permissions.includes(permission),
  );
  const canViewAttendance = workspace.authorization.permissions.includes(
    "attendance.student.record",
  );
  const [timetable, lessonWorkspace] = await Promise.all([
    canViewTimetable
      ? loadTimetableWorkspace().catch(() => null)
      : Promise.resolve(null),
    canViewLessons ||
    workspace.authorization.permissions.includes("academics.homework.manage")
      ? loadLessonWorkspace().catch(() => null)
      : Promise.resolve(null),
  ]);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const weekdayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    weekday: "long",
  }).format(new Date());
  const schoolWeekday =
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].indexOf(weekdayLabel) + 1;
  const todaysPeriods = timetable
    ? timetable.periods
        .filter((period) => period.weekday === schoolWeekday)
        .map((period) => ({
          period,
          entries: timetable.entries.filter(
            (entry) => entry.period_id === period.id,
          ),
        }))
    : [];
  const upcomingPlans =
    lessonWorkspace?.plans
      .filter((item) => item.lesson_date >= today)
      .slice(0, 3) ?? [];
  const upcomingHomework =
    lessonWorkspace?.homework
      .filter((item) => item.due_on >= today && item.status === "published")
      .slice(0, 3) ?? [];

  return (
    <main className="py-7 sm:py-10">
      <PageHeader
        eyebrow={
          canManage
            ? "Teaching workspace · Management view"
            : "Teacher workspace"
        }
        title={
          canManage
            ? `Teaching at ${workspace.active.schoolName}`
            : "My Teaching"
        }
        description={
          canManage
            ? `Review authorized teaching responsibilities at ${workspace.active.schoolName}. Assignment changes remain permission controlled.`
            : `Your assigned classes and subjects for ${workspace.active.schoolName}. School and teacher assignment access remains in effect.`
        }
        actions={
          <>
            {canViewTimetable ? (
              <ButtonLink href="/teaching/timetable" variant="secondary">
                Timetable
              </ButtonLink>
            ) : null}
            {canViewCurriculum ? (
              <ButtonLink href="/teaching/curriculum" variant="secondary">
                Curriculum
              </ButtonLink>
            ) : null}
            {canViewLessons ? (
              <ButtonLink href="/teaching/lessons" variant="secondary">
                Lessons & homework
              </ButtonLink>
            ) : null}
            {canViewAttendance ? (
              <ButtonLink href="/attendance" variant="primary">
                Take attendance
              </ButtonLink>
            ) : null}
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
        className="mt-6 grid gap-3 sm:grid-cols-3"
        aria-label="Teaching overview"
      >
        {[
          { label: "Assigned classes", value: classes.size, Icon: UsersRound },
          {
            label: "Subject responsibilities",
            value: subjectCount,
            Icon: BookOpen,
          },
          {
            label: "Active sessions",
            value: workspace.sessions.length,
            Icon: CalendarDays,
          },
        ].map(({ label, value, Icon }) => (
          <article
            key={label}
            className="min-w-0 rounded-2xl border bg-white p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <Icon aria-hidden="true" className="text-brand size-5 shrink-0" />
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-7" aria-labelledby="teaching-quick-links">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-brand text-sm font-semibold">Your workspaces</p>
            <h2
              id="teaching-quick-links"
              className="mt-1 text-xl font-semibold"
            >
              Continue teaching
            </h2>
          </div>
          {canViewAttendance ? (
            <ButtonLink href="/attendance" variant="secondary">
              <ClipboardCheck aria-hidden="true" className="size-4" />
              Student attendance
            </ButtonLink>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ...(canViewTimetable
              ? [
                  {
                    href: "/teaching/timetable",
                    label: "Timetable",
                    detail: "View assigned periods",
                  },
                ]
              : []),
            ...(canViewCurriculum
              ? [
                  {
                    href: "/teaching/curriculum",
                    label: "Curriculum",
                    detail: "Review coverage plans",
                  },
                ]
              : []),
            ...(canViewLessons
              ? [
                  {
                    href: "/teaching/lessons#plans-heading",
                    label: "Lessons",
                    detail: "Review lesson plans",
                  },
                ]
              : []),
            ...(workspace.authorization.permissions.includes(
              "academics.homework.manage",
            )
              ? [
                  {
                    href: "/teaching/lessons#homework-heading",
                    label: "Homework",
                    detail: "Review assignments and due dates",
                  },
                ]
              : []),
            ...(canViewAttendance
              ? [
                  {
                    href: "/attendance",
                    label: "Student attendance",
                    detail: "Open an authorized register",
                  },
                ]
              : []),
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-24 items-center justify-between gap-3 rounded-2xl border bg-white p-4 transition hover:border-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              <span className="min-w-0">
                <span className="block font-semibold">{item.label}</span>
                <span className="mt-1 block text-sm text-slate-600">
                  {item.detail}
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="text-brand size-4 shrink-0 transition group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </section>

      <section
        className="mt-7 grid gap-4 xl:grid-cols-3"
        aria-label="Upcoming teaching work"
      >
        <article className={panel}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Today&apos;s timetable</h2>
            {canViewTimetable ? (
              <ButtonLink
                className="min-h-10 px-3"
                href="/teaching/timetable?view=daily"
                variant="quiet"
              >
                Open day
              </ButtonLink>
            ) : null}
          </div>
          {!canViewTimetable ? (
            <p className="mt-3 text-sm text-slate-600">
              Timetable access is not available in this role.
            </p>
          ) : !timetable ? (
            <p className="mt-3 text-sm text-slate-600">
              Timetable is unavailable in the current context.
            </p>
          ) : !todaysPeriods.length ? (
            <p className="mt-3 text-sm text-slate-600">
              No periods are scheduled for today.
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {todaysPeriods.slice(0, 4).map(({ period, entries }) => (
                <li className="rounded-xl bg-slate-50 p-3" key={period.id}>
                  <p className="font-semibold">{period.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {period.starts_at.slice(0, 5)}–{period.ends_at.slice(0, 5)}
                  </p>
                  <p className="mt-1 text-sm">
                    {entries.length
                      ? `${entries.length} assigned ${entries.length === 1 ? "class" : "classes"}`
                      : "No class allocation"}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Lesson plans</h2>
            {canViewLessons ? (
              <ButtonLink
                className="min-h-10 px-3"
                href="/teaching/lessons#plans-heading"
                variant="quiet"
              >
                Review
              </ButtonLink>
            ) : null}
          </div>
          {!canViewLessons ? (
            <p className="mt-3 text-sm text-slate-600">
              Lesson-plan access is not available in this role.
            </p>
          ) : !lessonWorkspace ? (
            <p className="mt-3 text-sm text-slate-600">
              Lesson plans are unavailable in the current context.
            </p>
          ) : upcomingPlans.length ? (
            <ul className="mt-3 space-y-2">
              {upcomingPlans.map((plan) => (
                <li className="rounded-xl bg-slate-50 p-3" key={plan.id}>
                  <p className="font-semibold">{plan.topic}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {plan.lesson_date} · {plan.status}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              No upcoming lesson plans.
            </p>
          )}
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Homework</h2>
            {workspace.authorization.permissions.includes(
              "academics.homework.manage",
            ) ? (
              <ButtonLink
                className="min-h-10 px-3"
                href="/teaching/lessons#homework-heading"
                variant="quiet"
              >
                Review
              </ButtonLink>
            ) : null}
          </div>
          {!workspace.authorization.permissions.includes(
            "academics.homework.manage",
          ) ? (
            <p className="mt-3 text-sm text-slate-600">
              Homework management is not available in this role.
            </p>
          ) : !lessonWorkspace ? (
            <p className="mt-3 text-sm text-slate-600">
              Homework is unavailable in the current context.
            </p>
          ) : upcomingHomework.length ? (
            <ul className="mt-3 space-y-2">
              {upcomingHomework.map((item) => (
                <li className="rounded-xl bg-slate-50 p-3" key={item.id}>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Due {item.due_on}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              No published homework due later.
            </p>
          )}
        </article>
      </section>

      {canManage ? (
        <section className={`${panel} mt-7`} aria-labelledby="new-assignment">
          <h2 id="new-assignment" className="text-xl font-semibold">
            Add teaching assignment
          </h2>
          <form
            action={saveTeachingAssignment}
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
              Teacher
              <select className={fieldClass} name="staffAssignmentId" required>
                <option value="">Select teacher</option>
                {workspace.staff.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.staff_profiles.people.first_name}{" "}
                    {item.staff_profiles.people.last_name} ·{" "}
                    {item.staff_profiles.staff_number}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Responsibility
              <select className={fieldClass} name="assignmentType" required>
                <option value="class_teacher">Class teacher</option>
                <option value="subject_teacher">Subject teacher</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Subject <span className="text-slate-500">(subject teacher)</span>
              <select className={fieldClass} name="subjectId">
                <option value="">No subject</option>
                {workspace.subjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Class level
              <select className={fieldClass} name="classLevelId" required>
                <option value="">Select level</option>
                {workspace.levels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Class arm <span className="text-slate-500">(optional)</span>
              <select className={fieldClass} name="classArmId">
                <option value="">All arms / no arm</option>
                {workspace.arms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Starts on
              <input
                className={fieldClass}
                name="startedOn"
                type="date"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Ends on <span className="text-slate-500">(optional)</span>
              <input className={fieldClass} name="endedOn" type="date" />
            </label>
            <Button type="submit" className="sm:col-span-2 sm:w-fit">
              Create assignment
            </Button>
          </form>
        </section>
      ) : null}

      <section className="mt-7" aria-labelledby="assignment-list">
        <h2 id="assignment-list" className="text-xl font-semibold">
          {canManage ? "Teaching assignments" : "Your assignments"}
        </h2>
        {workspace.assignments.length ? (
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {workspace.assignments.map((assignment) => {
              const teacher = staff.get(assignment.staff_assignment_id);
              return (
                <li key={assignment.id} className={panel}>
                  <h3 className="font-semibold break-words">
                    {teacher
                      ? `${teacher.staff_profiles.people.first_name} ${teacher.staff_profiles.people.last_name}`
                      : "Authorized teacher"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 capitalize">
                    {assignment.assignment_type.replace("_", " ")} ·{" "}
                    {levels.get(assignment.class_level_id) ?? "Class"}
                    {assignment.class_arm_id
                      ? ` ${arms.get(assignment.class_arm_id) ?? ""}`
                      : ""}
                  </p>
                  {assignment.subject_id ? (
                    <p className="mt-1 text-sm">
                      {subjects.get(assignment.subject_id) ?? "Subject"}
                    </p>
                  ) : null}
                  <ButtonLink
                    className="mt-4 w-full justify-between sm:w-auto"
                    href={`/teaching/classes/${assignment.id}`}
                    variant="secondary"
                  >
                    Open class workspace{" "}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </ButtonLink>
                  <p className="mt-1 text-sm text-slate-500">
                    {sessions.get(assignment.session_id)?.name ?? "Session"} ·{" "}
                    {assignment.started_on}
                    {assignment.ended_on ? `–${assignment.ended_on}` : ""}
                  </p>
                  {canManage ? (
                    <form
                      action={changeTeachingAssignment}
                      className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                    >
                      <input
                        type="hidden"
                        name="assignmentId"
                        value={assignment.id}
                      />
                      <label className="text-sm font-medium">
                        Status
                        <select className={fieldClass} name="status">
                          <option value="active">Active</option>
                          <option value="ended">Ended</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </label>
                      <label className="text-sm font-medium">
                        End date
                        <input
                          className={fieldClass}
                          name="endedOn"
                          type="date"
                        />
                      </label>
                      <Button type="submit" variant="secondary">
                        Update
                      </Button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={`${panel} mt-4 text-slate-600`}>
            No active teaching assignments have been configured.
          </p>
        )}
      </section>
    </main>
  );
}
