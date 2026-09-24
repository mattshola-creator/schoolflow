import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldClass } from "@/components/auth-card";
import { buttonClassName } from "@/components/ui/button";
import { DetailItem, DetailList } from "@/components/ui/detail-list";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { allowedAdmissionTransitions } from "@/features/admissions/schemas";
import { loadAdmission } from "@/features/admissions/service";
import {
  issueOffer,
  recordAssessment,
  recordDecision,
  transitionAdmission,
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
  const canConfigureDocuments = permissions.has(
    "admissions.documents.configure",
  );
  const canSubmitDocuments = permissions.has("admissions.documents.submit");
  const canReviewDocuments = permissions.has("admissions.documents.review");
  return (
    <main className="py-10 sm:py-12">
      <Link href="/admissions" className="text-sm font-medium text-emerald-800">
        ← Admissions
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow={
            <span className="[overflow-wrap:anywhere]">
              {result.application.application_number}
            </span>
          }
          title={
            <span className="break-words">
              {result.application.applicant.first_name}{" "}
              {result.application.applicant.last_name}
            </span>
          }
          description={
            <>
              {result.application.class_levels.name} ·{" "}
              {result.application.academic_sessions.name}
            </>
          }
          actions={
            <StatusBadge tone="success">
              {label(result.application.status)}
            </StatusBadge>
          }
        />
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
        <section className="border-border bg-surface rounded-xl border p-5">
          <h2 className="font-semibold">Application details</h2>
          <DetailList className="mt-4">
            <DetailItem label="Date of birth">
              {result.application.date_of_birth}
            </DetailItem>
            <DetailItem label="Source">
              {label(result.application.source)}
            </DetailItem>
            <DetailItem label="Previous class">
              {result.application.previous_class ?? "Not provided"}
            </DetailItem>
            <DetailItem label="Guardian">
              {result.guardians[0]
                ? `${result.guardians[0].guardian.first_name} ${result.guardians[0].guardian.last_name}`
                : "Not provided"}
            </DetailItem>
          </DetailList>
          {canManage && transitions.length > 0 && (
            <form
              action={transitionAdmission}
              className="mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <input type="hidden" name="applicationId" value={applicationId} />
              <select className={fieldClass} name="status">
                {transitions.map((status) => (
                  <option key={status} value={status}>
                    {label(status)}
                  </option>
                ))}
              </select>
              <button className={buttonClassName({ variant: "secondary" })}>
                Update
              </button>
            </form>
          )}
        </section>
        <section className="border-border bg-surface rounded-xl border p-5">
          <h2 className="font-semibold">Enrollment checklist</h2>
          <ul className="mt-3 divide-y">
            {result.checklist.map((item) => (
              <li
                key={item.id}
                className="grid gap-2 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <span>
                  {item.label}
                  {item.required ? " *" : ""}
                </span>
                {canEnroll ? (
                  <form
                    action="/api/admissions/checklist"
                    method="post"
                    className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2"
                  >
                    <input
                      type="hidden"
                      name="applicationId"
                      value={applicationId}
                    />
                    <input type="hidden" name="itemId" value={item.id} />
                    <select
                      name="status"
                      defaultValue={item.status}
                      className="border-border min-h-11 min-w-0 rounded-md border px-2 py-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="complete">Complete</option>
                      <option value="waived">Waived</option>
                    </select>
                    <button className="text-brand min-h-11 px-2 font-semibold">
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
        <section className="border-border bg-surface rounded-xl border p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Required admission documents</h2>
              <p className="mt-1 text-sm text-slate-500">
                Only reviewed evidence can satisfy enrollment readiness.
              </p>
            </div>
            <Link
              href="/documents"
              className="text-sm font-semibold text-emerald-800"
            >
              Upload private evidence
            </Link>
          </div>
          {result.documentRequirements.length === 0 ? (
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
              <p>
                This existing application has no document-policy snapshot.
                Initialize it explicitly from the current school policy.
              </p>
              {canConfigureDocuments && (
                <form
                  action="/api/admissions/documents"
                  method="post"
                  className="mt-3"
                >
                  <input type="hidden" name="operation" value="initialize" />
                  <input
                    type="hidden"
                    name="applicationId"
                    value={applicationId}
                  />
                  <button className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-semibold">
                    Initialize requirements
                  </button>
                </form>
              )}
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {result.documentRequirements.map((requirement) => (
                <li key={requirement.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {requirement.label}
                        {requirement.required ? " *" : ""}
                      </p>
                      <p className="text-sm text-slate-500">
                        {label(requirement.status)} · policy version{" "}
                        {requirement.policy_version}
                      </p>
                      {requirement.documents && (
                        <p className="mt-1 text-sm [overflow-wrap:anywhere]">
                          Evidence: {requirement.documents.title} (
                          {requirement.documents.original_filename})
                        </p>
                      )}
                      {requirement.review_comment && (
                        <p className="mt-1 text-sm break-words">
                          Review: {requirement.review_comment}
                        </p>
                      )}
                    </div>
                  </div>
                  {canSubmitDocuments &&
                    ["required", "rejected"].includes(requirement.status) &&
                    result.admissionDocuments.length > 0 && (
                      <form
                        action="/api/admissions/documents"
                        method="post"
                        className="mt-3 flex flex-wrap gap-2"
                      >
                        <input type="hidden" name="operation" value="submit" />
                        <input
                          type="hidden"
                          name="applicationId"
                          value={applicationId}
                        />
                        <input
                          type="hidden"
                          name="requirementId"
                          value={requirement.id}
                        />
                        <select
                          name="documentId"
                          required
                          className="border-border min-h-11 min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
                        >
                          <option value="">Choose linked document</option>
                          {result.admissionDocuments.map((document) => (
                            <option key={document.id} value={document.id}>
                              {document.title} · {document.original_filename}
                            </option>
                          ))}
                        </select>
                        <button className="rounded-lg border px-3 py-2 text-sm font-semibold">
                          Submit evidence
                        </button>
                      </form>
                    )}
                  {canReviewDocuments && requirement.status === "submitted" && (
                    <form
                      action="/api/admissions/documents"
                      method="post"
                      className="mt-3 grid gap-2 sm:grid-cols-[auto_1fr_auto]"
                    >
                      <input type="hidden" name="operation" value="review" />
                      <input
                        type="hidden"
                        name="applicationId"
                        value={applicationId}
                      />
                      <input
                        type="hidden"
                        name="requirementId"
                        value={requirement.id}
                      />
                      <select
                        name="status"
                        className="rounded-lg border px-3 py-2 text-sm"
                      >
                        <option value="verified">Verify</option>
                        <option value="rejected">
                          Reject / needs replacement
                        </option>
                      </select>
                      <input
                        name="comment"
                        placeholder="Review comment"
                        className="rounded-lg border px-3 py-2 text-sm"
                      />
                      <button className="rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white">
                        Record review
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="text-muted-foreground mt-4 text-xs font-medium break-words">
            Upload with linked record type{" "}
            <code className="[overflow-wrap:anywhere]">
              admission_application
            </code>{" "}
            and linked record ID{" "}
            <code className="[overflow-wrap:anywhere]">{applicationId}</code>.
          </p>
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
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <form action="/api/admissions/offers/respond" method="post">
                <input
                  type="hidden"
                  name="applicationId"
                  value={applicationId}
                />
                <input type="hidden" name="response" value="accept" />
                <button
                  className={buttonClassName({ className: "w-full sm:w-auto" })}
                >
                  Record acceptance
                </button>
              </form>
              <form action="/api/admissions/offers/respond" method="post">
                <input
                  type="hidden"
                  name="applicationId"
                  value={applicationId}
                />
                <input type="hidden" name="response" value="decline" />
                <button
                  className={buttonClassName({
                    className: "w-full sm:w-auto",
                    variant: "secondary",
                  })}
                >
                  Record decline
                </button>
              </form>
            </div>
          )}
          {canEnroll &&
            ["accepted", "enrollment_pending"].includes(
              result.application.status,
            ) && (
              <form
                action="/api/admissions/convert"
                method="post"
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
            <p className="mt-4 text-sm [overflow-wrap:anywhere]">
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
