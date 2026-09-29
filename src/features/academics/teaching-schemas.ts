import { z } from "zod";

const optionalId = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().uuid().optional(),
);

export const teachingAssignmentSchema = z
  .object({
    sessionId: z.string().uuid(),
    staffAssignmentId: z.string().uuid(),
    assignmentType: z.enum(["class_teacher", "subject_teacher"]),
    subjectId: optionalId,
    classLevelId: z.string().uuid(),
    classArmId: optionalId,
    startedOn: z.iso.date(),
    endedOn: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.iso.date().optional(),
    ),
  })
  .superRefine((value, context) => {
    if (value.assignmentType === "subject_teacher" && !value.subjectId)
      context.addIssue({
        code: "custom",
        path: ["subjectId"],
        message: "A subject teacher requires a subject.",
      });
    if (value.assignmentType === "class_teacher" && value.subjectId)
      context.addIssue({
        code: "custom",
        path: ["subjectId"],
        message: "A class teacher assignment cannot include a subject.",
      });
    if (value.endedOn && value.endedOn < value.startedOn)
      context.addIssue({
        code: "custom",
        path: ["endedOn"],
        message: "The end date cannot precede the start date.",
      });
  });

export const teachingAssignmentLifecycleSchema = z.object({
  assignmentId: z.string().uuid(),
  status: z.enum(["active", "ended", "cancelled"]),
  endedOn: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.iso.date().optional(),
  ),
});

export type TeachingAssignmentInput = z.infer<typeof teachingAssignmentSchema>;

export const timetablePeriodSchema = z
  .object({
    sessionId: z.string().uuid(),
    weekday: z.coerce.number().int().min(1).max(7),
    name: z.string().trim().min(1).max(80),
    startsAt: z.iso.time({ precision: -1 }),
    endsAt: z.iso.time({ precision: -1 }),
  })
  .refine((value) => value.endsAt > value.startsAt, {
    path: ["endsAt"],
    message: "The period must end after it starts.",
  });

export const timetableEntrySchema = z.object({
  sessionId: z.string().uuid(),
  periodId: z.string().uuid(),
  teachingAssignmentId: z.string().uuid(),
  acknowledgeConflict: z.preprocess(
    (value) => value === true || value === "true" || value === "on",
    z.boolean(),
  ),
  notes: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().min(1).max(500).optional(),
  ),
});

export type TimetablePeriodInput = z.infer<typeof timetablePeriodSchema>;
export type TimetableEntryInput = z.infer<typeof timetableEntrySchema>;
