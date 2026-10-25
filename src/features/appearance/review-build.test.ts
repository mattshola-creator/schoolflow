import { describe, expect, it } from "vitest";
import { isShellReviewBuild } from "./review-build";
describe("QA shell review build marker", () => {
  it("enables only the QA-bound preview build", () => {
    expect(
      isShellReviewBuild(
        "deploy-preview",
        "https://afqykqlxecpzspjoyegc.supabase.co",
      ),
    ).toBe(true);
  });
  it("denies production, missing context and foreign project bindings", () => {
    for (const context of [undefined, "production", "branch-deploy"])
      expect(
        isShellReviewBuild(context, "https://afqykqlxecpzspjoyegc.supabase.co"),
      ).toBe(false);
    expect(
      isShellReviewBuild("deploy-preview", "https://other.supabase.co"),
    ).toBe(false);
    expect(isShellReviewBuild("deploy-preview", undefined)).toBe(false);
  });
});
