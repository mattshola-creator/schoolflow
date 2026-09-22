import { beforeEach, describe, expect, it, vi } from "vitest";

const organizationId = "11111111-1111-4111-8111-111111111111";
const schoolId = "22222222-2222-4222-8222-222222222222";
const applicationId = "33333333-3333-4333-8333-333333333333";
const itemId = "44444444-4444-4444-8444-444444444444";

const mocks = vi.hoisted(() => ({
  requireCapability: vi.fn(),
  requireUser: vi.fn(),
  loadTenantContext: vi.fn(),
  rpc: vi.fn(),
  itemResult: {
    data: { id: "", application_id: "" },
    error: null as null | Error,
  },
}));

function query(result: unknown) {
  const builder = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.maybeSingle.mockResolvedValue(result);
  return builder;
}

vi.mock("@/lib/authorization", () => ({
  requireCapability: mocks.requireCapability,
}));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/tenant-context", () => ({
  loadTenantContext: mocks.loadTenantContext,
}));

import { updateAdmissionChecklistItem } from "./service";

describe("updateAdmissionChecklistItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.itemResult.data = { id: itemId, application_id: applicationId };
    mocks.itemResult.error = null;
    mocks.requireCapability.mockResolvedValue({ organizationId, schoolId });
    mocks.loadTenantContext.mockResolvedValue({
      active: { organizationId, schoolId },
    });
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.requireUser.mockResolvedValue({
      supabase: {
        from: vi.fn(() => query(mocks.itemResult)),
        rpc: mocks.rpc,
      },
    });
  });

  it.each(["pending", "complete", "waived"] as const)(
    "preserves the caller-bound RPC for %s",
    async (status) => {
      await updateAdmissionChecklistItem({ applicationId, itemId, status });
      expect(mocks.requireCapability).toHaveBeenCalledWith({
        permission: "admissions.enroll",
        module: "admissions",
        feature: "admissions.application_workflow",
      });
      expect(mocks.rpc).toHaveBeenCalledWith("set_admission_checklist_item", {
        target_item_id: itemId,
        target_status: status,
      });
    },
  );

  it("rejects missing and cross-tenant item identifiers before the RPC", async () => {
    mocks.itemResult.data = null as never;
    await expect(
      updateAdmissionChecklistItem({
        applicationId,
        itemId,
        status: "complete",
      }),
    ).rejects.toThrow("Checklist item is unavailable");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("propagates database authorization denial safely", async () => {
    mocks.rpc.mockResolvedValue({ error: new Error("denied") });
    await expect(
      updateAdmissionChecklistItem({
        applicationId,
        itemId,
        status: "complete",
      }),
    ).rejects.toThrow("Checklist item is unavailable");
  });
});
