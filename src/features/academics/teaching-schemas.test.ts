import { describe, expect, it } from "vitest";
import { teachingAssignmentSchema } from "./teaching-schemas";

const assignment = {
  sessionId: crypto.randomUUID(),
  staffAssignmentId: crypto.randomUUID(),
  classLevelId: crypto.randomUUID(),
  assignmentType: "subject_teacher",
  status: "active",
  startedOn: "2026-09-01",
} as const;

describe("teaching assignment validation", () => {
  it("requires a subject for a subject-teacher assignment", () => {
    expect(teachingAssignmentSchema.safeParse(assignment).success).toBe(false);
    expect(
      teachingAssignmentSchema.safeParse({
        ...assignment,
        subjectId: crypto.randomUUID(),
      }).success,
    ).toBe(true);
  });

  it("preserves effective-dated assignment history", () => {
    expect(
      teachingAssignmentSchema.safeParse({
        ...assignment,
        subjectId: crypto.randomUUID(),
        status: "ended",
        endedOn: "2026-08-31",
      }).success,
    ).toBe(false);
  });
});
