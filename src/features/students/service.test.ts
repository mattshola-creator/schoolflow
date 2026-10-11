import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { loadStudent, requireStudentContext } from "./service";

vi.mock("@/lib/authorization", () => ({ requireCapability: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext: vi.fn() }));

describe("student service school boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireUser).mockResolvedValue({
      supabase: {} as never,
      user: { id: "user-a" } as never,
    });
  });

  it("rejects organization-wide context because student records require a school", async () => {
    vi.mocked(requireCapability).mockResolvedValue({
      organizationId: "org-a",
      schoolId: null,
    } as never);
    await expect(requireStudentContext()).rejects.toThrow(
      "school context is required",
    );
    expect(loadTenantContext).not.toHaveBeenCalled();
  });

  it("rejects a tenant context that differs from the authorization snapshot", async () => {
    vi.mocked(requireCapability).mockResolvedValue({
      organizationId: "org-a",
      schoolId: "school-a",
    } as never);
    vi.mocked(loadTenantContext).mockResolvedValue({
      active: {
        organizationId: "org-a",
        organizationName: "Group",
        schoolId: "school-b",
        schoolName: "Other school",
      },
      options: [],
    });
    await expect(requireStudentContext()).rejects.toThrow(
      "active school context is invalid",
    );
  });

  it("fails closed before loading Student 360 when the learner has no enrollment in the active school", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    const from = vi.fn().mockReturnValue(query);
    vi.mocked(requireUser).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-a" } as never,
    });
    vi.mocked(requireCapability).mockResolvedValue({
      organizationId: "org-a",
      schoolId: "school-a",
    } as never);
    vi.mocked(loadTenantContext).mockResolvedValue({
      active: {
        organizationId: "org-a",
        organizationName: "Group",
        schoolId: "school-a",
        schoolName: "School A",
      },
      options: [],
    });

    await expect(loadStudent("student-from-school-b")).rejects.toThrow(
      "unavailable in this school context",
    );
    expect(from).toHaveBeenCalledTimes(1);
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-a");
    expect(query.eq).toHaveBeenCalledWith("school_id", "school-a");
  });
});
