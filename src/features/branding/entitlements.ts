import type { ShowroomPlan } from "@/features/showroom/catalog";
type Probe = (
  name: "school_branding_theme_allowed" | "school_branding_images_allowed",
  args: Record<string, string>,
) => Promise<{ data: unknown; error: unknown }>;
/** Gallery access profile only; never a billing-plan identifier or authority grant. */
export async function readGalleryAccess(
  probe: Probe,
  org: string,
  school: string,
): Promise<ShowroomPlan | null> {
  const results = await Promise.all([
    probe("school_branding_theme_allowed", { org, school, theme: "emerald" }),
    probe("school_branding_theme_allowed", { org, school, theme: "obsidian" }),
    probe("school_branding_images_allowed", { org, school }),
  ]);
  if (results.some((r) => r.error || typeof r.data !== "boolean"))
    throw new Error("Branding entitlement lookup failed");
  if (results[0].data !== true) return null;
  return results[2].data === true
    ? "professional"
    : results[1].data === true
      ? "growth"
      : "starter";
}
