/** Fixed categories only: never display upstream messages, SQL, identifiers or payloads. */
export function lessonFailureCategory(code?: string) {
  switch (code) {
    case "42501":
      return "record_permissions";
    case "23514":
      return "scope_validation";
    case "23503":
      return "related_record";
    case "23505":
      return "duplicate_record";
    case "42703":
    case "42883":
      return "database_contract";
    default:
      return "unexpected_failure";
  }
}
export class LessonOperationError extends Error {
  readonly category: ReturnType<typeof lessonFailureCategory>;
  constructor(code?: string) {
    super("The lesson operation could not be completed");
    this.category = lessonFailureCategory(code);
  }
}
export function lessonActionFailure(error: unknown, fallback: string) {
  return error instanceof LessonOperationError
    ? `${fallback} (${error.category})`
    : fallback;
}
