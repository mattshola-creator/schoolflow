import { describe, expect, it } from "vitest";
import {
  curriculumCoverageSchema,
  curriculumItemSchema,
} from "./curriculum-schemas";

const item = {
  sessionId: crypto.randomUUID(),
  academicPeriodId: "",
  teachingAssignmentId: crypto.randomUUID(),
  sequence: "1",
  title: "Fractions",
  learningObjectives: "",
  plannedStart: "2026-09-01",
  plannedEnd: "2026-09-05",
};

describe("curriculum schemas", () => {
  it("accepts an ordered curriculum item", () => {
    const result = curriculumItemSchema.parse(item);
    expect(result.sequence).toBe(1);
    expect(result.academicPeriodId).toBeUndefined();
  });

  it("rejects reversed planned dates", () => {
    expect(
      curriculumItemSchema.safeParse({ ...item, plannedEnd: "2026-08-31" })
        .success,
    ).toBe(false);
  });

  it("requires a date only for completed coverage", () => {
    const id = crypto.randomUUID();
    expect(
      curriculumCoverageSchema.safeParse({
        curriculumItemId: id,
        status: "completed",
        completedOn: "",
      }).success,
    ).toBe(false);
    expect(
      curriculumCoverageSchema.safeParse({
        curriculumItemId: id,
        status: "completed",
        completedOn: "2026-09-05",
      }).success,
    ).toBe(true);
    expect(
      curriculumCoverageSchema.safeParse({
        curriculumItemId: id,
        status: "planned",
        completedOn: "2026-09-05",
      }).success,
    ).toBe(false);
  });
});
