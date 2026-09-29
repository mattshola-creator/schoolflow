import { z } from "zod";

const optionalId = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().uuid().optional(),
);

export const curriculumItemSchema = z
  .object({
    sessionId: z.string().uuid(),
    academicPeriodId: optionalId,
    teachingAssignmentId: z.string().uuid(),
    sequence: z.coerce.number().int().min(1).max(999),
    title: z.string().trim().min(2).max(160),
    learningObjectives: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.string().trim().min(2).max(2000).optional(),
    ),
    plannedStart: z.iso.date(),
    plannedEnd: z.iso.date(),
  })
  .refine((value) => value.plannedEnd >= value.plannedStart, {
    path: ["plannedEnd"],
    message: "The planned end cannot precede the planned start.",
  });

export const curriculumCoverageSchema = z
  .object({
    curriculumItemId: z.string().uuid(),
    status: z.enum([
      "planned",
      "in_progress",
      "completed",
      "deferred",
      "cancelled",
    ]),
    completedOn: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.iso.date().optional(),
    ),
  })
  .superRefine((value, context) => {
    if (value.status === "completed" && !value.completedOn)
      context.addIssue({
        code: "custom",
        path: ["completedOn"],
        message: "Completed curriculum requires a completion date.",
      });
    if (value.status !== "completed" && value.completedOn)
      context.addIssue({
        code: "custom",
        path: ["completedOn"],
        message: "Only completed curriculum can retain a completion date.",
      });
  });

export type CurriculumItemInput = z.infer<typeof curriculumItemSchema>;
export type CurriculumCoverageInput = z.infer<typeof curriculumCoverageSchema>;
