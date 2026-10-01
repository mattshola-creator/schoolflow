import { z } from "zod";

const optionalUuid = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().uuid().optional(),
);
const mark = z.coerce.number().finite().min(0).max(1000);

export const assessmentSchemeSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    sessionId: z.string().uuid(),
    periodId: z.string().uuid(),
    classLevelId: z.string().uuid(),
    subjectId: optionalUuid,
    totalMark: mark.positive(),
    passMark: mark,
  })
  .refine((value) => value.passMark <= value.totalMark, {
    path: ["passMark"],
    message: "Pass mark cannot exceed the total mark",
  });

export const assessmentComponentSchema = z.object({
  schemeId: z.string().uuid(),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9][A-Z0-9_-]{0,19}$/),
  name: z.string().trim().min(2).max(80),
  maximumScore: mark.positive(),
  weightPercent: z.coerce.number().positive().max(100),
  sequence: z.coerce.number().int().min(1).max(50),
});

export const gradeBandSchema = z
  .object({
    schemeId: z.string().uuid(),
    minimumPercent: z.coerce.number().min(0).max(100),
    maximumPercent: z.coerce.number().min(0).max(100),
    grade: z.string().trim().min(1).max(12),
    remark: z.string().trim().min(1).max(120),
    isPass: z.coerce.boolean(),
    sequence: z.coerce.number().int().min(1).max(50),
  })
  .refine((value) => value.minimumPercent <= value.maximumPercent, {
    path: ["maximumPercent"],
    message: "Maximum must be at least the minimum",
  });

export const scoreSchema = z.object({
  batchId: z.string().uuid(),
  studentId: z.string().uuid(),
  componentId: z.string().uuid(),
  score: mark,
});

export const resultBatchSchema = z.object({
  sessionId: z.string().uuid(),
  periodId: z.string().uuid(),
  classLevelId: z.string().uuid(),
  classArmId: optionalUuid,
  subjectId: z.string().uuid(),
  schemeId: z.string().uuid(),
  teachingAssignmentId: optionalUuid,
});

export const resultTransitionSchema = z.object({
  batchId: z.string().uuid(),
  status: z.enum(["submitted", "reviewed", "approved", "published"]),
});

export const correctionSchema = z.object({
  batchId: z.string().uuid(),
  reason: z.string().trim().min(3).max(500),
});

export const promotionSchema = z
  .object({
    studentId: z.string().uuid(),
    sourcePeriodId: z.string().uuid(),
    outcome: z.enum(["promoted", "repeated", "graduated", "transferred"]),
    targetSessionId: optionalUuid,
    targetClassLevelId: optionalUuid,
    targetClassArmId: optionalUuid,
    idempotencyKey: z.string().trim().min(8).max(120),
    notes: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) =>
      !["promoted", "repeated"].includes(value.outcome) ||
      Boolean(value.targetSessionId && value.targetClassLevelId),
    {
      path: ["targetSessionId"],
      message: "A target session and level are required",
    },
  );

export type AssessmentSchemeInput = z.infer<typeof assessmentSchemeSchema>;
export type ScoreInput = z.infer<typeof scoreSchema>;
export type PromotionInput = z.infer<typeof promotionSchema>;
