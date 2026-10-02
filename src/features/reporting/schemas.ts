import { z } from "zod";

const optionalUuid = z.preprocess(
  (value) => value || undefined,
  z.string().uuid().optional(),
);

export const reportingFiltersSchema = z
  .object({
    schoolIds: z.array(z.string().uuid()).min(1).max(100),
    sessionId: optionalUuid,
    periodId: optionalUuid,
    dateFrom: z.iso.date(),
    dateTo: z.iso.date(),
  })
  .refine((value) => value.dateFrom <= value.dateTo, {
    message: "The start date must not be after the end date",
  });

export const reportingSearchSchema = z.object({
  query: z.string().trim().min(2).max(100),
  schoolIds: z.array(z.string().uuid()).min(1).max(100),
});

export const academicCloseSchema = z.object({
  targetId: z.string().uuid(),
  targetKind: z.enum(["period", "session"]),
  reason: z.string().trim().min(3).max(500),
});

export const sessionRolloverSchema = z
  .object({
    sourceSessionId: z.string().uuid(),
    targetName: z.string().trim().min(2).max(120),
    targetStart: z.iso.date(),
    targetEnd: z.iso.date(),
    idempotencyKey: z.string().uuid(),
  })
  .refine((value) => value.targetStart < value.targetEnd, {
    message: "The target session dates are invalid",
  });

export type ReportingFilters = z.infer<typeof reportingFiltersSchema>;
