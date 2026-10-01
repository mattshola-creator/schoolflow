import { describe, expect, it } from "vitest";
import {
  assessmentComponentSchema,
  assessmentSchemeSchema,
  correctionSchema,
  gradeBandSchema,
  promotionSchema,
  scoreSchema,
} from "./schemas";

const id = () => crypto.randomUUID();

describe("assessment and result schemas", () => {
  it("accepts a configurable scheme and rejects a pass mark above its total", () => {
    const input = {
      name: "Primary Scheme",
      sessionId: id(),
      periodId: id(),
      classLevelId: id(),
      totalMark: 100,
      passMark: 50,
    };
    expect(assessmentSchemeSchema.safeParse(input).success).toBe(true);
    expect(
      assessmentSchemeSchema.safeParse({ ...input, passMark: 101 }).success,
    ).toBe(false);
  });

  it("normalizes component codes and validates component weights", () => {
    const component = assessmentComponentSchema.parse({
      schemeId: id(),
      code: "exam",
      name: "Examination",
      maximumScore: 60,
      weightPercent: 60,
      sequence: 2,
    });
    expect(component.code).toBe("EXAM");
    expect(
      assessmentComponentSchema.safeParse({ ...component, weightPercent: 101 })
        .success,
    ).toBe(false);
  });

  it("rejects inverted grade bands and invalid scores", () => {
    expect(
      gradeBandSchema.safeParse({
        schemeId: id(),
        minimumPercent: 80,
        maximumPercent: 79,
        grade: "A",
        remark: "Excellent",
        isPass: true,
        sequence: 1,
      }).success,
    ).toBe(false);
    expect(
      scoreSchema.safeParse({
        batchId: id(),
        studentId: id(),
        componentId: id(),
        score: -1,
      }).success,
    ).toBe(false);
  });

  it("requires durable correction evidence", () => {
    expect(
      correctionSchema.safeParse({
        batchId: id(),
        reason: "Incorrect source mark",
      }).success,
    ).toBe(true);
    expect(
      correctionSchema.safeParse({ batchId: id(), reason: "no" }).success,
    ).toBe(false);
  });

  it("requires a target for promotion but not graduation", () => {
    const base = {
      studentId: id(),
      sourcePeriodId: id(),
      idempotencyKey: crypto.randomUUID(),
    };
    expect(
      promotionSchema.safeParse({ ...base, outcome: "promoted" }).success,
    ).toBe(false);
    expect(
      promotionSchema.safeParse({ ...base, outcome: "graduated" }).success,
    ).toBe(true);
  });
});
