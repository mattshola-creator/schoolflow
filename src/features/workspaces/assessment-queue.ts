import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import { evaluateAccess } from "@/features/authorization/evaluator";

export const batchStatuses = [
  "draft",
  "reopened",
  "submitted",
  "reviewed",
  "approved",
  "published",
] as const;
export function parseBatchStatus(value?: string) {
  return batchStatuses.find((status) => status === value);
}
export function projectAssessmentQueue(
  batches: readonly { status: string; session_id: string; period_id: string }[],
  context: { sessionId: string | null; periodId: string | null },
  auth: AuthorizationSnapshot,
) {
  if (
    !auth.schoolId ||
    !evaluateAccess(auth, {
      module: "academics",
      permission: "academics.scores.view",
      feature: "academics.score_entry",
    }).allowed
  )
    return null;
  const scoped = batches.filter(
    (batch) =>
      (!context.sessionId || batch.session_id === context.sessionId) &&
      (!context.periodId || batch.period_id === context.periodId),
  );
  return batchStatuses.map((status) => ({
    status,
    count: scoped.filter((batch) => batch.status === status).length,
  }));
}

export function canPresentBatchTransition(
  status: "submitted" | "reviewed" | "approved" | "published",
  auth: AuthorizationSnapshot,
) {
  const permission = {
    submitted: "academics.scores.submit",
    reviewed: "academics.results.review",
    approved: "academics.results.approve",
    published: "academics.results.publish",
  }[status];
  return (
    Boolean(auth.schoolId) &&
    evaluateAccess(auth, {
      module: "academics",
      permission,
      feature:
        status === "submitted"
          ? "academics.score_entry"
          : "academics.result_workflow",
    }).allowed
  );
}
