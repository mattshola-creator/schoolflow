import { NextRequest, NextResponse } from "next/server";
import { createQaInvitation } from "@/app/(app)/administration/actions";
import { isQaInvitationHost } from "@/features/administration/qa-provisioning";
import { hasSameRequestOrigin } from "@/lib/http/request-origin";

export const dynamic = "force-dynamic";

export function hasValidQaInvitationOrigin(request: Request) {
  return (
    hasSameRequestOrigin(request) &&
    isQaInvitationHost(new URL(request.url).host)
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
