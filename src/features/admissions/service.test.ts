import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import {
  loadAdmission,
  loadAdmissions,
  requireAdmissionsContext,
} from "./service";

vi.mock("@/lib/authorization", () => ({ requireCapability: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext: vi.fn() }));

describe("RU4 admissions school boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireUser).mockResolvedValue({
      supabase: {} as never,
      user: { id: "user-a" } as never,
    });
  });

  it("uses exact school-scoped counts and deterministic filtered pagination", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      in: vi.fn(),
      ilike: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({
          data: [],
          count: 37,
          error: null,
        }).then(resolve),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.in.mockReturnValue(query);
    query.ilike.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.range.mockReturnValue(query);
    const from = vi.fn().mockReturnValue(query);
    vi.mocked(requireUser).mockResolvedValue({
      supabase: { from } as never,
      user: { id: "user-a" } as never,
    });
    vi.mocked(requireCapability).mockResolvedValue({
      organizationId: "org-a",
      schoolId: "school-a",
      permissions: ["admissions.view"],
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

    const result = await loadAdmissions({
      page: 2,
      query: "",
      status: "under_review",
      source: "parent_online",
      sort: "oldest",
    });

    expect(result.count).toBe(37);
    expect(query.select).toHaveBeenCalledWith(
      expect.stringContaining("application_number"),
      { count: "exact" },
    );
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-a");
    expect(query.eq).toHaveBeenCalledWith("school_id", "school-a");
    expect(query.eq).toHaveBeenCalledWith("status", "under_review");
    expect(query.eq).toHaveBeenCalledWith("source", "parent_online");
    expect(query.order).toHaveBeenNthCalledWith(1, "created_at", {
      ascending: true,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", { ascending: true });
    expect(query.range).toHaveBeenCalledWith(20, 39);
  });

  it("rejects organization-wide context because applications require a school", async () => {
    vi.mocked(requireCapability).mockResolvedValue({
      organizationId: "org-a",
      schoolId: null,
    } as never);
    await expect(requireAdmissionsContext()).rejects.toThrow(
      "school context is required",
    );
    expect(loadTenantContext).not.toHaveBeenCalled();
  });

  it("rejects a context that differs from the authorization snapshot", async () => {
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
    await expect(requireAdmissionsContext()).rejects.toThrow(
      "active school context is invalid",
    );
  });

  it("fails closed before Applicant 360 when the record is outside the active school", async () => {
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

    await expect(loadAdmission("application-from-school-b")).rejects.toThrow(
      "Admission record is unavailable",
    );
    expect(from).toHaveBeenCalledTimes(1);
    expect(query.eq).toHaveBeenCalledWith("organization_id", "org-a");
    expect(query.eq).toHaveBeenCalledWith("school_id", "school-a");
  });
});
