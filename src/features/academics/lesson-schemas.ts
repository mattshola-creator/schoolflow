import { z } from "zod";

const optionalId = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().uuid().optional(),
);

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().min(2).max(maximum).optional(),
  );

export const lessonPlanSchema = z.object({
  sessionId: z.string().uuid(),
  academicPeriodId: optionalId,
  teachingAssignmentId: z.string().uuid(),
  curriculumItemId: optionalId,
  lessonDate: z.iso.date(),
  topic: z.string().trim().min(2).max(160),
  objectives: z.string().trim().min(2).max(3000),
  contentOutline: z.string().trim().min(2).max(6000),
  teachingResources: optionalText(2000),
});

export const lessonPlanReviewSchema = z
  .object({
    lessonPlanId: z.string().uuid(),
    status: z.enum(["draft", "submitted", "approved", "rejected", "withdrawn"]),
    reviewComment: optionalText(2000),
  })
  .superRefine((value, context) => {
    if (value.status === "rejected" && !value.reviewComment)
      context.addIssue({
        code: "custom",
        path: ["reviewComment"],
        message: "A rejected lesson plan requires a review comment.",
      });
    if (!["approved", "rejected"].includes(value.status) && value.reviewComment)
      context.addIssue({
        code: "custom",
        path: ["reviewComment"],
        message: "Only reviewed lesson plans can retain a review comment.",
      });
  });

export const lessonDeliverySchema = z.object({
  sessionId: z.string().uuid(),
  academicPeriodId: optionalId,
  teachingAssignmentId: z.string().uuid(),
  lessonPlanId: optionalId,
  curriculumItemId: optionalId,
  deliveredOn: z.iso.date(),
  topic: z.string().trim().min(2).max(160),
  coverageNotes: z.string().trim().min(2).max(4000),
  classwork: optionalText(3000),
  homework: optionalText(3000),
  reflection: optionalText(3000),
  status: z.enum([
    "scheduled",
    "delivered",
    "partially_delivered",
    "cancelled",
  ]),
});

export const homeworkAssignmentSchema = z
  .object({
    sessionId: z.string().uuid(),
    academicPeriodId: optionalId,
    teachingAssignmentId: z.string().uuid(),
    lessonDeliveryId: optionalId,
    curriculumItemId: optionalId,
    title: z.string().trim().min(2).max(160),
    instructions: z.string().trim().min(2).max(6000),
    assignedOn: z.iso.date(),
    dueOn: z.iso.date(),
  })
  .refine((value) => value.dueOn >= value.assignedOn, {
    path: ["dueOn"],
    message: "The due date cannot be before the assigned date.",
  });

export const homeworkStatusSchema = z.object({
  homeworkAssignmentId: z.string().uuid(),
  status: z.enum(["draft", "published", "closed", "cancelled"]),
});

export type LessonPlanInput = z.infer<typeof lessonPlanSchema>;
export type LessonPlanReviewInput = z.infer<typeof lessonPlanReviewSchema>;
export type LessonDeliveryInput = z.infer<typeof lessonDeliverySchema>;
export type HomeworkAssignmentInput = z.infer<typeof homeworkAssignmentSchema>;
export type HomeworkStatusInput = z.infer<typeof homeworkStatusSchema>;
