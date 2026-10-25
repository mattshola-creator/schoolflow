import Link from "next/link";
import { attendanceScopeKey } from "@/features/attendance/schemas";
import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { ExecutiveHeader } from "@/components/operational/premium";
import { StatePanel } from "@/components/ui/state-panel";
import { loadOwnTeachingWorkspace } from "@/features/academics/own-teaching-service";
import { unavailableOnAuthorizationDenial } from "@/features/academics/workspace-errors";
import { saveOwnTeaching } from "./actions";
import "@/features/teacher-workspace/academic.css";

type Workspace = Awaited<ReturnType<typeof loadOwnTeachingWorkspace>>;
type Plan = Workspace["plans"][number];
const panel = "sf-academic-panel min-w-0 rounded-2xl border p-4 sm:p-6";
function PlanFields({ plan }: { plan?: Plan }) {
  return (
    <>
      <label className="text-sm font-medium">
        Lesson date
        <input
          className={fieldClass}
          type="date"
          name="lessonDate"
          defaultValue={plan?.lesson_date}
          required
        />
      </label>
      <label className="text-sm font-medium">
        Topic
        <input
          className={fieldClass}
          name="topic"
          defaultValue={plan?.topic}
          maxLength={160}
          required
        />
      </label>
      <label className="text-sm font-medium">
        Objectives
        <textarea
          className={fieldClass}
          name="objectives"
          defaultValue={plan?.objectives}
          maxLength={3000}
          required
        />
      </label>
      <label className="text-sm font-medium">
        Content outline
        <textarea
          className={fieldClass}
          name="contentOutline"
          defaultValue={plan?.content_outline}
          maxLength={6000}
          required
        />
      </label>
      <label className="text-sm font-medium">
        Resources (optional)
        <textarea
          className={fieldClass}
          name="teachingResources"
          defaultValue={plan?.teaching_resources ?? ""}
          maxLength={2000}
        />
      </label>
    </>
  );
}
function Scope({ plan }: { plan: Plan }) {
  return (
    <>
      <input type="hidden" name="sessionId" value={plan.session_id} />
      <input
        type="hidden"
        name="academicPeriodId"
        value={plan.academic_period_id ?? ""}
      />
      <input
        type="hidden"
        name="teachingAssignmentId"
        value={plan.teaching_assignment_id}
      />
    </>
  );
}
export default async function OwnTeachingPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; error?: string; message?: string }>;
}) {
  const notice = await searchParams;
  const w = await loadOwnTeachingWorkspace().catch(
    unavailableOnAuthorizationDenial,
  );
  if (!w)
    return (
      <StatePanel
        kind="unauthorized"
        title="Your teaching workspace is unavailable"
        description="Select an authorized school. An active own-assignment capability and Teaching entitlement are required."
      />
    );
  const session =
    w.sessions.find((s) => s.id === notice.session) ??
    w.sessions.find((s) => s.status === "current") ??
    w.sessions[0];
  const assignments = w.assignments.filter((a) => a.session_id === session?.id);
  const label = (id: string) => {
    const a = w.assignments.find((x) => x.id === id);
    if (!a) return "Assignment unavailable";
    return `${w.subjects.find((s) => s.id === a.subject_id)?.name ?? "Subject label unavailable"} · ${w.levels.find((l) => l.id === a.class_level_id)?.name ?? "Class label unavailable"} ${w.arms.find((r) => r.id === a.class_arm_id)?.name ?? ""}`;
  };
  const periods = new Map(w.periods.map((p) => [p.id, p]));
  const day = [
    "",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return (
    <main className="sf-academic-workspace min-w-0 space-y-6 py-5">
      <ExecutiveHeader
        eyebrow="Teacher · own assignments"
        title="My timetable & lessons"
        context={w.schoolName ?? "Selected school"}
      >
        <ButtonLink href="/workspace/teacher" variant="secondary">
          Teacher dashboard
        </ButtonLink>
        {w.canRecordAttendance ? (
          <ButtonLink href="/attendance" variant="secondary">
            Class attendance
          </ButtonLink>
        ) : null}
      </ExecutiveHeader>
      {notice.error || notice.message ? (
        <p className={panel} role={notice.error ? "alert" : "status"}>
          {notice.error ?? notice.message}
        </p>
      ) : null}
      <form className={`${panel} flex flex-wrap items-end gap-3`} method="get">
        <label className="min-w-0 flex-1 text-sm font-medium">
          Academic session
          <select
            className={fieldClass}
            name="session"
            defaultValue={session?.id}
          >
            {w.sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit">Apply session</Button>
      </form>
      <section className={panel} aria-labelledby="own-timetable">
        <h2 id="own-timetable" className="text-xl font-semibold">
          Assigned timetable
        </h2>
        <p className="mt-2 text-sm">
          Read-only timetable for your authorized assignments. School-wide
          allocations cannot be edited here.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {w.entries
            .filter((e) =>
              assignments.some((a) => a.id === e.teaching_assignment_id),
            )
            .map((e) => {
              const p = periods.get(e.period_id);
              return (
                <li className="min-w-0 rounded-xl border p-4" key={e.id}>
                  <h3 className="font-semibold break-words">
                    {label(e.teaching_assignment_id)}
                  </h3>
                  <p>
                    {p
                      ? `${day[p.weekday]} · ${p.name} · ${p.starts_at.slice(0, 5)}–${p.ends_at.slice(0, 5)}`
                      : "Period details unavailable"}
                  </p>
                  <Link
                    className="inline-flex min-h-11 items-center underline"
                    href={`#assignment-${e.teaching_assignment_id}`}
                  >
                    Open lesson planning
                  </Link>
                </li>
              );
            })}
        </ul>
        {!w.entries.some((e) =>
          assignments.some((a) => a.id === e.teaching_assignment_id),
        ) ? (
          <p className="mt-3">
            No timetable entries for this authorized session.
          </p>
        ) : null}
      </section>
      <section
        aria-label="Assigned lesson planning"
        className="grid min-w-0 gap-4 lg:grid-cols-2"
      >
        {assignments.map((a) => (
          <article className={panel} id={`assignment-${a.id}`} key={a.id}>
            <h2 className="text-lg font-semibold break-words">{label(a.id)}</h2>
            <p className="mt-2 text-sm">
              {w.teacherName ?? "Your assigned teaching"} · {session?.name}
            </p>
            {w.canRecordAttendance ? (
              <Link
                className="inline-flex min-h-11 items-center underline"
                href={`/attendance?scope=${encodeURIComponent(attendanceScopeKey(a))}`}
              >
                Open assigned class attendance
              </Link>
            ) : null}
            <form action={saveOwnTeaching} className="mt-4 grid gap-4">
              <input type="hidden" name="operation" value="create" />
              <input type="hidden" name="sessionId" value={a.session_id} />
              <input type="hidden" name="teachingAssignmentId" value={a.id} />
              <label className="text-sm font-medium">
                Academic term
                <select className={fieldClass} name="academicPeriodId" required>
                  <option value="">Select assigned term</option>
                  {w.periodsMetadata
                    .filter(
                      (p) =>
                        p.session_id === a.session_id &&
                        (p.status === "current" || p.status === "planned"),
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <PlanFields />
              <Button type="submit">Save draft plan</Button>
            </form>
          </article>
        ))}
      </section>
      {!assignments.length ? (
        <StatePanel
          kind="empty"
          title="No active assignments"
          description="No effective subject assignments are available for the selected session. Ask an authorized administrator to check your assignment."
        />
      ) : null}
      <section aria-labelledby="own-plans">
        <h2 id="own-plans" className="text-xl font-semibold">
          My lesson plans
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {w.plans
            .filter((p) => p.session_id === session?.id)
            .map((p) => (
              <article className={panel} key={p.id}>
                <h3 className="text-lg font-semibold break-words">{p.topic}</h3>
                <p className="mt-2 text-sm">
                  {label(p.teaching_assignment_id)} · {p.lesson_date} ·{" "}
                  {p.status}
                </p>
                <p className="mt-2 whitespace-pre-wrap">{p.objectives}</p>
                {p.status === "draft" ? (
                  <>
                    <details className="mt-4">
                      <summary className="min-h-11 cursor-pointer font-semibold">
                        Edit draft
                      </summary>
                      <form
                        action={saveOwnTeaching}
                        className="mt-3 grid gap-4"
                      >
                        <input type="hidden" name="operation" value="edit" />
                        <input type="hidden" name="id" value={p.id} />
                        <Scope plan={p} />
                        <PlanFields plan={p} />
                        <Button type="submit">Save changes</Button>
                      </form>
                    </details>
                    <form action={saveOwnTeaching} className="mt-3">
                      <input type="hidden" name="operation" value="submit" />
                      <input type="hidden" name="id" value={p.id} />
                      <Button type="submit">Submit lesson plan</Button>
                    </form>
                  </>
                ) : (
                  <p className="mt-3 text-sm">
                    This plan is read-only. Review and approval remain separate
                    authorized actions.
                  </p>
                )}
                {p.academic_period_id ? (
                  <details className="mt-4">
                    <summary className="min-h-11 cursor-pointer font-semibold">
                      Record linked delivery
                    </summary>
                    <form action={saveOwnTeaching} className="mt-3 grid gap-4">
                      <input type="hidden" name="operation" value="deliver" />
                      <input type="hidden" name="lessonPlanId" value={p.id} />
                      <input type="hidden" name="topic" value={p.topic} />
                      <Scope plan={p} />
                      <label>
                        Delivered on
                        <input
                          className={fieldClass}
                          name="deliveredOn"
                          type="date"
                          required
                        />
                      </label>
                      <label>
                        Delivery status
                        <select className={fieldClass} name="status">
                          <option value="delivered">Delivered</option>
                          <option value="partially_delivered">
                            Partially delivered
                          </option>
                        </select>
                      </label>
                      <label>
                        Coverage notes
                        <textarea
                          className={fieldClass}
                          name="coverageNotes"
                          maxLength={4000}
                          required
                        />
                      </label>
                      <Button type="submit">Record delivery</Button>
                    </form>
                  </details>
                ) : null}
              </article>
            ))}
        </div>
        {!w.plans.some((p) => p.session_id === session?.id) ? (
          <p className={`${panel} mt-3`}>No lesson plans in this session.</p>
        ) : null}
      </section>
      <section className={panel} aria-labelledby="own-deliveries">
        <h2 id="own-deliveries" className="text-xl font-semibold">
          Delivery history
        </h2>
        <ul className="mt-3 space-y-3">
          {w.deliveries
            .filter((d) =>
              assignments.some((a) => a.id === d.teaching_assignment_id),
            )
            .map((d) => (
              <li className="rounded-xl border p-3" key={d.id}>
                <h3 className="font-semibold break-words">{d.topic}</h3>
                <p>
                  {label(d.teaching_assignment_id)} · {d.delivered_on} ·{" "}
                  {d.status.replaceAll("_", " ")}
                </p>
              </li>
            ))}
        </ul>
        {!w.deliveries.some((d) =>
          assignments.some((a) => a.id === d.teaching_assignment_id),
        ) ? (
          <p className="mt-3">No delivery records in this session.</p>
        ) : null}
      </section>
    </main>
  );
}
