import { expect, it } from "vitest";
import {
  scoreSaveErrorCategory,
  QaScoreSaveError,
  scoreSaveFailureMessage,
} from "./score-save-error";
it("distinguishes fixed authorization, lock, validation and RPC categories", () => {
  expect(
    scoreSaveErrorCategory({
      code: "42501",
      message: "Teacher assignment required",
    }),
  ).toBe("teacher_assignment_required");
  expect(
    scoreSaveErrorCategory({
      code: "42501",
      message: "Score sheet unavailable",
    }),
  ).toBe("sheet_access_denied");
  expect(scoreSaveErrorCategory({ code: "55000" })).toBe(
    "sheet_or_period_locked",
  );
  expect(scoreSaveErrorCategory({ code: "23514" })).toBe(
    "score_or_enrollment_constraint",
  );
  expect(scoreSaveErrorCategory({ code: "PGRST202" })).toBe(
    "rpc_contract_unavailable",
  );
});
it("does not expose untrusted errors or recast unexpected failures as authorization", () => {
  expect(
    scoreSaveErrorCategory({ code: "XX000", message: "private payload" }),
  ).toBe("unexpected_database_failure");
  expect(
    scoreSaveErrorCategory({ code: "42501", message: "private payload" }),
  ).toBe("database_permission_denied");
});

it("only forwards fixed QA diagnostic errors through the server action", () => {
  expect(
    scoreSaveFailureMessage(new QaScoreSaveError("rpc_contract_unavailable")),
  ).toBe("Score could not be saved (rpc_contract_unavailable)");
  expect(scoreSaveFailureMessage(new Error("private upstream payload"))).toBe(
    "Score could not be saved",
  );
});
