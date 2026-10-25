// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { brandingRequestGate, brandingFailure } from "./http";
import { BrandingOperationError } from "./persistence";
const host = "deploy-preview-125--schoolflow-demo-qa.netlify.app";
beforeEach(() => {
  vi.stubEnv("SCHOOLFLOW_SHELL_REVIEW", "true");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://afqykqlxecpzspjoyegc.supabase.co",
  );
});
afterEach(() => vi.unstubAllEnvs());
it("keeps the integration inaccessible outside the explicit QA binding", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://other.supabase.co");
  expect(
    brandingRequestGate(new Request(`https://${host}`, { headers: { host } }))
      ?.status,
  ).toBe(404);
});
const rejectedHeaders: Record<string, string>[] = [
  { origin: "https://evil.example", host },
  { origin: `https://${host}`, host: "evil.example" },
  { host, "sec-fetch-site": "cross-site" },
];
it.each(rejectedHeaders)(
  "denies foreign-origin or host requests",
  (headers) => {
    expect(
      brandingRequestGate(
        new Request(`https://${host}`, {
          headers,
        }),
      )?.status,
    ).toBe(403);
  },
);
it("accepts same-origin GET and validated POST requests", () => {
  expect(
    brandingRequestGate(
      new Request(`https://${host}`, {
        headers: { host, "sec-fetch-site": "same-origin" },
      }),
    ),
  ).toBeNull();
  expect(
    brandingRequestGate(
      new Request(`https://${host}`, {
        method: "POST",
        headers: { host, origin: `https://${host}` },
      }),
    ),
  ).toBeNull();
});
it("distinguishes conflicts, authorization and configuration failures", () => {
  expect(brandingFailure(new BrandingOperationError("40001")).status).toBe(409);
  expect(brandingFailure(new BrandingOperationError("42501")).status).toBe(403);
  expect(
    brandingFailure(new BrandingOperationError("storage_configuration")).status,
  ).toBe(503);
});
