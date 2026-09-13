import { NextResponse } from "next/server";
import { loadEffectiveAuthorization } from "@/lib/authorization";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  try {
    const authorization = await loadEffectiveAuthorization();
    if (!authorization)
      return NextResponse.json(
        { error: "Workspace context required" },
        { status: 409 },
      );
    return NextResponse.json(authorization, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Authorization state unavailable" },
      { status: 403 },
    );
  }
}
