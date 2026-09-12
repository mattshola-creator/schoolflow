import { getPublicEnvironment } from "@/lib/env";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "schoolflow-web",
      version: process.env.npm_package_version ?? "0.1.0",
      dependencies: {
        supabase: getPublicEnvironment().success
          ? "configured"
          : "unconfigured",
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
