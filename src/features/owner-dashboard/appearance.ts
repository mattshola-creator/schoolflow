import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { showroomThemes } from "@/features/showroom/catalog";
const known = (id: unknown): id is string =>
  typeof id === "string" &&
  (showroomThemes.some((t) => t.id === id) ||
    ["premium-emerald", "classic-light", "midnight-emerald"].includes(id));
/** Owner-only caller; user-client RLS and current entitlement predicates stay authoritative.
 * Only a curated theme ID crosses this boundary. No drafts, assets or subscription rows. */
export async function loadOwnerAppearance(
  client: SupabaseClient,
  userId: string,
  org: string,
  school: string,
) {
  const [state, preference] = await Promise.all([
    client
      .from("school_branding_state")
      .select("published_version_id")
      .eq("organization_id", org)
      .eq("school_id", school)
      .maybeSingle(),
    client
      .from("school_appearance_preferences")
      .select("theme_id")
      .eq("organization_id", org)
      .eq("school_id", school)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (state.error || preference.error)
    throw new Error("School appearance lookup failed");
  async function allowed(id: string) {
    const result = await client.rpc("school_branding_theme_allowed", {
      org,
      school,
      theme: id,
    });
    if (result.error || typeof result.data !== "boolean")
      throw new Error("School appearance entitlement lookup failed");
    return result.data;
  }
  let fallback = false;
  if (preference.data?.theme_id) {
    if (!known(preference.data.theme_id))
      throw new Error("Invalid individual appearance");
    if (await allowed(preference.data.theme_id))
      return {
        themeId: preference.data.theme_id,
        source: "personal" as const,
        fallback,
      };
    fallback = true;
  }
  if (state.data?.published_version_id) {
    const published = await client
      .from("school_branding_versions")
      .select("config")
      .eq("organization_id", org)
      .eq("school_id", school)
      .eq("id", state.data.published_version_id)
      .maybeSingle();
    if (published.error || !known(published.data?.config?.themeId))
      throw new Error("Published school appearance unavailable");
    if (await allowed(published.data.config.themeId))
      return {
        themeId: published.data.config.themeId,
        source: "published" as const,
        fallback,
      };
    fallback = true;
  }
  return { themeId: "emerald", source: "default" as const, fallback };
}
