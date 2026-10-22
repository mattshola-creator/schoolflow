import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/auth";
import { requireBrandingContext } from "./context";
import { appearanceSchema, themePermitted } from "./model";
export const revisionSchema = z
  .number()
  .int()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER);
const configSchema = appearanceSchema.omit({ crop: true }).strict();
const versionSchema = z.object({
  id: z.uuid(),
  version: z.coerce.number().int().positive(),
  config: configSchema,
  restored_from: z.uuid().nullable(),
  created_at: z.string(),
});
const stateSchema = z.object({
  revision: z.coerce.number().pipe(revisionSchema),
  draft_version_id: z.uuid().nullable(),
  published_version_id: z.uuid().nullable(),
});
export class BrandingOperationError extends Error {
  constructor(public code: string) {
    super(
      code === "input"
        ? "Invalid appearance request."
        : code === "40001"
          ? "Appearance changed. Reload before saving or publishing."
          : "Branding operation unavailable.",
    );
  }
}
export async function brandingSession() {
  const context = await requireBrandingContext();
  const { supabase, user } = await requireUser();
  // New QA tables/RPCs have an isolated runtime-validated boundary until generated types are refreshed.
  return {
    ...context,
    userId: user.id,
    client: supabase as unknown as SupabaseClient,
  };
}
export type BrandingSession = Awaited<ReturnType<typeof brandingSession>>;
export async function loadBranding(session: BrandingSession) {
  const { client, organizationId: org, schoolId: school, plan } = session;
  const [state, versions] = await Promise.all([
    client
      .from("school_branding_state")
      .select("revision,draft_version_id,published_version_id")
      .eq("organization_id", org)
      .eq("school_id", school)
      .maybeSingle(),
    client
      .from("school_branding_versions")
      .select("id,version,config,restored_from,created_at")
      .eq("organization_id", org)
      .eq("school_id", school)
      .order("version", { ascending: false })
      .limit(30),
  ]);
  if (state.error || versions.error) throw new BrandingOperationError("lookup");
  const current = state.data
    ? stateSchema.parse(state.data)
    : { revision: 0, draft_version_id: null, published_version_id: null };
  const history = z.array(versionSchema).parse(versions.data);
  // The published version may be older than the history page.
  let published =
    history.find((v) => v.id === current.published_version_id) ?? null;
  if (!published && current.published_version_id) {
    const result = await client
      .from("school_branding_versions")
      .select("id,version,config,restored_from,created_at")
      .eq("organization_id", org)
      .eq("school_id", school)
      .eq("id", current.published_version_id)
      .single();
    if (result.error) throw new BrandingOperationError("lookup");
    published = versionSchema.parse(result.data);
  }
  const fallback = {
    themeId: "emerald",
    preset: "executive" as const,
    focalX: 50,
    focalY: 50,
    overlay: 0.65,
  };
  const effective =
    published && themePermitted(published.config.themeId, plan)
      ? published.config
      : fallback;
  return {
    schoolId: school,
    ...current,
    history,
    effective,
    premiumFallback: Boolean(
      published && !themePermitted(published.config.themeId, plan),
    ),
  };
}
export type BrandingSnapshot = Awaited<ReturnType<typeof loadBranding>>;
export const mutationSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("save"),
    schoolId: z.uuid(),
    revision: revisionSchema,
    requestId: z.uuid(),
    config: configSchema,
    assetId: z.uuid().nullable(),
  }),
  z.object({
    operation: z.literal("publish"),
    schoolId: z.uuid(),
    revision: revisionSchema,
    versionId: z.uuid(),
  }),
  z.object({
    operation: z.literal("restore"),
    schoolId: z.uuid(),
    revision: revisionSchema,
    requestId: z.uuid(),
    versionId: z.uuid(),
  }),
]);
export async function mutateBranding(session: BrandingSession, input: unknown) {
  const value = mutationSchema.parse(input);
  if (value.schoolId !== session.schoolId)
    throw new BrandingOperationError("42501");
  const common = {
    org: session.organizationId,
    school: session.schoolId,
    expected_revision: value.revision,
  };
  let result;
  if (value.operation === "publish")
    result = await session.client.rpc("publish_school_branding", {
      ...common,
      target_version: value.versionId,
    });
  else {
    let config;
    let asset: string | null = null;
    let restore: string | null = null;
    if (value.operation === "restore") {
      const source = await session.client
        .from("school_branding_versions")
        .select("config")
        .eq("organization_id", session.organizationId)
        .eq("school_id", session.schoolId)
        .eq("id", value.versionId)
        .single();
      if (source.error) throw new BrandingOperationError("42501");
      config = configSchema.parse(source.data.config);
      restore = value.versionId;
      // Bindings are deliberately service-only. Resolve them through a narrowly scoped server lookup.
      const { restoreAsset } = await import("./storage");
      asset = await restoreAsset(session, value.versionId);
    } else {
      config = value.config;
      asset = value.assetId;
    }
    if (!themePermitted(config.themeId, session.plan))
      throw new BrandingOperationError("42501");
    const args = {
      ...common,
      request_id: value.requestId,
      config,
      restore_version: restore,
    };
    result = asset
      ? await session.client.rpc("save_school_branding_asset_draft", {
          ...args,
          asset,
        })
      : await session.client.rpc("save_school_branding_draft", args);
  }
  if (result.error) throw new BrandingOperationError(result.error.code);
  return loadBranding(session);
}
