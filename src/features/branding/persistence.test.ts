// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));
vi.mock("./context", () => ({ requireBrandingContext: vi.fn() }));
import {
  mutateBranding,
  mutationSchema,
  loadBranding,
  type BrandingSession,
} from "./persistence";
const school = "00000000-0000-4000-8000-000000000021",
  org = "00000000-0000-4000-8000-000000000011",
  version = "00000000-0000-4000-8000-000000000051";
const config = {
  themeId: "emerald",
  preset: "executive",
  focalX: 50,
  focalY: 50,
  overlay: 0.65,
};
const rpc = vi.fn(),
  from = vi.fn();
const session = {
  schoolId: school,
  organizationId: org,
  userId: version,
  schoolName: "Synthetic",
  plan: "starter",
  client: { rpc, from },
} as unknown as BrandingSession;
function query(data: unknown) {
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
    then: undefined,
  };
  for (const key of ["select", "eq", "order"] as const)
    q[key].mockReturnValue(q);
  q.limit.mockResolvedValue({ data, error: null });
  q.maybeSingle.mockResolvedValue({ data, error: null });
  return q;
}
beforeEach(() => vi.clearAllMocks());
it("denies stale browser school context before any RPC", async () => {
  await expect(
    mutateBranding(session, {
      operation: "publish",
      schoolId: org,
      versionId: version,
      revision: 1,
    }),
  ).rejects.toMatchObject({ code: "42501" });
  expect(rpc).not.toHaveBeenCalled();
});
it("rejects null revisions and arbitrary config fields", () => {
  expect(
    mutationSchema.safeParse({
      operation: "save",
      schoolId: school,
      revision: null,
      requestId: version,
      assetId: null,
      config,
    }).success,
  ).toBe(false);
  expect(
    mutationSchema.safeParse({
      operation: "save",
      schoolId: school,
      revision: 0,
      requestId: version,
      assetId: null,
      config: { ...config, css: "evil" },
    }).success,
  ).toBe(false);
});
it("rejects premium save for the server-derived Starter plan", async () => {
  await expect(
    mutateBranding(session, {
      operation: "save",
      schoolId: school,
      revision: 0,
      requestId: version,
      assetId: null,
      config: { ...config, themeId: "obsidian" },
    }),
  ).rejects.toMatchObject({ code: "42501" });
  expect(rpc).not.toHaveBeenCalled();
});
it("keeps database revision conflicts visible", async () => {
  rpc.mockResolvedValue({ error: { code: "40001" } });
  await expect(
    mutateBranding(session, {
      operation: "publish",
      schoolId: school,
      versionId: version,
      revision: 1,
    }),
  ).rejects.toMatchObject({ code: "40001" });
  expect(rpc).toHaveBeenCalledWith("publish_school_branding", {
    org,
    school,
    expected_revision: 1,
    target_version: version,
  });
});
it("retains premium history while using a core fallback after downgrade", async () => {
  from.mockImplementation((table: string) =>
    query(
      table === "school_branding_state"
        ? {
            revision: 2,
            draft_version_id: version,
            published_version_id: version,
          }
        : [
            {
              id: version,
              version: 1,
              config: { ...config, themeId: "obsidian" },
              restored_from: null,
              created_at: "2026-10-22T00:00:00Z",
            },
          ],
    ),
  );
  const dto = await loadBranding(session);
  expect(dto.effective.themeId).toBe("emerald");
  expect(dto.premiumFallback).toBe(true);
  expect(dto.history[0].config.themeId).toBe("obsidian");
});
