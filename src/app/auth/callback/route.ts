import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requested = url.searchParams.get("next");
  const next =
    requested?.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/dashboard";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  if (next === "/update-password")
    return NextResponse.redirect(
      new URL(
        "/forgot-password?error=That+recovery+link+is+invalid+or+expired.+Request+a+new+one",
        url.origin,
      ),
    );
  return NextResponse.redirect(
    new URL(
      "/login?error=Authentication+link+is+invalid+or+expired",
      url.origin,
    ),
  );
}
