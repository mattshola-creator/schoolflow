import { z } from "zod";

const optionalUuid = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().uuid().optional(),
);

const money = z
  .string()
  .trim()
  .regex(
    /^\d{1,12}(?:\.\d{1,2})?$/,
    "Enter an amount with up to two decimal places",
  )
  .transform((value) => Number(value).toFixed(2));

export const feeCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9][A-Z0-9_-]{1,19}$/),
  name: z.string().trim().min(2).max(120),
  frequency: z.enum(["one_time", "term", "session"]),
  description: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().max(500).optional(),
  ),
});

export const feeStructureSchema = z
  .object({
    name: z.string().trim().min(3).max(160),
    sessionId: z.string().uuid(),
    periodId: optionalUuid,
    classLevelId: optionalUuid,
    studentCategoryId: optionalUuid,
    effectiveFrom: z.iso.date(),
    effectiveTo: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.iso.date().optional(),
    ),
    feeCategoryId: z.string().uuid(),
    amount: money,
    dueDate: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.iso.date().optional(),
    ),
  })
  .refine(
    (value) => !value.effectiveTo || value.effectiveTo >= value.effectiveFrom,
    {
      path: ["effectiveTo"],
      message: "The effective end cannot precede the start.",
    },
  );

export const structureActionSchema = z.object({
  structureId: z.string().uuid(),
});
export const billingRunSchema = structureActionSchema.extend({
  idempotencyKey: z.string().uuid(),
});

export const paymentSchema = z.object({
  studentId: optionalUuid,
  sessionId: optionalUuid,
  periodId: optionalUuid,
  amount: money,
  method: z.enum(["cash", "bank_transfer", "pos", "other"]),
  reference: z.string().trim().max(120).optional(),
  paidAt: z.iso.datetime({ local: true }),
  payerName: z.string().trim().min(2).max(160),
  notes: z.string().trim().max(1000).optional(),
  idempotencyKey: z.string().uuid(),
});
export const paymentDecisionSchema = z.object({
  paymentId: z.string().uuid(),
  approve: z.enum(["true", "false"]).transform((value) => value === "true"),
  note: z.string().trim().min(2).max(500),
});
export const allocationSchema = z.object({
  paymentId: z.string().uuid(),
  chargeId: z.string().uuid(),
  amount: money,
});
export const receiptSchema = z.object({ paymentId: z.string().uuid() });
export const paymentReversalSchema = z.object({
  paymentId: z.string().uuid(),
  reason: z.string().trim().min(3).max(500),
});
export const expenseSchema = z.object({
  expenseCategoryId: z.string().uuid(),
  sessionId: optionalUuid,
  periodId: optionalUuid,
  kind: z.enum(["expense", "cash_advance", "petty_cash"]),
  description: z.string().trim().min(3).max(1000),
  requestedAmount: money,
  expenseDate: z.iso.date(),
});
export const financeCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9][A-Z0-9_-]{1,19}$/),
  name: z.string().trim().min(2).max(120),
});
export const otherIncomeSchema = z.object({
  incomeCategoryId: z.string().uuid(),
  amount: money,
  receivedAt: z.iso.datetime({ local: true }),
  payerName: z.string().trim().min(2).max(160),
  reference: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
  idempotencyKey: z.string().uuid(),
});
export const expenseDecisionSchema = z.object({
  expenseId: z.string().uuid(),
  approve: z.enum(["true", "false"]).transform((value) => value === "true"),
  approvedAmount: money,
  note: z.string().trim().min(2).max(500),
});
export const expensePaymentSchema = z.object({
  expenseId: z.string().uuid(),
  documentId: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
});
export const expenseCompletionSchema = z.object({
  expenseId: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
});
export const cashierOpenSchema = z.object({ openingCash: money });
export const cashierCloseSchema = z.object({
  sessionId: z.string().uuid(),
  countedCash: money,
  note: z.string().trim().max(500).optional(),
});
export const cashHandoverSchema = z.object({
  sessionId: z.string().uuid(),
  amount: money,
  handedTo: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
});
export const reconciliationSchema = z.object({
  paymentId: z.string().uuid(),
  statementDate: z.iso.date(),
  method: z.enum(["cash", "bank_transfer", "pos", "other"]),
  expectedAmount: money,
  actualAmount: money,
  reference: z.string().trim().max(120).optional(),
  note: z.string().trim().max(500).optional(),
});

export type FeeCategoryInput = z.infer<typeof feeCategorySchema>;
export type FeeStructureInput = z.infer<typeof feeStructureSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
