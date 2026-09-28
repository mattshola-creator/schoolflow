import { describe, expect, it } from "vitest";
import {
  attendanceSettingsSchema,
  calendarExceptionSchema,
  correctStudentAttendanceEntrySchema,
  staffAttendancePolicySchema,
  submitStudentAttendanceRegisterSchema,
} from "./schemas";

describe("M8 attendance foundation validation", () => {
  it("accepts canonical unique statuses and a bounded lock window", () => {
    expect(
      attendanceSettingsSchema.safeParse({
        closingRegisterEnabled: false,
        lockAfterDays: 1,
        enabledStudentStatuses: ["present", "late", "absent", "excused"],
        studentAttendanceDays: [1, 2, 3, 4, 5],
      }).success,
    ).toBe(true);
    expect(
      attendanceSettingsSchema.safeParse({
        lockAfterDays: 31,
        enabledStudentStatuses: ["present", "present"],
        studentAttendanceDays: [1, 1],
      }).success,
    ).toBe(false);
  });

  it("requires lesson plans before approval can be enabled", () => {
    expect(
      attendanceSettingsSchema.safeParse({
        lockAfterDays: 1,
        enabledStudentStatuses: ["present"],
        studentAttendanceDays: [1, 2, 3, 4, 5],
        lessonPlanRequired: false,
        lessonPlanApprovalRequired: true,
      }).success,
    ).toBe(false);
  });

  it("validates an atomic register payload and rejects duplicate students", () => {
    const studentId = crypto.randomUUID();
    const input = {
      sessionId: crypto.randomUUID(),
      classLevelId: crypto.randomUUID(),
      attendanceDate: "2026-09-28",
      registerType: "morning",
      idempotencyKey: crypto.randomUUID(),
      entries: [{ studentId, status: "present" }],
    };
    expect(submitStudentAttendanceRegisterSchema.safeParse(input).success).toBe(
      true,
    );
    expect(
      submitStudentAttendanceRegisterSchema.safeParse({
        ...input,
        entries: [
          { studentId, status: "present" },
          { studentId, status: "absent" },
        ],
      }).success,
    ).toBe(false);
  });

  it("requires a bounded correction reason", () => {
    expect(
      correctStudentAttendanceEntrySchema.safeParse({
        entryId: crypto.randomUUID(),
        status: "excused",
        reason: "Medical note received",
      }).success,
    ).toBe(true);
    expect(
      correctStudentAttendanceEntrySchema.safeParse({
        entryId: crypto.randomUUID(),
        status: "excused",
        reason: "x",
      }).success,
    ).toBe(false);
  });

  it("validates school and position schedule boundaries", () => {
    const policy = {
      name: "Teaching staff",
      workingDays: [1, 2, 3, 4, 5],
      startsAt: "07:30:00",
      endsAt: "16:00:00",
      graceMinutes: 15,
      effectiveFrom: "2026-09-01",
    };
    expect(staffAttendancePolicySchema.safeParse(policy).success).toBe(true);
    expect(
      staffAttendancePolicySchema.safeParse({
        ...policy,
        workingDays: [1, 1],
        endsAt: "06:00:00",
      }).success,
    ).toBe(false);
  });

  it("validates calendar exceptions without creating attendance records", () => {
    expect(
      calendarExceptionSchema.safeParse({
        sessionId: crypto.randomUUID(),
        calendarDate: "2026-10-01",
        isTeachingDay: false,
        label: "National holiday",
      }).success,
    ).toBe(true);
  });
});
