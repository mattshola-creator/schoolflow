import { z } from "zod";

const optionalId = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().uuid().optional(),
);

export const teachingAssignmentSchema = z
  .object({
    sessionId: z.string().uuid(),
    staffAssignmentId: z.string().uuid(),
    subjectId: optionalId,
    classLevelId: z.string().uuid(),
    classArmId: optionalId,
    assignmentType: z.enum(["class_teacher", "subject_teacher"]),
    status: z.enum(["planned", "active", "ended", "cancelled"]),
    startedOn: z.iso.date(),
    endedOn: z.iso.date().optional(),
  })
  .superRefine((value, context) => {
    if (value.assignmentType === "subject_teacher" && !value.subjectId)
      context.addIssue({
        code: "custom",
        path: ["subjectId"],
        message: "A subject teacher requires a subject.",
      });
    if (value.status === "ended" && !value.endedOn)
      context.addIssue({
        code: "custom",
        path: ["endedOn"],
        message: "An ended assignment requires an end date.",
      });
    if (value.endedOn && value.endedOn < value.startedOn)
      context.addIssue({
        code: "custom",
        path: ["endedOn"],
        message: "The end date cannot precede the start date.",
      });
  });
