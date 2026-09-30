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

export type FeeCategoryInput = z.infer<typeof feeCategorySchema>;
export type FeeStructureInput = z.infer<typeof feeStructureSchema>;
