import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  loadEffectiveAuthorization: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
}));
vi.mock("@/lib/authorization", () => ({
  loadEffectiveAuthorization: mocks.loadEffectiveAuthorization,
}));

import { GET } from "./route";

describe("GET /api/authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated inspection", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(mocks.loadEffectiveAuthorization).not.toHaveBeenCalled();
  });

  it("returns only the caller authorization snapshot without caching", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-a" } } });
    mocks.loadEffectiveAuthorization.mockResolvedValue({
      organizationId: "00000000-0000-4000-8000-000000000001",
      schoolId: null,
      permissions: ["organization.view"],
      modules: [{ key: "foundation", entitled: true, enabled: true }],
      features: [],
    });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).not.toHaveProperty("userId");
  });

  it("fails safely when the context is unavailable", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-a" } } });
    mocks.loadEffectiveAuthorization.mockRejectedValue(new Error("denied"));
    const response = await GET();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Authorization state unavailable",
    });
  });
});
