import { NextResponse } from "next/server";
import { loadBranding, mutateBranding } from "@/features/branding/persistence";
import {
  requireBrandingApiSession,
  brandingRequestGate,
  brandingFailure,
  privateJson,
} from "@/features/branding/http";
import { limitedRequestBody } from "@/features/branding/image";
export async function GET(request: Request) {
  const denied = brandingRequestGate(request);
  if (denied) return denied;
  try {
    return privateJson(await loadBranding(await requireBrandingApiSession()));
  } catch (error) {
    return brandingFailure(error);
  }
}
export async function POST(request: Request) {
  const denied = brandingRequestGate(request);
  if (denied) return denied;
  try {
    const session = await requireBrandingApiSession();
    let bytes: Uint8Array;
    try {
      bytes = await limitedRequestBody(request, 16384);
    } catch {
      return NextResponse.json(
        { error: "Request too large or missing body" },
        { status: 400 },
      );
    }
    return privateJson(
      await mutateBranding(
        session,
        JSON.parse(new TextDecoder().decode(bytes)),
      ),
    );
  } catch (error) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    return brandingFailure(error);
  }
}
