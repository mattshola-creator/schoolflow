import { describe, expect, it } from "vitest";
import {
  teachingAssignmentSchema,
  timetableEntrySchema,
  timetablePeriodSchema,
} from "./teaching-schemas";

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

describe("manual timetable schemas", () => {
  it("accepts a valid weekday period", () => {
    expect(
      timetablePeriodSchema.safeParse({
        sessionId: crypto.randomUUID(),
        weekday: "1",
        name: "Period 1",
        startsAt: "08:00",
        endsAt: "08:45",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid or reversed period", () => {
    expect(
      timetablePeriodSchema.safeParse({
        sessionId: crypto.randomUUID(),
        weekday: "8",
        name: "Period 1",
        startsAt: "09:00",
        endsAt: "08:45",
      }).success,
    ).toBe(false);
  });

  it("defaults conflict acknowledgement to false", () => {
    const result = timetableEntrySchema.parse({
      sessionId: crypto.randomUUID(),
      periodId: crypto.randomUUID(),
      teachingAssignmentId: crypto.randomUUID(),
      acknowledgeConflict: null,
      notes: "",
    });
    expect(result.acknowledgeConflict).toBe(false);
    expect(result.notes).toBeUndefined();
  });
});
