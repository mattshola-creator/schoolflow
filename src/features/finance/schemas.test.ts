import { describe, expect, it } from "vitest";
import {
  billingRunSchema,
  cashHandoverSchema,
  expensePaymentSchema,
  feeCategorySchema,
  feeStructureSchema,
  paymentReversalSchema,
} from "./schemas";

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

  it("requires stable billing identifiers", () => {
    expect(
      billingRunSchema.safeParse({
        structureId: crypto.randomUUID(),
        idempotencyKey: crypto.randomUUID(),
      }).success,
    ).toBe(true);
    expect(
      billingRunSchema.safeParse({
        structureId: "invalid",
        idempotencyKey: crypto.randomUUID(),
      }).success,
    ).toBe(false);
  });

  it("requires durable evidence for financial corrections", () => {
    expect(
      paymentReversalSchema.safeParse({
        paymentId: crypto.randomUUID(),
        reason: "Duplicate bank entry",
      }).success,
    ).toBe(true);
    expect(
      paymentReversalSchema.safeParse({
        paymentId: crypto.randomUUID(),
        reason: "no",
      }).success,
    ).toBe(false);
    expect(
      expensePaymentSchema.safeParse({
        expenseId: crypto.randomUUID(),
        documentId: "missing-evidence",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid cash handovers and excess precision", () => {
    const input = {
      sessionId: crypto.randomUUID(),
      handedTo: crypto.randomUUID(),
      note: "Counted and transferred",
    };
    expect(cashHandoverSchema.parse({ ...input, amount: "5000" }).amount).toBe(
      "5000.00",
    );
    expect(
      cashHandoverSchema.safeParse({ ...input, amount: "5000.001" }).success,
    ).toBe(false);
    expect(
      cashHandoverSchema.safeParse({ ...input, amount: "-1" }).success,
    ).toBe(false);
  });
});
