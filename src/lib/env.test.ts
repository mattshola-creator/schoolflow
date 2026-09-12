import { afterEach, describe, expect, it } from "vitest";
import { getPublicEnvironment } from "./env";
const original = { ...process.env };
afterEach(() => {
  process.env = { ...original };
});
describe("environment", () => {
  it("rejects missing config", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(getPublicEnvironment().success).toBe(false);
  });
  it("accepts publishable config", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://schoolflow.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      "sb_publishable_schoolflow_test_key";
    expect(getPublicEnvironment().success).toBe(true);
  });
});
