import { describe, expect, it } from "vitest";
import { feeCategorySchema, feeStructureSchema } from "./schemas";

describe("finance schemas", () => {
  it("normalizes fee codes and exact two-decimal amounts", () => {
    expect(
      feeCategorySchema.parse({
        code: "tuition",
        name: "Tuition",
        frequency: "term",
      }).code,
    ).toBe("TUITION");
    expect(
      feeStructureSchema.parse({
        name: "Primary Term Fees",
        sessionId: crypto.randomUUID(),
        periodId: "",
        classLevelId: "",
        studentCategoryId: "",
        effectiveFrom: "2026-09-01",
        effectiveTo: "",
        feeCategoryId: crypto.randomUUID(),
        amount: "12500.5",
        dueDate: "",
      }).amount,
    ).toBe("12500.50");
  });

  it("rejects floating precision and reversed dates", () => {
    const base = {
      name: "Primary Term Fees",
      sessionId: crypto.randomUUID(),
      feeCategoryId: crypto.randomUUID(),
      effectiveFrom: "2026-09-02",
      effectiveTo: "2026-09-01",
      amount: "1.001",
    };
    expect(feeStructureSchema.safeParse(base).success).toBe(false);
  });
});
