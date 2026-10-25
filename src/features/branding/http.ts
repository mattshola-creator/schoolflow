import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  isQaProvisioningOrigin,
  isQaInvitationHost,
} from "@/features/administration/qa-provisioning";
import { AuthorizationError } from "@/lib/authorization";
import { BrandingSubscriptionError } from "./context";
import { BrandingOperationError, brandingSession } from "./persistence";
import { createClient } from "@/lib/supabase/server";
export function brandingRequestGate(request: Request) {
  if (
    process.env.SCHOOLFLOW_SHELL_REVIEW !== "true" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL !==
      "https://afqykqlxecpzspjoyegc.supabase.co"
  )
    return new NextResponse(null, { status: 404 });
  const host = (
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  )
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  const origin = request.headers.get("origin");
  if (
    !host ||
    !isQaInvitationHost(host) ||
    (origin
      ? !isQaProvisioningOrigin(origin) || new URL(origin).host !== host
      : request.headers.get("sec-fetch-site") !== "same-origin")
  )
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });
  return null;
}
export function brandingFailure(error: unknown) {
  if (
    error instanceof AuthorizationError ||
    error instanceof BrandingSubscriptionError
  )
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: "Invalid appearance request" },
      { status: 400 },
    );
  if (error instanceof BrandingOperationError)
    return NextResponse.json(
      { error: error.message },
      {
        status:
          error.code === "input"
            ? 400
            : error.code === "40001"
              ? 409
              : error.code === "42501"
                ? 403
                : error.code === "storage_configuration"
                  ? 503
                  : 500,
      },
    );
  throw error;
}
export function privateJson(value: unknown) {
  return NextResponse.json(value, {
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function requireBrandingApiSession() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error && (error.status ?? 500) >= 500)
    throw new Error("Authentication service unavailable");
  if (!data.user) throw new AuthorizationError("permission_denied");
  return brandingSession();
}
