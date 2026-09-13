import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().nullable(),
);

export const studentSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  studentNumber: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[A-Za-z0-9][A-Za-z0-9/_-]+$/),
  dateOfBirth: z.iso.date(),
  gender: optionalText.pipe(z.string().max(40).nullable()),
  sessionId: z.string().uuid(),
  levelId: z.string().uuid(),
  armId: optionalText.pipe(z.string().uuid().nullable()),
  enrolledOn: z.iso.date(),
  guardianFirstName: optionalText.pipe(z.string().max(100).nullable()),
  guardianLastName: optionalText.pipe(z.string().max(100).nullable()),
  guardianRelationship: optionalText.pipe(z.string().max(60).nullable()),
  guardianPrimary: z.preprocess((value) => value === "on", z.boolean()),
  guardianFinancial: z.preprocess((value) => value === "on", z.boolean()),
});

export const studentSearchSchema = z.object({
  query: z.string().trim().max(100).catch(""),
  page: z.coerce.number().int().min(1).catch(1),
});

export const importPreviewSchema = z.object({
  sourceName: z.string().trim().min(1).max(160),
  csv: z.string().min(1).max(500_000),
});
