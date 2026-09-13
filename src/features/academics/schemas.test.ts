import { describe, expect, it } from "vitest";
import {
  lockSchema,
  periodSchema,
  sessionSchema,
  subjectSchema,
} from "./schemas";

describe("academic setup validation", () => {
  it("accepts a valid session and rejects contradictory dates", () => {
    expect(
      sessionSchema.safeParse({
        name: "2026/2027",
        startDate: "2026-09-01",
        endDate: "2027-07-31",
      }).success,
    ).toBe(true);
    expect(
      sessionSchema.safeParse({
        name: "2026/2027",
        startDate: "2027-07-31",
        endDate: "2026-09-01",
      }).success,
    ).toBe(false);
  });

  it("validates period order and dates", () => {
    const base = {
      sessionId: crypto.randomUUID(),
      name: "First Term",
      sequence: 1,
      startDate: "2026-09-01",
      endDate: "2026-12-18",
    };
    expect(periodSchema.safeParse(base).success).toBe(true);
    expect(periodSchema.safeParse({ ...base, sequence: 0 }).success).toBe(
      false,
    );
  });

  it("keeps subject classification configurable", () => {
    expect(
      subjectSchema.parse({
        name: "Mathematics",
        code: "math",
        sortOrder: "1",
        classification: "core",
      }).code,
    ).toBe("MATH");
    expect(
      subjectSchema.safeParse({
        name: "Art",
        sortOrder: 1,
        classification: "optional",
      }).success,
    ).toBe(false);
  });

  it("requires lock targets to match the scope", () => {
    expect(
      lockSchema.safeParse({
        scope: "school_setup",
        reason: "Configuration approved",
      }).success,
    ).toBe(true);
    expect(
      lockSchema.safeParse({ scope: "period", reason: "Finalized" }).success,
    ).toBe(false);
  });
});
