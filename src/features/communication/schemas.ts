import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().trim().min(3).max(180),
  body: z.string().trim().min(1).max(10_000),
  priority: z.enum(["normal", "important", "urgent"]),
  audienceKind: z.enum(["school", "guardians", "students"]),
  expiresAt: z.string().datetime().optional(),
});

export const messageSchema = z.object({
  threadId: z.string().uuid(),
  body: z.string().trim().min(1).max(5_000),
  requestId: z.string().uuid(),
});

export const learnerSelectionSchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
});

export type NoticeInput = z.infer<typeof noticeSchema>;
