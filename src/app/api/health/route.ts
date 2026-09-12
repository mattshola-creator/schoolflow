import { getPublicEnvironment } from "@/lib/env";
import { checkSupabaseHealth } from "@/lib/supabase/health";
export const dynamic = "force-dynamic";

export async function GET() {
  const environment = getPublicEnvironment();
  const supabase = environment.success
    ? await checkSupabaseHealth(environment.data)
    : { status: "unconfigured" as const };
  const healthy = supabase.status === "connected";

  return Response.json(
    {
      status: healthy ? "ok" : "degraded",
      service: "schoolflow-web",
      version: process.env.npm_package_version ?? "0.1.0",
      dependencies: { supabase },
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
