import { describe, expect, it } from "vitest";
import {
  attendanceSettingsSchema,
  calendarExceptionSchema,
  staffAttendancePolicySchema,
} from "./schemas";

describe("M8 attendance foundation validation", () => {
  it("accepts canonical unique statuses and a bounded lock window", () => {
    expect(
      attendanceSettingsSchema.safeParse({
        closingRegisterEnabled: false,
        lockAfterDays: 1,
        enabledStudentStatuses: ["present", "late", "absent", "excused"],
      }).success,
    ).toBe(true);
    expect(
      attendanceSettingsSchema.safeParse({
        lockAfterDays: 31,
        enabledStudentStatuses: ["present", "present"],
      }).success,
    ).toBe(false);
  });

  it("requires lesson plans before approval can be enabled", () => {
    expect(
      attendanceSettingsSchema.safeParse({
        lockAfterDays: 1,
        enabledStudentStatuses: ["present"],
        lessonPlanRequired: false,
        lessonPlanApprovalRequired: true,
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
