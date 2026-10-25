import { NextRequest, NextResponse } from "next/server";
import {
  isQaProvisioningOrigin,
  isQaInvitationHost,
} from "@/features/administration/qa-provisioning";
import { AuthorizationError } from "@/lib/authorization";
import {
  BrandingSubscriptionError,
  requireBrandingContext,
} from "@/features/branding/context";
import {
  customBackgroundPermitted,
  MAX_BACKGROUND_BYTES,
} from "@/features/branding/model";
import {
  limitedRequestBody,
  optimizeBackground,
} from "@/features/branding/image";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (
    process.env.SCHOOLFLOW_SHELL_REVIEW !== "true" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL !==
      "https://afqykqlxecpzspjoyegc.supabase.co"
  )
    return new NextResponse(null, { status: 404 });
  const origin = request.headers.get("origin");
  const host = (
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  )
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  if (
    !isQaProvisioningOrigin(origin) ||
    !host ||
    !isQaInvitationHost(host) ||
    new URL(origin!).host !== host
  )
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });
  try {
    const context = await requireBrandingContext();
    if (!customBackgroundPermitted(context.plan))
      return NextResponse.json(
        {
          error:
            "Custom backgrounds require an eligible effective subscription",
        },
        { status: 403 },
      );
  } catch (error) {
    if (
      error instanceof AuthorizationError ||
      error instanceof BrandingSubscriptionError
    )
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    throw error;
  }
  try {
    const bytes = await limitedRequestBody(
      request,
      MAX_BACKGROUND_BYTES + 65536,
    );
    const form = await new Response(bytes.buffer, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
    const file = form.get("image");
    if (!(file instanceof File))
      return NextResponse.json({ error: "Choose an image" }, { status: 400 });
    const crop = form.get("crop");
    const output = await optimizeBackground(
      new Uint8Array(await file.arrayBuffer()),
      file.type,
      crop ? JSON.parse(String(crop)) : undefined,
    );
    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Image could not be processed. Check format, size, dimensions and crop.",
      },
      { status: 400 },
    );
  }
}
