import { expect, it } from "vitest";
import {
  LessonOperationError,
  lessonFailureCategory,
  lessonActionFailure,
} from "./lesson-operation-error";
it.each([
  ["42501", "record_permissions"],
  ["23514", "scope_validation"],
  ["23503", "related_record"],
  ["23505", "duplicate_record"],
  ["42703", "database_contract"],
  ["42883", "database_contract"],
  [undefined, "unexpected_failure"],
])("maps a fixed lesson failure category %s", (code, expected) => {
  expect(lessonFailureCategory(code)).toBe(expected);
});
it("does not expose raw database error details", () => {
  expect(
    lessonActionFailure(new Error("sensitive payload"), "Save failed"),
  ).toBe("Save failed");
  expect(
    lessonActionFailure(new LessonOperationError("42703"), "Save failed"),
  ).toBe("Save failed (database_contract)");
});
