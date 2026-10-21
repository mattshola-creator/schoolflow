import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SharedShellReviewPage from "./page";
const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  user: vi.fn(),
  tenant: vi.fn(),
  academic: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
  usePathname: () => "/design/shared-shell",
}));
vi.mock("@/lib/authorization", () => ({ requireCapability: mocks.guard }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext: mocks.tenant }));
vi.mock("@/lib/academic-context", () => ({
  loadAcademicContext: mocks.academic,
}));
vi.mock("@/app/(app)/actions", () => ({
  logout: vi.fn(),
  switchContext: vi.fn(),
}));
describe("shared-shell QA route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("CONTEXT", "deploy-preview");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://afqykqlxecpzspjoyegc.supabase.co",
    );
  });
  afterEach(() => vi.unstubAllEnvs());
  it("is absent from production and other project bindings before loading identity", async () => {
    vi.stubEnv("CONTEXT", "production");
    await expect(SharedShellReviewPage()).rejects.toThrow("not found");
    expect(mocks.guard).not.toHaveBeenCalled();
    vi.stubEnv("CONTEXT", "deploy-preview");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://other.supabase.co");
    await expect(SharedShellReviewPage()).rejects.toThrow("not found");
  });
  it("preserves the capability denial before loading tenant context", async () => {
    mocks.guard.mockRejectedValue(new Error("denied"));
    await expect(SharedShellReviewPage()).rejects.toThrow("denied");
    expect(mocks.tenant).not.toHaveBeenCalled();
    expect(mocks.guard).toHaveBeenCalledWith({
      permission: "organization.view",
      module: "foundation",
      feature: "foundation.authorization_inspection",
    });
  });
  it("rejects mismatched tenant context without loading academic data", async () => {
    mocks.guard.mockResolvedValue({
      organizationId: "org-a",
      schoolId: "school-a",
    });
    mocks.user.mockResolvedValue({
      user: { email: "synthetic@schoolflow.test" },
    });
    mocks.tenant.mockResolvedValue({
      active: { organizationId: "org-b", schoolId: "school-a" },
    });
    await expect(SharedShellReviewPage()).rejects.toThrow("not found");
    expect(mocks.academic).not.toHaveBeenCalled();
  });
  it("composes the opted-in shell for matching authorized context", async () => {
    mocks.guard.mockResolvedValue({
      organizationId: "org-a",
      schoolId: "school-a",
      permissions: [],
      modules: [],
      features: [],
    });
    mocks.user.mockResolvedValue({
      user: { email: "synthetic@schoolflow.test" },
    });
    mocks.tenant.mockResolvedValue({
      active: {
        organizationId: "org-a",
        organizationName: "Synthetic organization",
        schoolId: "school-a",
        schoolName: "Synthetic school",
      },
      options: [],
    });
    mocks.academic.mockResolvedValue({
      sessionId: null,
      sessionName: null,
      periodId: null,
      periodName: null,
      available: false,
    });
    const page = await SharedShellReviewPage();
    expect(page.props.children[1].props.enableAppearance).toBe(true);
    expect(page.props.children[1].props.items).toEqual([]);
    expect(mocks.academic).toHaveBeenCalledWith("org-a", "school-a");
  });
});
