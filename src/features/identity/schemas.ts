import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
});
export const signUpSchema = loginSchema.extend({
  fullName: z.string().trim().min(2).max(160),
});
export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});
export const passwordSchema = z
  .object({
    password: z.string().min(10).max(128),
    confirmPassword: z.string().min(10).max(128),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });
export const onboardingSchema = z.object({
  organizationName: z.string().trim().min(2).max(160),
  organizationSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(80),
  locationName: z.string().trim().min(2).max(160),
  schoolName: z.string().trim().min(2).max(180),
  schoolCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9][A-Z0-9_-]{1,31}$/),
});
export const invitationSchema = z.object({
  token: z.string().trim().min(32).max(512),
});
