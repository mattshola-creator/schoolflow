import { NextRequest, NextResponse } from "next/server";
import { enrollmentConversionSchema } from "@/features/admissions/schemas";
import { convertAdmissionToStudent } from "@/features/admissions/service";

export const dynamic = "force-dynamic";

export function hasValidConversionOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin === null) return false;

  const requestOrigin = new URL(request.url).origin;
  if (origin === requestOrigin) return true;

  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost ?? request.headers.get("host");
  if (!host) return false;

  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProtocol ?? new URL(request.url).protocol.slice(0, -1);

  return origin === `${protocol}://${host}`;
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
  if (!hasValidConversionOrigin(request))
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return redirect(
      request,
      "/admissions",
      "error",
      "Invalid enrollment request",
    );
  }

  const values = Object.fromEntries(formData);
  const parsed = enrollmentConversionSchema.safeParse(values);
  const applicationId =
    typeof values.applicationId === "string" ? values.applicationId : null;
  if (!parsed.success)
    return redirect(
      request,
      applicationId ? `/admissions/${applicationId}` : "/admissions",
      "error",
      "Check the enrollment details",
    );

  try {
    const studentId = await convertAdmissionToStudent(parsed.data);
    return redirect(
      request,
      `/students/${studentId}`,
      "message",
      "Applicant enrolled",
    );
  } catch {
    return redirect(
      request,
      `/admissions/${parsed.data.applicationId}`,
      "error",
      "Enrollment requirements are incomplete or invalid",
    );
  }
}
