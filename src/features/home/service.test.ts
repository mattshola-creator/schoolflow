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

  it("rejects a context that differs from the authorization snapshot", async () => {
    await expect(
      loadOperationalHome(active, {
        organizationId: active.organizationId,
        schoolId: "00000000-0000-4000-8000-000000000099",
        permissions: ["shared.tasks.view"],
        modules: [{ key: "foundation", entitled: true, enabled: true }],
        features: [
          {
            key: "foundation.action_center",
            module: "foundation",
            enabled: true,
          },
        ],
      }),
    ).rejects.toThrow("active operational context is invalid");
    expect(requireUser).not.toHaveBeenCalled();
  });

  it("uses exact authorized totals while keeping returned lists bounded", async () => {
    const results = [
      {
        data: [
          {
            id: "task-1",
            title: "Task",
            status: "open",
            priority: "urgent",
            due_at: null,
          },
        ],
        count: 47,
        error: null,
      },
      {
        data: [
          {
            id: "approval-1",
            title: "Approval",
            status: "pending",
            created_at: "2026-10-10T00:00:00Z",
          },
        ],
        count: 26,
        error: null,
      },
      {
        data: [
          {
            id: "notice-1",
            title: "Notice",
            href: "/communication",
            created_at: "2026-10-10T00:00:00Z",
          },
        ],
        count: 81,
        error: null,
      },
      { data: null, count: 23, error: null },
    ];
    const queries: Array<{
      calls: Array<[string, unknown[]]>;
      then: PromiseLike<unknown>["then"];
      [key: string]: unknown;
    }> = [];
    const supabase = {
      from: vi.fn(() => {
        const result = results[queries.length];
        const query: (typeof queries)[number] = {
          calls: [],
          then: (onfulfilled, onrejected) =>
            Promise.resolve(result).then(onfulfilled, onrejected),
        };
        for (const method of [
          "select",
          "eq",
          "in",
          "is",
          "or",
          "order",
          "limit",
        ])
          query[method] = (...args: unknown[]) => {
            query.calls.push([method, args]);
            return query;
          };
        queries.push(query);
        return query;
      }),
    };
    vi.mocked(requireUser).mockResolvedValue({
      supabase: supabase as never,
      user: { id: "user-1" } as never,
    });

    const result = await loadOperationalHome(active, {
      organizationId: active.organizationId,
      schoolId: active.schoolId,
      permissions: ["shared.tasks.view"],
      modules: [{ key: "foundation", entitled: true, enabled: true }],
      features: [
        {
          key: "foundation.action_center",
          module: "foundation",
          enabled: true,
        },
      ],
    });

    expect(result.tasks).toHaveLength(3);
    expect(result.counts).toEqual({
      tasks: 47,
      approvals: 26,
      notifications: 81,
      urgent: 49,
    });
    expect(
      queries
        .slice(0, 3)
        .every((query) =>
          query.calls.some(
            ([method, args]) => method === "limit" && args[0] === 20,
          ),
        ),
    ).toBe(true);
    expect(
      [0, 1, 3].every((index) =>
        queries[index].calls.some(
          ([method, args]) =>
            method === "eq" &&
            args[0] === "school_id" &&
            args[1] === active.schoolId,
        ),
      ),
    ).toBe(true);
    expect(
      [2].every((index) =>
        queries[index].calls.some(
          ([method, args]) =>
            method === "or" && String(args[0]).includes(active.schoolId),
        ),
      ),
    ).toBe(true);
  });
});
