import { describe, expect, it, vi } from "vitest";

import type { PublicEnvironment } from "@/lib/env";
import { checkSupabaseHealth } from "./health";

const environment: PublicEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: "https://schoolflow.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_schoolflow_test_key",
};

describe("Supabase health probe", () => {
  it("reports a successful authenticated gateway response", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));

    await expect(
      checkSupabaseHealth(environment, request),
    ).resolves.toMatchObject({ status: "connected" });
    expect(request).toHaveBeenCalledWith(
      "https://schoolflow.supabase.co/auth/v1/health",
      expect.objectContaining({
        headers: { apikey: environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
      }),
    );
  });

  it("reports an unavailable dependency without exposing its error", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("sensitive provider error"));

    await expect(
      checkSupabaseHealth(environment, request),
    ).resolves.toMatchObject({ status: "unreachable" });
  });
});
