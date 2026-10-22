// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ context: vi.fn(), optimize: vi.fn() }));
vi.mock("@/features/branding/context", () => ({
  requireBrandingContext: mocks.context,
  BrandingSubscriptionError: class extends Error {},
}));
vi.mock("@/features/branding/image", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/branding/image")>()),
  optimizeBackground: mocks.optimize,
}));
import { AuthorizationError } from "@/lib/authorization";
import { POST } from "./route";
const origin = "https://deploy-preview-125--schoolflow-demo-qa.netlify.app";
function request(source = origin, host = new URL(origin).host) {
  const body = new FormData();
  body.set(
    "image",
    new File([new Uint8Array([1, 2, 3])], "synthetic.png", {
      type: "image/png",
    }),
  );
  return new Request(`${origin}/api/branding/image-preview`, {
    method: "POST",
    headers: { origin: source, host },
    body,
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("SCHOOLFLOW_SHELL_REVIEW", "true");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://afqykqlxecpzspjoyegc.supabase.co",
  );
  mocks.context.mockResolvedValue({ plan: "professional" });
  mocks.optimize.mockResolvedValue(Buffer.from("normalized-webp"));
});
afterEach(() => vi.unstubAllEnvs());
it("does not expose the feature outside QA binding", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://production.example");
  expect((await POST(request() as never)).status).toBe(404);
  expect(mocks.context).not.toHaveBeenCalled();
});
it.each([
  ["https://evil.example", new URL(origin).host],
  [origin, "evil.example"],
])(
  "rejects foreign origins and host mismatch before authorization",
  async (source, host) => {
    expect((await POST(request(source, host) as never)).status).toBe(403);
    expect(mocks.context).not.toHaveBeenCalled();
  },
);
it("denies Starter image processing before decoding", async () => {
  mocks.context.mockResolvedValue({ plan: "starter" });
  expect((await POST(request() as never)).status).toBe(403);
  expect(mocks.optimize).not.toHaveBeenCalled();
});
it("denies a restricted role before decoding", async () => {
  mocks.context.mockRejectedValue(new AuthorizationError("permission_denied"));
  expect((await POST(request() as never)).status).toBe(403);
  expect(mocks.optimize).not.toHaveBeenCalled();
});
it("returns entitled normalized bytes privately without a Storage write", async () => {
  const response = await POST(request() as never);
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("image/webp");
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(mocks.optimize).toHaveBeenCalledOnce();
});
it("preserves unexpected subscription lookup errors", async () => {
  const error = new Error("lookup failure");
  mocks.context.mockRejectedValue(error);
  await expect(POST(request() as never)).rejects.toBe(error);
});
