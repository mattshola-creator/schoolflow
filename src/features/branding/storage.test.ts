// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));
vi.mock("./context", () => ({ requireBrandingContext: vi.fn() }));
const admin = vi.hoisted(() => vi.fn());
vi.mock("@supabase/supabase-js", () => ({ createClient: admin }));
import {
  registerBackground,
  signedBackground,
  restoreAsset,
  storageHealth,
} from "./storage";
import type { BrandingSession } from "./persistence";
const rpc = vi.fn();
const from = vi.fn();
const session = {
  schoolId: "00000000-0000-4000-8000-000000000021",
  organizationId: "00000000-0000-4000-8000-000000000011",
  userId: "00000000-0000-4000-8000-000000000001",
  plan: "professional",
  client: { rpc, from },
} as unknown as BrandingSession;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://afqykqlxecpzspjoyegc.supabase.co",
  );
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
});
afterEach(() => vi.unstubAllEnvs());
function bindingLookup(result: unknown) {
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-test-placeholder");
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
  q.select.mockReturnValue(q);
  q.eq.mockReturnValue(q);
  admin.mockReturnValue({ from: vi.fn().mockReturnValue(q) });
  return q;
}
it("confirms image-free versions only after a successful tenant-scoped binding lookup", async () => {
  const q = bindingLookup({ data: null, error: null, status: 200 });
  await expect(restoreAsset(session, session.userId)).resolves.toBeNull();
  expect(q.eq.mock.calls).toEqual([
    ["organization_id", session.organizationId],
    ["school_id", session.schoolId],
    ["version_id", session.userId],
  ]);
});
it("does not reinterpret credential rejection as an image-free version", async () => {
  bindingLookup({
    data: null,
    error: { code: "PGRST301", message: "must never escape" },
    status: 401,
  });
  await expect(restoreAsset(session, session.userId)).rejects.toMatchObject({
    code: "storage_authentication",
    message: "Branding operation unavailable.",
  });
  await expect(storageHealth(session)).resolves.toBe("storage_authentication");
});
it("health proves service Data API SELECT access without returning bindings", async () => {
  bindingLookup({ data: null, error: null, status: 200 });
  await expect(storageHealth(session)).resolves.toBe("data_api_verified");
});
it("denies revoked publishing authority before privileged Storage access", async () => {
  rpc.mockResolvedValue({ data: false });
  await expect(
    registerBackground(session, new Uint8Array([1])),
  ).rejects.toMatchObject({ code: "42501" });
  expect(admin).not.toHaveBeenCalled();
});
it("denies a downgraded image entitlement before privileged Storage access", async () => {
  rpc
    .mockResolvedValueOnce({ data: true })
    .mockResolvedValueOnce({ data: false });
  await expect(signedBackground(session, session.userId)).rejects.toMatchObject(
    { code: "42501" },
  );
  expect(admin).not.toHaveBeenCalled();
});
it("fails closed when the QA server credential is absent", async () => {
  rpc.mockResolvedValue({ data: true });
  await expect(
    registerBackground(session, new Uint8Array([1])),
  ).rejects.toMatchObject({ code: "storage_configuration" });
  expect(admin).not.toHaveBeenCalled();
});
it("does not use the service client to resolve a foreign or hidden version", async () => {
  rpc.mockResolvedValue({ data: true });
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  q.select.mockReturnValue(q);
  q.eq.mockReturnValue(q);
  from.mockReturnValue(q);
  await expect(signedBackground(session, session.userId)).rejects.toMatchObject(
    { code: "42501" },
  );
  expect(admin).not.toHaveBeenCalled();
});
it("registers actual processed bytes with the originating actor and immutable key", async () => {
  const sharp = (await import("sharp")).default;
  const bytes = await sharp({
    create: { width: 1280, height: 720, channels: 3, background: "white" },
  })
    .webp()
    .toBuffer();
  rpc.mockResolvedValue({ data: true });
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-test-placeholder");
  const insert = vi.fn().mockResolvedValue({ error: null }),
    upload = vi.fn().mockResolvedValue({ error: null });
  admin.mockReturnValue({
    from: vi.fn().mockReturnValue({ insert }),
    storage: { from: vi.fn().mockReturnValue({ upload }) },
  });
  const result = await registerBackground(session, bytes);
  expect(upload).toHaveBeenCalledWith(
    `${session.organizationId}/${session.schoolId}/${result.assetId}.webp`,
    bytes,
    { contentType: "image/webp", upsert: false, cacheControl: "0" },
  );
  expect(insert).toHaveBeenCalledWith(
    expect.objectContaining({
      created_by: session.userId,
      byte_size: bytes.length,
      mime_type: "image/webp",
      width: 1280,
      height: 720,
    }),
  );
  expect(rpc).toHaveBeenCalledTimes(4);
});
