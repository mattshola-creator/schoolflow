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

import { requireAttendanceContext } from "./service";

const authorization = {
  organizationId: crypto.randomUUID(),
  schoolId: crypto.randomUUID(),
};

describe("attendance context", () => {
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

  it("requires the exact student-attendance capability", async () => {
    await expect(requireAttendanceContext()).resolves.toMatchObject({
      authorization,
    });
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.view",
      module: "attendance",
      feature: "attendance.student_registers",
    });
  });

  it("does not reuse student-register access for staff attendance", async () => {
    await requireAttendanceContext(
      "attendance.staff.record",
      "attendance.staff_clock",
    );
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.staff.record",
      module: "attendance",
      feature: "attendance.staff_clock",
    });
  });

  it("fails closed when active context differs from authorization", async () => {
    loadTenantContext.mockResolvedValue({
      active: {
        organizationId: authorization.organizationId,
        schoolId: crypto.randomUUID(),
      },
    });
    await expect(requireAttendanceContext()).rejects.toThrow(
      "The active school context is invalid",
    );
  });
});
