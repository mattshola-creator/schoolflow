import { describe, expect, it } from "vitest";
import { teachingAssignmentSchema } from "./teaching-schemas";

const base = {
  sessionId: crypto.randomUUID(),
  staffAssignmentId: crypto.randomUUID(),
  classLevelId: crypto.randomUUID(),
  classArmId: "",
  startedOn: "2026-09-01",
  endedOn: "",
};

describe("teaching assignment schema", () => {
  it("accepts a class teacher without a subject", () => {
    expect(
      teachingAssignmentSchema.safeParse({
        ...base,
        assignmentType: "class_teacher",
        subjectId: "",
      }).success,
    ).toBe(true);
  });

  it("requires a subject only for subject teachers", () => {
    expect(
      teachingAssignmentSchema.safeParse({
        ...base,
        assignmentType: "subject_teacher",
        subjectId: "",
      }).success,
    ).toBe(false);
    expect(
      teachingAssignmentSchema.safeParse({
        ...base,
        assignmentType: "subject_teacher",
        subjectId: crypto.randomUUID(),
      }).success,
    ).toBe(true);
  });

  it("rejects reversed assignment dates", () => {
    expect(
      teachingAssignmentSchema.safeParse({
        ...base,
        assignmentType: "class_teacher",
        subjectId: "",
        endedOn: "2026-08-31",
      }).success,
    ).toBe(false);
  });
});
