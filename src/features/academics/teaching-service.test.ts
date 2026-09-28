import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireCapability, requireUser, loadTenantContext } = vi.hoisted(
  () => ({
    requireCapability: vi.fn(),
    requireUser: vi.fn(),
    loadTenantContext: vi.fn(),
  }),
);

vi.mock("@/lib/authorization", () => ({ requireCapability }));
vi.mock("@/lib/auth", () => ({ requireUser }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext }));

import { requireTeachingContext } from "./teaching-service";

const authorization = {
  organizationId: crypto.randomUUID(),
  schoolId: crypto.randomUUID(),
};

describe("teaching management context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCapability.mockResolvedValue(authorization);
    requireUser.mockResolvedValue({ supabase: {} });
    loadTenantContext.mockResolvedValue({
      active: {
        organizationId: authorization.organizationId,
        schoolId: authorization.schoolId,
      },
    });
  });

  it("uses the teaching-management feature instead of academic setup", async () => {
    await expect(requireTeachingContext()).resolves.toMatchObject({
      authorization,
    });
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "academics.teaching_assignments.view",
      module: "academics",
      feature: "academics.teaching_management",
    });
  });

  it("fails closed without a school-bound authorization context", async () => {
    requireCapability.mockResolvedValue({
      ...authorization,
      schoolId: null,
    });
    await expect(requireTeachingContext()).rejects.toThrow(
      "A school context is required",
    );
  });
});
