import { afterEach, describe, expect, it, vi } from "vitest";
import { getPasswordRecoveryRedirectUrl, getSiteUrl } from "./site-url";
const originalPublic = process.env.NEXT_PUBLIC_SITE_URL;
const originalNetlify = process.env.URL;
afterEach(() => {
  vi.unstubAllEnvs();
  process.env.NEXT_PUBLIC_SITE_URL = originalPublic;
  process.env.URL = originalNetlify;
});
describe("site URL", () => {
  it("prefers the configured public URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://schoolflow.example/path";
    process.env.URL = "https://fallback.example";
    expect(getSiteUrl()).toBe("https://schoolflow.example");
  });
  it("uses Netlify's canonical URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.URL = "https://schoolflow.netlify.app";
    expect(getSiteUrl()).toBe("https://schoolflow.netlify.app");
  });
  it("rejects insecure remote origins", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://unsafe.example";
    expect(() => getSiteUrl()).toThrow("HTTPS");
  });

  it("never silently falls back to localhost in production", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.URL;
    vi.stubEnv("NODE_ENV", "production");
    expect(() => getSiteUrl()).toThrow("configured in production");
  });

  it("builds the exact production recovery callback", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://schoolflow-app.netlify.app";
    expect(getPasswordRecoveryRedirectUrl()).toBe(
      "https://schoolflow-app.netlify.app/auth/callback?next=/update-password",
    );
  });
});
