import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadLessonWorkspace } from "@/features/academics/lesson-service";
import {
  changeLessonPlanStatus,
  saveLessonDelivery,
  saveLessonPlan,
} from "./actions";

const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const notice = await searchParams;
  const workspace = await loadLessonWorkspace().catch(() => null);
  if (!workspace)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Lessons are not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school workspace. Teaching management must be
          enabled first.
        </p>
      </main>
    );

  const permissions = workspace.authorization.permissions;
  const canPlan = permissions.includes("academics.lesson_plans.manage");
  const canApprove = permissions.includes("academics.lesson_plans.approve");
  const canDeliver = permissions.includes("academics.lesson_delivery.record");
  const assignmentLabel = (id: string) => {
    const item = workspace.assignments.find((x) => x.id === id);
    return item
      ? `Subject assignment · ${item.class_level_id.slice(0, 8)}`
      : "Subject assignment";
  };

  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Teaching management"
        title={`Lessons at ${workspace.active.schoolName}`}
        description="Prepare optional lesson plans and record what was actually delivered as separate, auditable teaching records."
        actions={
          <>
            <ButtonLink href="/teaching/curriculum" variant="secondary">
              Curriculum
            </ButtonLink>
            <ButtonLink href="/teaching/timetable" variant="secondary">
              Timetable
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
        aria-label="Lesson summary"
      >
        <div className={panel}>
          <p className="text-sm text-slate-500">Lesson plans</p>
          <p className="mt-2 text-3xl font-semibold">
            {workspace.plans.length}
          </p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">Awaiting review</p>
          <p className="mt-2 text-3xl font-semibold">
            {workspace.plans.filter((x) => x.status === "submitted").length}
          </p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">Delivery records</p>
          <p className="mt-2 text-3xl font-semibold">
            {workspace.deliveries.length}
          </p>
        </div>
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        {canPlan ? (
          <section className={panel} aria-labelledby="plan-heading">
            <h2 id="plan-heading" className="text-xl font-semibold">
              Create lesson plan
            </h2>
            <form
              action={saveLessonPlan}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <ScopeFields workspace={workspace} />
              <label className="text-sm font-medium">
                Lesson date
                <input
                  className={fieldClass}
                  name="lessonDate"
                  type="date"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Topic
                <input className={fieldClass} name="topic" required />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Objectives
                <textarea
                  className={`${fieldClass} min-h-24`}
                  name="objectives"
                  required
                />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Content outline
                <textarea
                  className={`${fieldClass} min-h-32`}
                  name="contentOutline"
                  required
                />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Teaching resources{" "}
                <span className="text-slate-500">(optional)</span>
                <textarea
                  className={`${fieldClass} min-h-20`}
                  name="teachingResources"
                />
              </label>
              <Button className="sm:w-fit" type="submit">
                Save draft plan
              </Button>
            </form>
          </section>
        ) : null}

        {canDeliver ? (
          <section className={panel} aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className="text-xl font-semibold">
              Record lesson delivery
            </h2>
            <form
              action={saveLessonDelivery}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <ScopeFields workspace={workspace} />
              <label className="text-sm font-medium">
                Lesson plan <span className="text-slate-500">(optional)</span>
                <select className={fieldClass} name="lessonPlanId">
                  <option value="">No linked plan</option>
                  {workspace.plans.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.topic} · {x.lesson_date}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Delivered on
                <input
                  className={fieldClass}
                  name="deliveredOn"
                  type="date"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Topic
                <input className={fieldClass} name="topic" required />
              </label>
              <label className="text-sm font-medium">
                Status
                <select
                  className={fieldClass}
                  name="status"
                  defaultValue="delivered"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="delivered">Delivered</option>
                  <option value="partially_delivered">
                    Partially delivered
                  </option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Coverage notes
                <textarea
                  className={`${fieldClass} min-h-24`}
                  name="coverageNotes"
                  required
                />
              </label>
              {[
                ["classwork", "Classwork"],
                ["homework", "Homework"],
                ["reflection", "Reflection"],
              ].map(([name, label]) => (
                <label key={name} className="text-sm font-medium sm:col-span-2">
                  {label} <span className="text-slate-500">(optional)</span>
                  <textarea className={`${fieldClass} min-h-20`} name={name} />
                </label>
              ))}
              <Button className="sm:w-fit" type="submit">
                Record delivery
              </Button>
            </form>
          </section>
        ) : null}
      </div>

      <section className="mt-7" aria-labelledby="plans-heading">
        <h2 id="plans-heading" className="text-xl font-semibold">
          Lesson plans
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {workspace.plans.map((plan) => (
            <article className={panel} key={plan.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold break-words">
                    {plan.topic}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {plan.lesson_date} ·{" "}
                    {assignmentLabel(plan.teaching_assignment_id)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">
                  {plan.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6">{plan.objectives}</p>
              {canPlan || canApprove ? (
                <form
                  action={changeLessonPlanStatus}
                  className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <input type="hidden" name="lessonPlanId" value={plan.id} />
                  <label className="text-sm font-medium">
                    Status
                    <select
                      className={fieldClass}
                      name="status"
                      defaultValue={plan.status}
                    >
                      {canPlan ? (
                        <>
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                          <option value="withdrawn">Withdrawn</option>
                        </>
                      ) : null}
                      {canApprove ? (
                        <>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </>
                      ) : null}
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Review comment
                    <input className={fieldClass} name="reviewComment" />
                  </label>
                  <Button type="submit">Update</Button>
                </form>
              ) : null}
            </article>
          ))}
          {!workspace.plans.length ? (
            <p className={`${panel} text-sm text-slate-600`}>
              No lesson plans recorded.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function ScopeFields({
  workspace,
}: {
  workspace: Awaited<ReturnType<typeof loadLessonWorkspace>>;
}) {
  return (
    <>
      <label className="text-sm font-medium">
        Academic session
        <select className={fieldClass} name="sessionId" required>
          <option value="">Select session</option>
          {workspace.sessions.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Academic period <span className="text-slate-500">(optional)</span>
        <select className={fieldClass} name="academicPeriodId">
          <option value="">Whole session</option>
          {workspace.periods.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium sm:col-span-2">
        Subject teaching assignment
        <select className={fieldClass} name="teachingAssignmentId" required>
          <option value="">Select assignment</option>
          {workspace.assignments.map((x) => (
            <option key={x.id} value={x.id}>
              {x.id.slice(0, 8)} · class {x.class_level_id.slice(0, 8)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium sm:col-span-2">
        Curriculum item <span className="text-slate-500">(optional)</span>
        <select className={fieldClass} name="curriculumItemId">
          <option value="">No linked curriculum item</option>
          {workspace.curriculum.map((x) => (
            <option key={x.id} value={x.id}>
              {x.sequence}. {x.title}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
