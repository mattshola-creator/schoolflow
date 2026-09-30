import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadTeachingAssignmentWorkspace } from "@/features/academics/teaching-service";
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

  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Teaching management"
        title={`Teaching assignments at ${workspace.active.schoolName}`}
        description="Assign class and subject responsibilities without granting access to unrelated schools or classes."
        actions={
          <>
            <ButtonLink href="/teaching/timetable" variant="secondary">
              Timetable
            </ButtonLink>
            <ButtonLink href="/teaching/curriculum" variant="secondary">
              Curriculum
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
          Current assignments
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
