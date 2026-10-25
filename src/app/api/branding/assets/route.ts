import { z } from "zod";
import { BrandingOperationError } from "@/features/branding/persistence";
import {
  requireBrandingApiSession,
  brandingRequestGate,
  brandingFailure,
  privateJson,
} from "@/features/branding/http";
import {
  limitedRequestBody,
  optimizeBackground,
} from "@/features/branding/image";
import {
  MAX_BACKGROUND_BYTES,
  customBackgroundPermitted,
} from "@/features/branding/model";
import {
  registerBackground,
  signedBackground,
} from "@/features/branding/storage";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const denied = brandingRequestGate(request);
  if (denied) return denied;
  try {
    const session = await requireBrandingApiSession();
    if (!customBackgroundPermitted(session.plan))
      throw new BrandingOperationError("42501");
    let bytes: Uint8Array;
    try {
      bytes = await limitedRequestBody(request, MAX_BACKGROUND_BYTES + 65536);
    } catch {
      throw new BrandingOperationError("input");
    }
    let form: FormData;
    try {
      form = await new Response(new Uint8Array(bytes).buffer, {
        headers: { "Content-Type": request.headers.get("content-type") ?? "" },
      }).formData();
    } catch {
      throw new BrandingOperationError("input");
    }
    if (form.get("schoolId") !== session.schoolId)
      throw new BrandingOperationError("42501");
    const file = form.get("image");
    if (!(file instanceof File)) throw new BrandingOperationError("input");
    let output: Uint8Array;
    try {
      output = await optimizeBackground(
        new Uint8Array(await file.arrayBuffer()),
        file.type,
        form.has("crop") ? JSON.parse(String(form.get("crop"))) : undefined,
      );
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid image, dimensions or crop" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    return privateJson(await registerBackground(session, output));
  } catch (error) {
    return brandingFailure(error);
  }
}
export async function GET(request: Request) {
  const denied = brandingRequestGate(request);
  if (denied) return denied;
  try {
    const session = await requireBrandingApiSession();
    const params = new URL(request.url).searchParams;
    if (params.get("schoolId") !== session.schoolId)
      throw new BrandingOperationError("42501");
    return privateJson(
      await signedBackground(session, z.uuid().parse(params.get("versionId"))),
    );
  } catch (error) {
    return brandingFailure(error);
  }
}
