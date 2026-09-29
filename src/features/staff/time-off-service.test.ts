import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireCapability, requireUser, loadTenantContext, rpc } = vi.hoisted(
  () => ({
    requireCapability: vi.fn(),
    requireUser: vi.fn(),
    loadTenantContext: vi.fn(),
    rpc: vi.fn(),
  }),
);

vi.mock("@/lib/authorization", () => ({ requireCapability }));
vi.mock("@/lib/auth", () => ({ requireUser }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext }));

import { submitStaffTimeRequest } from "./service";

const authorization = {
  organizationId: crypto.randomUUID(),
  schoolId: crypto.randomUUID(),
};

const input = {
  staffAssignmentId: crypto.randomUUID(),
  kind: "permission" as const,
  leaveTypeId: null,
  startsAt: "2026-10-01T08:00:00+01:00",
  endsAt: "2026-10-01T12:00:00+01:00",
  reason: "Approved personal appointment",
  policyId: crypto.randomUUID(),
};

describe("staff time request service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCapability.mockResolvedValue(authorization);
    requireUser.mockResolvedValue({ supabase: { rpc } });
    loadTenantContext.mockResolvedValue({ active: authorization });
    rpc.mockResolvedValue({ data: crypto.randomUUID(), error: null });
  });

  it("submits one validated request through the caller-bound RPC", async () => {
    await submitStaffTimeRequest(input);
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "staff.time_off.request",
      module: "staff",
      feature: "staff.leave_permission",
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("submit_staff_time_request", {
      target_organization_id: authorization.organizationId,
      target_school_id: authorization.schoolId,
      target_staff_assignment_id: input.staffAssignmentId,
      target_kind: input.kind,
      target_leave_type_id: null,
      target_starts_at: input.startsAt,
      target_ends_at: input.endsAt,
      target_reason: input.reason,
      target_policy_id: input.policyId,
    });
  });

  it("does not call the RPC when input validation fails", async () => {
    await expect(
      submitStaffTimeRequest({ ...input, endsAt: input.startsAt }),
    ).rejects.toThrow();
    expect(requireCapability).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not retry or expose a protected RPC failure", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "protected database details" },
    });
    await expect(submitStaffTimeRequest(input)).rejects.toThrow(
      "Staff time request could not be submitted",
    );
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("fails closed when active context differs from authorization", async () => {
    loadTenantContext.mockResolvedValue({
      active: { ...authorization, schoolId: crypto.randomUUID() },
    });
    await expect(submitStaffTimeRequest(input)).rejects.toThrow(
      "The active school context is invalid",
    );
    expect(rpc).not.toHaveBeenCalled();
  });
});
