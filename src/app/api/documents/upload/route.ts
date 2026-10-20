import { NextRequest, NextResponse } from "next/server";
import { hasSameRequestOrigin } from "@/lib/http/request-origin";
import { persistDocumentUpload } from "@/features/shared-services/service";
import { AuthorizationError } from "@/lib/authorization";

export const dynamic = "force-dynamic";

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
  if (!hasSameRequestOrigin(request))
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });

  let stage = "multipart_parse";
  try {
    const formData = await request.formData();
    stage = "document_persistence";
    const result = await persistDocumentUpload(formData);
    if (!result.ok) return documentsRedirect(request, "error", result.message);
    return documentsRedirect(request, "message", "Document uploaded securely");
  } catch (error) {
    // Never log multipart contents, filenames, cookies, tokens or raw errors.
    try {
      console.error(
        JSON.stringify({
          event: "document_upload_failed",
          stage,
          category:
            error instanceof AuthorizationError
              ? error.reason
              : error instanceof TypeError
                ? "type_error"
                : "unexpected_error",
        }),
      );
    } catch {
      // Diagnostics must not change the upload outcome.
    }
    if (error instanceof AuthorizationError)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    return documentsRedirect(request, "error", "The upload could not be saved");
  }
}
