import { NextRequest, NextResponse } from "next/server";
import { persistDocumentUpload } from "@/features/shared-services/service";

export const dynamic = "force-dynamic";

export function hasValidUploadOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

function documentsRedirect(
  request: Request,
  key: "message" | "error",
  value: string,
) {
  const destination = new URL("/documents", request.url);
  destination.searchParams.set(key, value);
  return NextResponse.redirect(destination, 303);
}

export async function POST(request: NextRequest) {
  if (!hasValidUploadOrigin(request))
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });

  try {
    const result = await persistDocumentUpload(await request.formData());
    if (!result.ok) return documentsRedirect(request, "error", result.message);
    return documentsRedirect(request, "message", "Document uploaded securely");
  } catch {
    return documentsRedirect(request, "error", "The upload could not be saved");
  }
}
