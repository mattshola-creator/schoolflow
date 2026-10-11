import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { loadAdministrationWorkspace } from "./service";

vi.mock("@/lib/authorization", () => ({ requireCapability: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext: vi.fn() }));

const authorization = {
  organizationId: "00000000-0000-4000-8000-000000000001",
  schoolId: "00000000-0000-4000-8000-000000000002",
  permissions: ["organization.view", "membership.view", "role.view"],
  modules: [{ key: "foundation", entitled: true, enabled: true }],
  features: [
    {
      key: "foundation.authorization_inspection",
      module: "foundation",
      enabled: true,
    },
  ],
};

describe("Administration service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCapability).mockResolvedValue(authorization);
  });

  it("fails closed before querying when tenant and authorization differ", async () => {
    const from = vi.fn();
    vi.mocked(requireUser).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-a" } as never,
    });
    vi.mocked(loadTenantContext).mockResolvedValue({
      active: {
        organizationId: authorization.organizationId,
        organizationName: "Cedarbridge",
        schoolId: "00000000-0000-4000-8000-000000000099",
        schoolName: "Unauthorized school",
      },
      options: [],
    });

    await expect(loadAdministrationWorkspace()).rejects.toThrow(
      "active administration context is invalid",
    );
    expect(from).not.toHaveBeenCalled();
  });
});
