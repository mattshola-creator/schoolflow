import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("@/features/owner-dashboard/service", () => ({
  loadOwnerDashboard: mock.load,
}));
vi.mock("@/features/owner-dashboard/view", () => ({
  OwnerDashboard: () => null,
}));
vi.mock("@/lib/authorization", () => ({
  AuthorizationError: class extends Error {},
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
  usePathname: () => "/design/owner-dashboard",
}));
vi.mock("@/app/(app)/actions", () => ({
  logout: vi.fn(),
  switchContext: vi.fn(),
}));
import Page from "./page";
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SCHOOLFLOW_SHELL_REVIEW", "true");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://afqykqlxecpzspjoyegc.supabase.co",
  );
});
afterEach(() => vi.unstubAllEnvs());
describe("isolated Owner opt-in route", () => {
  it("is absent on production/foreign bindings before loading any user data", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://production.supabase.co");
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "not found",
    );
    expect(mock.load).not.toHaveBeenCalled();
  });
  it("does not treat the QA build flag as authorization", async () => {
    mock.load.mockRejectedValue(new Error("denied"));
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "denied",
    );
  });
  it("supports legacy appearance while retaining the same authorized service", async () => {
    mock.load.mockResolvedValue({
      authorization: { permissions: [], modules: [], features: [] },
      tenant: { active: {}, options: [] },
      academic: {},
      dto: {},
      userEmail: "synthetic@schoolflow.test",
    });
    const element = await Page({
      searchParams: Promise.resolve({ appearance: "legacy" }),
    });
    expect(element.props.children[1].props.enableAppearance).toBe(false);
    expect(mock.load).toHaveBeenCalledOnce();
  });
});
