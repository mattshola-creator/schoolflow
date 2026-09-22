import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(max).optional(),
  );

export const applicationStatuses = [
  "enquiry",
  "application_started",
  "submitted",
  "under_review",
  "exam_scheduled",
  "exam_taken",
  "under_assessment",
  "retake",
  "approved",
  "rejected",
  "admission_offered",
  "accepted",
  "enrollment_pending",
  "enrolled",
  "withdrawn",
  "cancelled",
  "incomplete",
  "expired",
] as const;

export const admissionApplicationSchema = z
  .object({
    applicationNumber: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9][A-Za-z0-9/_-]+$/),
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    dateOfBirth: z.iso
      .date()
      .refine((value) => value <= new Date().toISOString().slice(0, 10)),
    gender: optionalText(40),
    source: z.enum(["enquiry", "staff", "parent_online", "import"]),
    sessionId: z.uuid(),
    levelId: z.uuid(),
    previousClass: optionalText(100),
    guardianFirstName: optionalText(100),
    guardianLastName: optionalText(100),
    guardianRelationship: optionalText(60),
    guardianEmail: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z.email().max(254).optional(),
    ),
    guardianPhone: optionalText(30),
  })
  .superRefine((value, context) => {
    const guardianValues = [
      value.guardianFirstName,
      value.guardianLastName,
      value.guardianRelationship,
    ];
    if (guardianValues.some(Boolean) && !guardianValues.every(Boolean)) {
      context.addIssue({
        code: "custom",
        path: ["guardianFirstName"],
        message: "Complete the guardian name and relationship",
      });
    }
  });

export const admissionSearchSchema = z.object({
  query: z.string().trim().max(80).catch(""),
  status: z.enum(applicationStatuses).optional().catch(undefined),
  page: z.coerce.number().int().positive().catch(1),
});

export const statusTransitionSchema = z.object({
  applicationId: z.uuid(),
  status: z.enum(applicationStatuses),
});

export const assessmentSchema = z
  .object({
    applicationId: z.uuid(),
    scheduledAt: z.iso.datetime({ local: true }),
    score: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().min(0).optional(),
    ),
    maximumScore: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().positive().optional(),
    ),
    notes: optionalText(2000),
  })
  .superRefine((value, context) => {
    if (value.score !== undefined && value.maximumScore === undefined)
      context.addIssue({
        code: "custom",
        path: ["maximumScore"],
        message: "Maximum score is required",
      });
    if (
      value.score !== undefined &&
      value.maximumScore !== undefined &&
      value.score > value.maximumScore
    )
      context.addIssue({
        code: "custom",
        path: ["score"],
        message: "Score cannot exceed maximum",
      });
  });

export const decisionSchema = z.object({
  applicationId: z.uuid(),
  decision: z.enum(["approved", "rejected", "retake"]),
  levelId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.uuid().optional(),
  ),
  rationale: z.string().trim().min(3).max(2000),
});

export const offerSchema = z.object({
  applicationId: z.uuid(),
  sessionId: z.uuid(),
  levelId: z.uuid(),
  armId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.uuid().optional(),
  ),
  expiresAt: z.iso.datetime({ local: true }),
});

export const offerResponseSchema = z.object({
  applicationId: z.uuid(),
  response: z.enum(["accept", "decline"]),
});

export const checklistSchema = z.object({
  applicationId: z.uuid(),
  itemId: z.uuid(),
  status: z.enum(["pending", "complete", "waived"]),
});

export const admissionDocumentPolicySchema = z.object({
  categoryKey: z
    .string()
    .trim()
    .regex(/^[a-z]+(?:_[a-z]+)*$/),
  label: z.string().trim().min(2).max(120),
  required: z.preprocess((value) => value === "on", z.boolean()),
  enabled: z.preprocess((value) => value === "on", z.boolean()),
});

export const admissionDocumentInitializeSchema = z.object({
  applicationId: z.uuid(),
});

export const admissionDocumentSubmitSchema = z.object({
  applicationId: z.uuid(),
  requirementId: z.uuid(),
  documentId: z.uuid(),
});

export const admissionDocumentReviewSchema = z.object({
  applicationId: z.uuid(),
  requirementId: z.uuid(),
  status: z.enum(["verified", "rejected", "not_applicable"]),
  comment: optionalText(1000),
});

export const enrollmentConversionSchema = z.object({
  applicationId: z.uuid(),
  studentNumber: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[A-Za-z0-9][A-Za-z0-9/_-]+$/),
  enrolledOn: z.iso.date(),
});

const allowedTransitions: Record<
  (typeof applicationStatuses)[number],
  readonly string[]
> = {
  enquiry: ["application_started", "cancelled"],
  application_started: ["submitted", "incomplete", "cancelled"],
  incomplete: ["submitted", "cancelled", "expired"],
  submitted: ["under_review", "withdrawn"],
  under_review: [
    "exam_scheduled",
    "approved",
    "rejected",
    "incomplete",
    "withdrawn",
  ],
  exam_scheduled: ["exam_taken", "cancelled"],
  exam_taken: ["under_assessment"],
  under_assessment: ["retake", "approved", "rejected"],
  retake: ["exam_scheduled"],
  approved: ["admission_offered"],
  admission_offered: ["accepted", "withdrawn", "expired"],
  accepted: ["enrollment_pending"],
  enrollment_pending: ["enrolled"],
  rejected: [],
  enrolled: [],
  withdrawn: [],
  cancelled: [],
  expired: [],
};

export function allowedAdmissionTransitions(
  status: (typeof applicationStatuses)[number],
) {
  return allowedTransitions[status];
}
