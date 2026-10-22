import { NextRequest, NextResponse } from "next/server";
import { createQaInvitation } from "@/app/(app)/administration/actions";
import {
  isQaInvitationHost,
  isQaProvisioningOrigin,
} from "@/features/administration/qa-provisioning";

export const dynamic = "force-dynamic";

export function hasValidQaInvitationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost ?? request.headers.get("host");
  return Boolean(
    isQaProvisioningOrigin(origin) &&
    host &&
    isQaInvitationHost(host) &&
    new URL(origin!).host === host.toLowerCase(),
  );
}

export async function POST(request: NextRequest) {
  if (!hasValidQaInvitationOrigin(request))
    return NextResponse.json({ message: "Request rejected" }, { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid QA invitation request" },
      { status: 400 },
    );
  }

  try {
    const result = await createQaInvitation({ message: "" }, formData);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "QA identity creation was blocked. No email or notification was sent.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
