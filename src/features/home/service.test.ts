import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireUser } from "@/lib/auth";
import { loadOperationalHome } from "./service";

vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));

const active = {
  organizationId: "00000000-0000-4000-8000-000000000001",
  organizationName: "Cedarbridge",
  schoolId: "00000000-0000-4000-8000-000000000002",
  schoolName: "Cedarbridge Primary",
};

describe("operational Home service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not query records when the established capability is denied", async () => {
    const result = await loadOperationalHome(active, {
      organizationId: active.organizationId,
      schoolId: active.schoolId,
      permissions: ["students.view"],
      modules: [{ key: "foundation", entitled: true, enabled: true }],
      features: [
        {
          key: "foundation.action_center",
          module: "foundation",
          enabled: true,
        },
      ],
    });

    expect(requireUser).not.toHaveBeenCalled();
    expect(result.canViewWork).toBe(false);
    expect(result.tasks).toEqual([]);
  });
});
