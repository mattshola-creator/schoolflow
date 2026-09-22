import { NextRequest, NextResponse } from "next/server";
import { offerResponseSchema } from "@/features/admissions/schemas";
import { recordAdmissionOfferResponse } from "@/features/admissions/service";

export const dynamic = "force-dynamic";

export function hasValidOfferResponseOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

function admissionsRedirect(
  request: Request,
  applicationId: string | null,
  key: "message" | "error",
  value: string,
) {
  const path = applicationId ? `/admissions/${applicationId}` : "/admissions";
  const destination = new URL(path, request.url);
  destination.searchParams.set(key, value);
  return NextResponse.redirect(destination, 303);
}

export async function POST(request: NextRequest) {
  if (!hasValidOfferResponseOrigin(request))
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return admissionsRedirect(request, null, "error", "Invalid offer response");
  }

  const parsed = offerResponseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return admissionsRedirect(request, null, "error", "Invalid offer response");

  try {
    await recordAdmissionOfferResponse(parsed.data);
    return admissionsRedirect(
      request,
      parsed.data.applicationId,
      "message",
      parsed.data.response === "accept"
        ? "Offer acceptance recorded"
        : "Offer decline recorded",
    );
  } catch {
    return admissionsRedirect(
      request,
      parsed.data.applicationId,
      "error",
      "The offer response could not be recorded",
    );
  }
}
