import { afterEach, describe, expect, it } from "vitest";
import { getSiteUrl } from "./site-url";
const originalPublic = process.env.NEXT_PUBLIC_SITE_URL;
const originalNetlify = process.env.URL;
afterEach(() => {
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
});
