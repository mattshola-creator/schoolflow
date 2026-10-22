import { z } from "zod";
import {
  resolveShowroomTheme,
  showroomThemes,
  type ShowroomPlan,
} from "@/features/showroom/catalog";
export const MAX_BACKGROUND_BYTES = 5 * 1024 * 1024;
export const cropSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().positive().max(1),
    height: z.number().positive().max(1),
  })
  .refine(
    (c) => c.x + c.width <= 1 && c.y + c.height <= 1,
    "Crop must stay within the image",
  );
export const appearanceSchema = z.object({
  themeId: z
    .string()
    .refine(
      (id) =>
        showroomThemes.some((t) => t.id === id) ||
        ["premium-emerald", "classic-light", "midnight-emerald"].includes(id),
      "Unknown curated theme",
    ),
  preset: z.enum(["executive", "analytics", "action-first"]),
  focalX: z.number().min(0).max(100),
  focalY: z.number().min(0).max(100),
  overlay: z.number().min(0.65).max(0.85),
  crop: cropSchema.optional(),
});
export type BrandingAppearance = z.infer<typeof appearanceSchema>;
export function themePermitted(id: string, plan: ShowroomPlan) {
  const parsed = appearanceSchema.shape.themeId.safeParse(id);
  if (!parsed.success) return false;
  const theme = resolveShowroomTheme(id);
  return (
    theme.tier === "core" ||
    (theme.tier === "composition" && plan !== "starter") ||
    ((plan === "professional" || plan === "enterprise") &&
      theme.tier === "collection")
  );
}
export function customBackgroundPermitted(plan: ShowroomPlan) {
  return plan === "professional" || plan === "enterprise";
}
export function validatedAppearance(input: unknown, plan: ShowroomPlan) {
  const value = appearanceSchema.parse(input);
  if (!themePermitted(value.themeId, plan))
    throw new Error("Theme is not included in the effective subscription");
  return value;
}
