import { z } from "zod";

const id = z.string().uuid();
const weekday = z.coerce.number().int().min(0).max(6);
const attendanceStatus = z.enum([
  "present",
  "late",
  "absent",
  "excused",
  "left_early",
]);

export const attendanceSettingsSchema = z
  .object({
    closingRegisterEnabled: z.coerce.boolean().default(false),
    lockAfterDays: z.coerce.number().int().min(0).max(30),
    enabledStudentStatuses: z.array(attendanceStatus).min(1),
    studentAttendanceDays: z.array(weekday).min(1).max(7),
    lessonPlanRequired: z.coerce.boolean().default(false),
    lessonPlanApprovalRequired: z.coerce.boolean().default(false),
  })
  .superRefine((value, context) => {
    if (
      new Set(value.enabledStudentStatuses).size !==
      value.enabledStudentStatuses.length
    )
      context.addIssue({
        code: "custom",
        path: ["enabledStudentStatuses"],
        message: "Attendance statuses must be unique.",
      });
    if (
      new Set(value.studentAttendanceDays).size !==
      value.studentAttendanceDays.length
    )
      context.addIssue({
        code: "custom",
        path: ["studentAttendanceDays"],
        message: "Student attendance days must be unique.",
      });
    if (value.lessonPlanApprovalRequired && !value.lessonPlanRequired)
      context.addIssue({
        code: "custom",
        path: ["lessonPlanApprovalRequired"],
        message: "Lesson-plan approval requires lesson plans.",
      });
  });

export const staffAttendancePolicySchema = z
  .object({
    positionId: id.optional(),
    name: z.string().trim().min(2).max(120),
    workingDays: z.array(weekday).min(1).max(7),
    startsAt: z.iso.time(),
    endsAt: z.iso.time(),
    graceMinutes: z.coerce.number().int().min(0).max(240),
    effectiveFrom: z.iso.date(),
    effectiveTo: z.iso.date().optional(),
  })
  .superRefine((value, context) => {
    if (new Set(value.workingDays).size !== value.workingDays.length)
      context.addIssue({
        code: "custom",
        path: ["workingDays"],
        message: "Working days must be unique.",
      });
    if (value.endsAt <= value.startsAt)
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End time must be after start time.",
      });
    if (value.effectiveTo && value.effectiveTo < value.effectiveFrom)
      context.addIssue({
        code: "custom",
        path: ["effectiveTo"],
        message: "Effective end cannot precede the start.",
      });
  });

export const calendarExceptionSchema = z.object({
  sessionId: id,
  calendarDate: z.iso.date(),
  isTeachingDay: z.coerce.boolean(),
  label: z.string().trim().min(2).max(120),
});

export const studentAttendanceEntrySchema = z.object({
  studentId: id,
  status: attendanceStatus,
  note: z.string().trim().min(1).max(500).optional(),
});

export const submitStudentAttendanceRegisterSchema = z
  .object({
    sessionId: id,
    classLevelId: id,
    classArmId: id.optional(),
    attendanceDate: z.iso.date(),
    registerType: z.enum(["morning", "closing"]),
    idempotencyKey: id,
    entries: z.array(studentAttendanceEntrySchema).min(1),
  })
  .superRefine((value, context) => {
    const studentIds = value.entries.map((entry) => entry.studentId);
    if (new Set(studentIds).size !== studentIds.length)
      context.addIssue({
        code: "custom",
        path: ["entries"],
        message: "Each student may appear only once.",
      });
  });

export const correctStudentAttendanceEntrySchema = z.object({
  entryId: id,
  status: attendanceStatus,
  reason: z.string().trim().min(3).max(500),
});
