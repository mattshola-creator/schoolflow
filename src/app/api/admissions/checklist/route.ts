import { NextRequest, NextResponse } from "next/server";
import { checklistSchema } from "@/features/admissions/schemas";
import { updateAdmissionChecklistItem } from "@/features/admissions/service";

export const dynamic = "force-dynamic";

export function hasValidChecklistOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

function redirect(
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
  if (!hasValidChecklistOrigin(request))
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return redirect(request, null, "error", "Invalid checklist update");
  }

  const parsed = checklistSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return redirect(request, null, "error", "Invalid checklist update");

  try {
    await updateAdmissionChecklistItem(parsed.data);
    return redirect(
      request,
      parsed.data.applicationId,
      "message",
      "Checklist updated",
    );
  } catch {
    return redirect(
      request,
      parsed.data.applicationId,
      "error",
      "The checklist could not be updated",
    );
  }
}
