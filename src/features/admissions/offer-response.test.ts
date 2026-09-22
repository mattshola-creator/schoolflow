import { beforeEach, describe, expect, it, vi } from "vitest";

const organizationId = "11111111-1111-4111-8111-111111111111";
const schoolId = "22222222-2222-4222-8222-222222222222";
const applicationId = "33333333-3333-4333-8333-333333333333";

const mocks = vi.hoisted(() => ({
  requireCapability: vi.fn(),
  requireUser: vi.fn(),
  loadTenantContext: vi.fn(),
  rpc: vi.fn(),
  applicationResult: {
    data: { id: "", status: "admission_offered" },
    error: null as null | Error,
  },
  offerResult: {
    data: { status: "issued", expires_at: "2099-01-01T00:00:00.000Z" },
    error: null as null | Error,
  },
}));

function query(result: unknown) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
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

import { recordAdmissionOfferResponse } from "./service";

describe("recordAdmissionOfferResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.applicationResult.data = {
      id: applicationId,
      status: "admission_offered",
    };
    mocks.applicationResult.error = null;
    mocks.offerResult.data = {
      status: "issued",
      expires_at: "2099-01-01T00:00:00.000Z",
    };
    mocks.offerResult.error = null;
    mocks.requireCapability.mockResolvedValue({ organizationId, schoolId });
    mocks.loadTenantContext.mockResolvedValue({
      active: { organizationId, schoolId },
    });
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.requireUser.mockResolvedValue({
      supabase: {
        from: vi.fn((table: string) =>
          table === "admission_applications"
            ? query(mocks.applicationResult)
            : query(mocks.offerResult),
        ),
        rpc: mocks.rpc,
      },
    });
  });

  it.each([
    ["accept", true],
    ["decline", false],
  ] as const)("preserves the atomic RPC for %s", async (response, accept) => {
    await recordAdmissionOfferResponse({ applicationId, response });
    expect(mocks.requireCapability).toHaveBeenCalledWith({
      permission: "admissions.manage",
      module: "admissions",
      feature: "admissions.application_workflow",
    });
    expect(mocks.rpc).toHaveBeenCalledWith("respond_to_admission_offer", {
      target_application_id: applicationId,
      accept_offer: accept,
    });
  });

  it.each([
    ["cross-tenant", null, "issued", "2099-01-01T00:00:00.000Z"],
    ["duplicate", "admission_offered", "accepted", "2099-01-01T00:00:00.000Z"],
    ["expired", "admission_offered", "issued", "2000-01-01T00:00:00.000Z"],
  ])(
    "rejects %s responses before the RPC",
    async (_case, applicationStatus, offerStatus, expiresAt) => {
      mocks.applicationResult.data = applicationStatus
        ? { id: applicationId, status: applicationStatus }
        : (null as never);
      mocks.offerResult.data = { status: offerStatus, expires_at: expiresAt };
      await expect(
        recordAdmissionOfferResponse({ applicationId, response: "accept" }),
      ).rejects.toThrow("Offer is unavailable");
      expect(mocks.rpc).not.toHaveBeenCalled();
    },
  );

  it("propagates database authorization and transition denial safely", async () => {
    mocks.rpc.mockResolvedValue({ error: new Error("denied") });
    await expect(
      recordAdmissionOfferResponse({ applicationId, response: "accept" }),
    ).rejects.toThrow("Offer is unavailable");
  });
});
