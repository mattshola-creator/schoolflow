import { NextRequest, NextResponse } from "next/server";
import {
  admissionDocumentInitializeSchema,
  admissionDocumentPolicySchema,
  admissionDocumentReviewSchema,
  admissionDocumentSubmitSchema,
} from "@/features/admissions/schemas";
import {
  configureAdmissionDocumentPolicy,
  initializeAdmissionDocumentRequirements,
  reviewAdmissionDocument,
  submitAdmissionDocument,
} from "@/features/admissions/service";

export const dynamic = "force-dynamic";

export function hasValidAdmissionDocumentOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

function redirect(
  request: Request,
  path: string,
  key: "message" | "error",
  value: string,
) {
  const destination = new URL(path, request.url);
  destination.searchParams.set(key, value);
  return NextResponse.redirect(destination, 303);
}

export async function POST(request: NextRequest) {
  if (!hasValidAdmissionDocumentOrigin(request))
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });
  let values: Record<string, FormDataEntryValue>;
  try {
    values = Object.fromEntries(await request.formData());
  } catch {
    return redirect(
      request,
      "/admissions",
      "error",
      "Invalid document request",
    );
  }
  const operation = values.operation;
  const applicationId =
    typeof values.applicationId === "string" ? values.applicationId : null;
  const path = applicationId
    ? `/admissions/${applicationId}`
    : "/admissions/document-policy";
  try {
    if (operation === "configure") {
      const input = admissionDocumentPolicySchema.parse(values);
      await configureAdmissionDocumentPolicy(input);
      return redirect(request, path, "message", "Document policy updated");
    }
    if (operation === "initialize") {
      const input = admissionDocumentInitializeSchema.parse(values);
      await initializeAdmissionDocumentRequirements(input);
      return redirect(
        request,
        path,
        "message",
        "Document requirements initialized",
      );
    }
    if (operation === "submit") {
      const input = admissionDocumentSubmitSchema.parse(values);
      await submitAdmissionDocument(input);
      return redirect(request, path, "message", "Document evidence submitted");
    }
    if (operation === "review") {
      const input = admissionDocumentReviewSchema.parse(values);
      await reviewAdmissionDocument(input);
      return redirect(request, path, "message", "Document review recorded");
    }
    return redirect(request, path, "error", "Invalid document request");
  } catch {
    return redirect(
      request,
      path,
      "error",
      "The document request could not be completed",
    );
  }
}
