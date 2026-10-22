import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  capability: vi.fn(),
  user: vi.fn(),
  context: vi.fn(),
  rpc: vi.fn(),
  maybeSingle: vi.fn(),
  eq: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
}));
vi.mock("@/lib/authorization", () => ({ requireCapability: mocks.capability }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext: mocks.context }));
import { reopenBatch } from "./service";
function setup() {
  const chain = {
    select: mocks.select,
    eq: mocks.eq,
    maybeSingle: mocks.maybeSingle,
  };
  mocks.select.mockReturnValue(chain);
  mocks.eq.mockReturnValue(chain);
  mocks.from.mockReturnValue(chain);
  mocks.capability.mockResolvedValue({
    organizationId: "org",
    schoolId: "school",
  });
  mocks.user.mockResolvedValue({
    supabase: { from: mocks.from, rpc: mocks.rpc },
    user: { id: "owner" },
  });
  mocks.context.mockResolvedValue({
    active: { organizationId: "org", schoolId: "school" },
  });
  mocks.maybeSingle.mockResolvedValue({ data: { id: "batch" }, error: null });
  mocks.rpc.mockResolvedValue({ data: "new-version", error: null });
}
afterEach(() => vi.resetAllMocks());
describe("published result correction boundary", () => {
  it("requires correction authority before looking up a batch", async () => {
    setup();
    mocks.capability.mockRejectedValue(new Error("denied"));
    await expect(
      reopenBatch("batch", "Correct identity snapshot"),
    ).rejects.toThrow("denied");
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects unavailable or foreign-context batches before invoking correction", async () => {
    setup();
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(
      reopenBatch("foreign", "Correct identity snapshot"),
    ).rejects.toThrow("unavailable");
    expect(mocks.eq).toHaveBeenCalledWith("organization_id", "org");
    expect(mocks.eq).toHaveBeenCalledWith("school_id", "school");
    expect(mocks.eq).toHaveBeenCalledWith("status", "published");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("uses the existing version-preserving RPC for an authorized scoped publication", async () => {
    setup();
    await reopenBatch("batch", "Correct identity snapshot");
    expect(mocks.capability).toHaveBeenCalledWith({
      permission: "academics.results.correct",
      module: "academics",
      feature: "academics.result_workflow",
    });
    expect(mocks.rpc).toHaveBeenCalledWith("reopen_result_batch", {
      target_batch_id: "batch",
      reason: "Correct identity snapshot",
    });
  });
});
