import { z } from "zod";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(maximum).nullable(),
  );

const optionalUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().uuid().nullable(),
);

export const departmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: optionalText(16).refine(
    (value) => value === null || /^[A-Z0-9][A-Z0-9_-]{0,15}$/.test(value),
    "Use uppercase letters, numbers, hyphens, or underscores",
  ),
});

export const positionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: optionalText(16).refine(
    (value) => value === null || /^[A-Z0-9][A-Z0-9_-]{0,15}$/.test(value),
    "Use uppercase letters, numbers, hyphens, or underscores",
  ),
  departmentId: optionalUuid,
  isTeaching: z.preprocess((value) => value === "on", z.boolean()),
});

export const employmentTypes = [
  "permanent",
  "probationary",
  "contract",
  "temporary",
  "part_time",
  "volunteer",
] as const;

export const staffSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    staffNumber: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .regex(/^[A-Za-z0-9][A-Za-z0-9/_-]+$/),
    workEmail: optionalText(254).refine(
      (value) => value === null || z.email().safeParse(value).success,
      "Enter a valid work email",
    ),
    phone: optionalText(30).refine(
      (value) => value === null || value.length >= 7,
      "Enter a valid phone number",
    ),
    employmentType: z.enum(employmentTypes),
    startedOn: z.iso.date(),
    departmentId: optionalUuid,
    positionId: z.string().uuid(),
    linkedUserId: optionalUuid,
    linkedRoleId: optionalUuid,
  })
  .refine(
    (value) =>
      (value.linkedUserId === null && value.linkedRoleId === null) ||
      (value.linkedUserId !== null && value.linkedRoleId !== null),
    { message: "A linked user and role must be selected together" },
  );

export const staffSearchSchema = z.object({
  query: z.string().trim().max(100).catch(""),
  page: z.coerce.number().int().min(1).catch(1),
});

export const endEmploymentSchema = z.object({
  employmentId: z.string().uuid(),
  endedOn: z.iso.date(),
  reason: z.string().trim().min(3).max(500),
});

export const transferAssignmentSchema = z.object({
  assignmentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  departmentId: optionalUuid,
  positionId: z.string().uuid(),
  startedOn: z.iso.date(),
});
