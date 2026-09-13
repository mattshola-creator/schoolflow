import { z } from "zod";

const id = z.string().uuid();
const shortName = z.string().trim().min(2).max(120);
const optionalCode = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9][A-Z0-9_-]{0,23}$/)
    .optional(),
);
const order = z.coerce.number().int().min(1).max(999);

export const settingsSchema = z.object({
  periodLabel: z.string().trim().min(2).max(40),
  weekStartsOn: z.coerce.number().int().min(0).max(6),
});

export const sessionSchema = z
  .object({
    name: z.string().trim().min(3).max(40),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    makeCurrent: z.coerce.boolean().optional().default(false),
  })
  .refine((value) => value.endDate > value.startDate, {
    message: "The session end date must be after its start date.",
    path: ["endDate"],
  });

export const periodSchema = z
  .object({
    sessionId: id,
    name: shortName,
    sequence: z.coerce.number().int().min(1).max(24),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    makeCurrent: z.coerce.boolean().optional().default(false),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "The period end date cannot precede its start date.",
    path: ["endDate"],
  });

export const sectionSchema = z.object({
  name: shortName,
  code: optionalCode,
  sortOrder: order,
});

export const levelSchema = z.object({
  name: z.string().trim().min(1).max(80),
  code: optionalCode,
  sectionId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    id.optional(),
  ),
  sortOrder: order,
});

export const armSchema = z.object({
  classLevelId: id,
  name: z.string().trim().min(1).max(80),
  code: optionalCode,
  sortOrder: order,
});

export const subjectSchema = z.object({
  name: shortName,
  code: optionalCode,
  classLevelId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    id.optional(),
  ),
  classification: z.enum(["core", "elective"]).default("core"),
  sortOrder: order,
});

export const lockSchema = z
  .object({
    scope: z.enum(["school_setup", "session", "period"]),
    sessionId: z.preprocess(
      (value) => (value === "" ? undefined : value),
      id.optional(),
    ),
    periodId: z.preprocess(
      (value) => (value === "" ? undefined : value),
      id.optional(),
    ),
    reason: z.string().trim().min(3).max(500),
  })
  .superRefine((value, context) => {
    if (value.scope === "school_setup" && (value.sessionId || value.periodId))
      context.addIssue({
        code: "custom",
        message: "A school setup lock cannot target a session or period.",
      });
    if (value.scope === "session" && (!value.sessionId || value.periodId))
      context.addIssue({
        code: "custom",
        message: "A session lock requires only a session.",
      });
    if (value.scope === "period" && (!value.sessionId || !value.periodId))
      context.addIssue({
        code: "custom",
        message: "A period lock requires its session and period.",
      });
  });

export const unlockSchema = z.object({
  lockId: id,
  reason: z.string().trim().min(3).max(500),
});
