import Link from "next/link";
import { ArrowLeft, BookOpen, ClipboardCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { attendanceScopeKey } from "@/features/attendance/schemas";
import {
  loadStudentAttendanceRoster,
  loadStudentAttendanceWorkspace,
} from "@/features/attendance/service";
import { loadLessonWorkspace } from "@/features/academics/lesson-service";
import { loadTeachingAssignmentWorkspace } from "@/features/academics/teaching-service";

function schoolDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const panel = "min-w-0 rounded-2xl border bg-white p-5 sm:p-6";

export default async function TeachingClassPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const workspace = await loadTeachingAssignmentWorkspace().catch(() => null);
  const assignment = workspace?.assignments.find(
    (item) => item.id === assignmentId,
  );

  if (!workspace || !assignment) {
    return (
      <main className="py-12">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Class workspace unavailable
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          This teaching assignment is unavailable in the active school context.
        </p>
        <ButtonLink className="mt-5" href="/teaching" variant="secondary">
          <ArrowLeft aria-hidden="true" className="size-4" /> My Teaching
        </ButtonLink>
      </main>
    );
  }

  const level = workspace.levels.find(
    (item) => item.id === assignment.class_level_id,
  )?.name;
  const arm = assignment.class_arm_id
    ? workspace.arms.find((item) => item.id === assignment.class_arm_id)?.name
    : null;
  const subject = assignment.subject_id
    ? workspace.subjects.find((item) => item.id === assignment.subject_id)?.name
    : null;
  const teacher = workspace.staff.find(
    (item) => item.id === assignment.staff_assignment_id,
  )?.staff_profiles.people;
  const session = workspace.sessions.find(
    (item) => item.id === assignment.session_id,
  );
  const permissions = workspace.authorization.permissions;
  const canViewLessons = [
    "academics.lesson_plans.manage",
    "academics.lesson_plans.approve",
    "academics.lesson_delivery.record",
    "academics.homework.manage",
  ].some((permission) => permissions.includes(permission));
  const [attendance, lessons] = await Promise.all([
    permissions.includes("attendance.student.record")
      ? loadStudentAttendanceWorkspace(schoolDate()).catch(() => null)
      : Promise.resolve(null),
    canViewLessons
      ? loadLessonWorkspace().catch(() => null)
      : Promise.resolve(null),
  ]);
  const attendanceScope = attendance?.scopes.find(
    (scope) =>
      scope.session_id === assignment.session_id &&
      scope.class_level_id === assignment.class_level_id &&
      scope.class_arm_id === assignment.class_arm_id,
  );
  const rosterResult = attendanceScope
    ? await loadStudentAttendanceRoster({
        sessionId: attendanceScope.session_id,
        classLevelId: attendanceScope.class_level_id,
        classArmId: attendanceScope.class_arm_id ?? undefined,
        attendanceDate: schoolDate(),
        registerType: "morning",
      }).catch(() => null)
    : null;
  const plans =
    lessons?.plans.filter(
      (item) => item.teaching_assignment_id === assignment.id,
    ) ?? [];
  const homework =
    lessons?.homework.filter(
      (item) => item.teaching_assignment_id === assignment.id,
    ) ?? [];
  const attendanceHref = attendanceScope
    ? `/attendance?date=${schoolDate()}&scope=${encodeURIComponent(attendanceScopeKey(attendanceScope))}`
    : null;

  return (
    <main className="py-7 sm:py-10">
      <Link
        href="/teaching"
        className="text-brand inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> My Teaching
      </Link>
      <div className="mt-3">
        <PageHeader
          eyebrow={`Class workspace · ${session?.name ?? "Academic session"}`}
          title={`${level ?? "Class"}${arm ? ` · ${arm}` : ""}`}
          description={`${subject ?? "Class teaching"} · ${workspace.active.schoolName}. Only assignments visible in your authorized school workspace are shown.`}
          actions={
            attendanceHref ? (
              <ButtonLink href={attendanceHref}>
                <ClipboardCheck aria-hidden="true" className="size-4" />
                Open attendance
              </ButtonLink>
            ) : undefined
          }
        />
      </div>

      <section
        className="mt-6 grid gap-3 sm:grid-cols-3"
        aria-label="Assignment details"
      >
        <article className={panel}>
          <p className="text-sm text-slate-600">Responsibility</p>
          <p className="mt-2 font-semibold capitalize">
            {assignment.assignment_type.replaceAll("_", " ")}
          </p>
        </article>
        <article className={panel}>
          <p className="text-sm text-slate-600">Teacher</p>
          <p className="mt-2 font-semibold">
            {teacher
              ? `${teacher.first_name} ${teacher.last_name}`
              : "Authorized teacher"}
          </p>
        </article>
        <article className={panel}>
          <p className="text-sm text-slate-600">Assignment status</p>
          <p className="mt-2 font-semibold capitalize">{assignment.status}</p>
          <p className="mt-1 text-sm text-slate-600">
            {assignment.started_on}
            {assignment.ended_on ? ` – ${assignment.ended_on}` : ""}
          </p>
        </article>
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className={panel} aria-labelledby="roster-heading">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-brand text-sm font-semibold">
                Authorized roster
              </p>
              <h2 id="roster-heading" className="mt-1 text-xl font-semibold">
                Students
              </h2>
            </div>
            {attendanceScope ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                {attendanceScope.student_count} enrolled
              </span>
            ) : null}
          </div>
          {!attendance ? (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              Student roster is unavailable in this workspace or attendance
              access is not enabled.
            </p>
          ) : !attendanceScope ? (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              No attendance roster is available for this assignment and date.
            </p>
          ) : !rosterResult ? (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
            >
              The authorized roster could not be loaded. Try again from Student
              attendance.
            </p>
          ) : rosterResult.roster.length ? (
            <ul
              className="mt-4 divide-y divide-slate-200"
              aria-label="Class student roster"
            >
              {rosterResult.roster.map((student) => (
                <li
                  className="flex min-h-16 flex-wrap items-center justify-between gap-2 py-3"
                  key={student.student_id}
                >
                  <span className="font-medium">
                    {student.first_name} {student.last_name}
                  </span>
                  <span className="text-sm text-slate-600">
                    {student.student_number}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              No students are available for this register.
            </p>
          )}
        </section>

        <section className={panel} aria-labelledby="activities-heading">
          <div className="flex items-center gap-2">
            <BookOpen aria-hidden="true" className="text-brand size-5" />
            <h2 id="activities-heading" className="text-xl font-semibold">
              Teaching activities
            </h2>
          </div>
          {!canViewLessons ? (
            <p className="mt-4 text-sm text-slate-600">
              Lesson and homework activity is not available to this role in the
              current context.
            </p>
          ) : !lessons ? (
            <p role="alert" className="mt-4 text-sm text-slate-600">
              Teaching activities could not be loaded.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold">Lesson plans</h3>
                {plans.length ? (
                  <ul className="mt-2 space-y-2">
                    {plans.slice(0, 4).map((item) => (
                      <li className="rounded-xl bg-slate-50 p-3" key={item.id}>
                        <p className="font-medium">{item.topic}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.lesson_date} · {item.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    No lesson plans recorded.
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-semibold">Homework</h3>
                {homework.length ? (
                  <ul className="mt-2 space-y-2">
                    {homework.slice(0, 4).map((item) => (
                      <li className="rounded-xl bg-slate-50 p-3" key={item.id}>
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Due {item.due_on} · {item.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    No homework assignments recorded.
                  </p>
                )}
              </div>
            </div>
          )}
          {canViewLessons ? (
            <ButtonLink
              className="mt-5 w-full sm:w-auto"
              href="/teaching/lessons"
              variant="secondary"
            >
              Open lessons & homework
            </ButtonLink>
          ) : null}
        </section>
      </div>

      <nav
        className="mt-6 flex flex-wrap gap-3"
        aria-label="Class teaching navigation"
      >
        <ButtonLink href="/teaching/timetable" variant="secondary">
          Timetable
        </ButtonLink>
        <ButtonLink href="/teaching/curriculum" variant="secondary">
          Curriculum
        </ButtonLink>
        {attendanceHref ? (
          <ButtonLink href={attendanceHref} variant="secondary">
            Student attendance
          </ButtonLink>
        ) : null}
      </nav>
    </main>
  );
}
