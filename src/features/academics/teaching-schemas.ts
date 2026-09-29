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
