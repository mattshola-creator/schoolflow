/** Fixed QA diagnostic categories: never return upstream messages or payloads. */
export function scoreSaveErrorCategory(error: {
  code?: unknown;
  message?: unknown;
}) {
  if (error.code === "42501") {
    if (error.message === "Teacher assignment required")
      return "teacher_assignment_required";
    if (error.message === "Score sheet unavailable")
      return "sheet_access_denied";
    return "database_permission_denied";
  }
  if (error.code === "55000") return "sheet_or_period_locked";
  if (error.code === "23514") return "score_or_enrollment_constraint";
  if (error.code === "23505") return "duplicate_score_constraint";
  if (error.code === "PGRST202") return "rpc_contract_unavailable";
  if (error.code === "PGRST301" || error.code === "PGRST303")
    return "session_rejected";
  return "unexpected_database_failure";
}
