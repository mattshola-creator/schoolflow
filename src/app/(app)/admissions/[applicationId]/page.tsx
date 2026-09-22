import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldClass } from "@/components/auth-card";
import { allowedAdmissionTransitions } from "@/features/admissions/schemas";
import { loadAdmission } from "@/features/admissions/service";
import {
  convertAdmission,
  issueOffer,
  recordAssessment,
  recordDecision,
  respondToOffer,
  transitionAdmission,
  updateChecklist,
} from "../actions";

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default async function AdmissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [{ applicationId }, notice] = await Promise.all([params, searchParams]);
  const result = await loadAdmission(applicationId).catch(() => null);
  if (!result) notFound();
  const permissions = new Set(result.authorization.permissions);
  const transitions = allowedAdmissionTransitions(result.application.status);
  const canManage = permissions.has("admissions.manage");
  const canAssess = permissions.has("admissions.assess");
  const canDecide = permissions.has("admissions.decide");
  const canEnroll = permissions.has("admissions.enroll");
  return (
    <main className="py-10 sm:py-12">
      <Link href="/admissions" className="text-sm font-medium text-emerald-800">
        ← Admissions
      </Link>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            {result.application.application_number}
          </p>
          <h1 className="mt-1 text-3xl font-semibold">
            {result.application.applicant.first_name}{" "}
            {result.application.applicant.last_name}
          </h1>
          <p className="mt-2 text-slate-600">
            {result.application.class_levels.name} ·{" "}
            {result.application.academic_sessions.name}
          </p>
        </div>
        <span className="self-start rounded-full bg-slate-200 px-3 py-1.5 text-sm font-semibold">
          {label(result.application.status)}
        </span>
      </div>
      {notice.error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {notice.error}
        </p>
      )}
      {notice.message && (
        <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice.message}
        </p>
      )}
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Application details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Date of birth</dt>
              <dd>{result.application.date_of_birth}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Source</dt>
              <dd>{label(result.application.source)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Previous class</dt>
              <dd>{result.application.previous_class ?? "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Guardian</dt>
              <dd>
                {result.guardians[0]
                  ? `${result.guardians[0].guardian.first_name} ${result.guardians[0].guardian.last_name}`
                  : "Not provided"}
              </dd>
            </div>
          </dl>
          {canManage && transitions.length > 0 && (
            <form action={transitionAdmission} className="mt-5 flex gap-2">
              <input type="hidden" name="applicationId" value={applicationId} />
              <select className={fieldClass} name="status">
                {transitions.map((status) => (
                  <option key={status} value={status}>
                    {label(status)}
                  </option>
                ))}
              </select>
              <button className="rounded-lg border px-4 text-sm font-semibold">
                Update
              </button>
            </form>
          )}
        </section>
        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Enrollment checklist</h2>
          <ul className="mt-3 divide-y">
            {result.checklist.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <span>
                  {item.label}
                  {item.required ? " *" : ""}
                </span>
                {canEnroll ? (
                  <form action={updateChecklist} className="flex gap-2">
                    <input
                      type="hidden"
                      name="applicationId"
                      value={applicationId}
                    />
                    <input type="hidden" name="itemId" value={item.id} />
                    <select
                      name="status"
                      defaultValue={item.status}
                      className="rounded-md border px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="complete">Complete</option>
                      <option value="waived">Waived</option>
                    </select>
                    <button className="font-semibold text-emerald-800">
                      Save
                    </button>
                  </form>
                ) : (
                  <span>{label(item.status)}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Entrance assessments</h2>
          {result.assessments.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {result.assessments.map((attempt) => (
                <li key={attempt.id} className="rounded-lg bg-slate-50 p-3">
                  Attempt {attempt.attempt_number} · {label(attempt.status)}
                  {attempt.score !== null
                    ? ` · ${attempt.score}/${attempt.maximum_score}`
                    : ` · ${new Date(attempt.scheduled_at).toLocaleString()}`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No assessment attempts.
            </p>
          )}
          {canAssess &&
            [
              "under_review",
              "exam_scheduled",
              "exam_taken",
              "under_assessment",
              "retake",
            ].includes(result.application.status) && (
              <form
                action={recordAssessment}
                className="mt-4 grid gap-3 sm:grid-cols-2"
              >
                <input
                  type="hidden"
                  name="applicationId"
                  value={applicationId}
                />
                <label className="text-sm">
                  Schedule
                  <input
                    className={`${fieldClass} mt-1`}
                    type="datetime-local"
                    name="scheduledAt"
                    required
                  />
                </label>
                <label className="text-sm">
                  Score (blank to schedule)
                  <input
                    className={`${fieldClass} mt-1`}
                    type="number"
                    min="0"
                    step="0.01"
                    name="score"
                  />
                </label>
                <label className="text-sm">
                  Maximum score
                  <input
                    className={`${fieldClass} mt-1`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="maximumScore"
                  />
                </label>
                <label className="text-sm">
                  Notes
                  <input className={`${fieldClass} mt-1`} name="notes" />
                </label>
                <button className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white sm:col-span-2">
                  Record assessment
                </button>
              </form>
            )}
        </section>
        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Decision history</h2>
          {result.decisions.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {result.decisions.map((decision) => (
                <li key={decision.id} className="rounded-lg bg-slate-50 p-3">
                  <strong>{label(decision.decision)}</strong>
                  {decision.class_levels
                    ? ` · ${decision.class_levels.name}`
                    : ""}
                  <span className="mt-1 block text-slate-600">
                    {decision.rationale}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No decision recorded.</p>
          )}
          {canDecide &&
            ["under_review", "under_assessment"].includes(
              result.application.status,
            ) && (
              <form action={recordDecision} className="mt-4 space-y-3">
                <input
                  type="hidden"
                  name="applicationId"
                  value={applicationId}
                />
                <select className={fieldClass} name="decision">
                  <option value="approved">Approve</option>
                  <option value="retake">Retake</option>
                  <option value="rejected">Reject</option>
                </select>
                <select
                  className={fieldClass}
                  name="levelId"
                  defaultValue={result.application.applied_class_level_id}
                >
                  <option value="">No placement recommendation</option>
                  {result.levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
                <textarea
                  className={fieldClass}
                  name="rationale"
                  required
                  placeholder="Decision rationale"
                />
                <button className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">
                  Record decision
                </button>
              </form>
            )}
        </section>
        <section className="rounded-xl border bg-white p-5 lg:col-span-2">
          <h2 className="font-semibold">Offer and enrollment</h2>
          {result.offer ? (
            <p className="mt-2 text-sm">
              {label(result.offer.status)} · {result.offer.class_levels.name}
              {result.offer.class_arms
                ? ` ${result.offer.class_arms.name}`
                : ""}{" "}
              · {result.offer.academic_sessions.name}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No offer issued.</p>
          )}
          {canDecide && result.application.status === "approved" && (
            <form
              action={issueOffer}
              className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <input type="hidden" name="applicationId" value={applicationId} />
              <select className={fieldClass} name="sessionId">
                {result.sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
              <select className={fieldClass} name="levelId">
                {result.levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
              <select className={fieldClass} name="armId">
                <option value="">No arm</option>
                {result.arms.map((arm) => (
                  <option key={arm.id} value={arm.id}>
                    {arm.name}
                  </option>
                ))}
              </select>
              <input
                className={fieldClass}
                type="datetime-local"
                name="expiresAt"
                required
              />
              <button className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white lg:col-span-4">
                Issue offer
              </button>
            </form>
          )}
          {canManage && result.application.status === "admission_offered" && (
            <form action={respondToOffer} className="mt-4 flex gap-2">
              <input type="hidden" name="applicationId" value={applicationId} />
              <button
                name="response"
                value="accept"
                className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
              >
                Record acceptance
              </button>
              <button
                name="response"
                value="decline"
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Record decline
              </button>
            </form>
          )}
          {canEnroll &&
            ["accepted", "enrollment_pending"].includes(
              result.application.status,
            ) && (
              <form
                action={convertAdmission}
                className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  type="hidden"
                  name="applicationId"
                  value={applicationId}
                />
                <input
                  className={fieldClass}
                  name="studentNumber"
                  required
                  placeholder="Student number"
                />
                <input
                  className={fieldClass}
                  type="date"
                  name="enrolledOn"
                  required
                />
                <button className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">
                  Create student enrollment
                </button>
              </form>
            )}
          {result.application.student_profiles && (
            <p className="mt-4 text-sm">
              <Link
                className="font-semibold text-emerald-800"
                href={`/students/${result.application.student_profiles.id}`}
              >
                Open student{" "}
                {result.application.student_profiles.student_number}
              </Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
