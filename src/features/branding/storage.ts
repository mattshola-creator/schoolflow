import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import type { BrandingSession } from "./persistence";
import { BrandingOperationError } from "./persistence";
import { customBackgroundPermitted } from "./model";
const bucket = "schoolflow-branding";
function processor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url !== "https://afqykqlxecpzspjoyegc.supabase.co" || !key)
    throw new BrandingOperationError("storage_configuration");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
async function imageEligibility(session: BrandingSession) {
  const authority = await session.client.rpc("can_manage_school_branding", {
    org: session.organizationId,
    school: session.schoolId,
  });
  if (authority.error || authority.data !== true)
    throw new BrandingOperationError("42501");
  const result = await session.client.rpc("school_branding_images_allowed", {
    org: session.organizationId,
    school: session.schoolId,
  });
  if (result.error) throw new BrandingOperationError(result.error.code);
  if (result.data !== true || !customBackgroundPermitted(session.plan))
    throw new BrandingOperationError("42501");
}
export async function registerBackground(
  session: BrandingSession,
  bytes: Uint8Array,
) {
  await imageEligibility(session);
  const admin = processor();
  const id = randomUUID();
  const objectKey = `${session.organizationId}/${session.schoolId}/${id}.webp`;
  const meta = await sharp(bytes).metadata();
  const uploaded = await admin.storage.from(bucket).upload(objectKey, bytes, {
    contentType: "image/webp",
    upsert: false,
    cacheControl: "0",
  });
  if (uploaded.error) throw new BrandingOperationError("storage");
  // Recheck the current subscription after processing/upload. Orphans stay private and unregistered.
  await imageEligibility(session);
  const inserted = await admin.from("school_branding_assets").insert({
    id,
    organization_id: session.organizationId,
    school_id: session.schoolId,
    object_key: objectKey,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    byte_size: bytes.length,
    width: meta.width,
    height: meta.height,
    mime_type: "image/webp",
    processor_version: "schoolflow-sharp-webp-v1",
    created_by: session.userId,
  });
  if (inserted.error) throw new BrandingOperationError("registration");
  return { assetId: id };
}
export async function restoreAsset(
  session: BrandingSession,
  versionId: string,
) {
  const result = await processor()
    .from("school_branding_version_assets")
    .select("asset_id")
    .eq("organization_id", session.organizationId)
    .eq("school_id", session.schoolId)
    .eq("version_id", versionId)
    .maybeSingle();
  if (result.error) throw new BrandingOperationError("lookup");
  return result.data ? z.uuid().parse(result.data.asset_id) : null;
}
export async function signedBackground(
  session: BrandingSession,
  versionId: string,
) {
  await imageEligibility(session);
  // Owner-only callers must first prove this exact school version is RLS-readable.
  const version = await session.client
    .from("school_branding_versions")
    .select("id")
    .eq("organization_id", session.organizationId)
    .eq("school_id", session.schoolId)
    .eq("id", versionId)
    .maybeSingle();
  if (version.error || !version.data) throw new BrandingOperationError("42501");
  const assetId = await restoreAsset(session, versionId);
  if (!assetId) return { url: null, assetId: null, expiresIn: 60 };
  const admin = processor();
  const asset = await admin
    .from("school_branding_assets")
    .select("object_key")
    .eq("organization_id", session.organizationId)
    .eq("school_id", session.schoolId)
    .eq("id", assetId)
    .single();
  if (asset.error) throw new BrandingOperationError("lookup");
  const key = z.string().parse(asset.data.object_key);
  if (key !== `${session.organizationId}/${session.schoolId}/${assetId}.webp`)
    throw new BrandingOperationError("42501");
  const signed = await admin.storage.from(bucket).createSignedUrl(key, 60);
  if (signed.error) throw new BrandingOperationError("storage");
  return { url: signed.data.signedUrl, assetId, expiresIn: 60 };
}
