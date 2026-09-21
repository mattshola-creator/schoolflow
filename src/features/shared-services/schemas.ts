import { z } from "zod";

const optionalUuid = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(z.uuid().optional());

export const taskSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional().default(""),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  ownerUserId: optionalUuid,
  dueAt: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .pipe(z.iso.datetime({ local: true, precision: -1 }).optional()),
});

export const taskStatusSchema = z.object({
  taskId: z.uuid(),
  status: z.enum(["open", "in_progress", "completed", "cancelled"]),
});

export const documentMetadataSchema = z.object({
  title: z.string().trim().min(2).max(160),
  entityType: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]{1,79}$/)
    .optional()
    .or(z.literal("")),
  entityId: optionalUuid,
});

export const allowedDocumentTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/csv",
]);
export const maxDocumentBytes = 10 * 1024 * 1024;

export const approvalPolicySchema = z.object({
  key: z
    .string()
    .trim()
    .regex(/^[a-z]+(?:[._][a-z]+)*$/),
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).optional().default(""),
  approverRoleId: z.uuid(),
});

export const approvalRequestSchema = z.object({
  policyId: z.uuid(),
  subjectType: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]{1,79}$/),
  subjectId: z.uuid(),
  title: z.string().trim().min(3).max(160),
});

export const approvalDecisionSchema = z.object({
  requestId: z.uuid(),
  decision: z.enum(["approved", "rejected", "returned"]),
  comment: z.string().trim().max(1000).optional().default(""),
});
