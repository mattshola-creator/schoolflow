import { describe, expect, it } from "vitest";
import { learnerSelectionSchema, messageSchema, noticeSchema } from "./schemas";

describe("M11 communication schemas", () => {
  it("validates a targeted notice", () =>
    expect(
      noticeSchema.parse({
        title: "Term update",
        body: "School resumes Monday.",
        priority: "important",
        audienceKind: "guardians",
      }).audienceKind,
    ).toBe("guardians"));
  it("rejects empty messages", () =>
    expect(
      messageSchema.safeParse({
        threadId: crypto.randomUUID(),
        body: " ",
        requestId: crypto.randomUUID(),
      }).success,
    ).toBe(false));
  it("requires explicit learner and school selection", () =>
    expect(
      learnerSelectionSchema.safeParse({
        studentId: crypto.randomUUID(),
        schoolId: crypto.randomUUID(),
      }).success,
    ).toBe(true));
});
