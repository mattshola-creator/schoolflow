import type { PublicEnvironment } from "@/lib/env";

export type SupabaseHealth =
  | { status: "connected"; latencyMs: number }
  | { status: "unreachable"; latencyMs: number };

export async function checkSupabaseHealth(
  environment: PublicEnvironment,
  request: typeof fetch = fetch,
): Promise<SupabaseHealth> {
  const startedAt = performance.now();

  try {
    const response = await request(
      `${environment.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
      {
        cache: "no-store",
        headers: {
          apikey: environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        },
        signal: AbortSignal.timeout(5_000),
      },
    );

    return {
      status: response.ok ? "connected" : "unreachable",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return {
      status: "unreachable",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  }
}
