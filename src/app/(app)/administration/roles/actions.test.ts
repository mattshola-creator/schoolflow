// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  workspace: vi.fn(),
  redirect: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/features/administration/role-management", () => ({
  roleWorkspace: mocks.workspace,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { changeRole } from "./actions";
const uid = "00000000-0000-4000-8000-000000000001",
  other = "00000000-0000-4000-8000-000000000002",
  rid = "00000000-0000-4000-8000-000000000003";
function client(results: unknown[]) {
  const calls: { table: string; operations: [string, unknown[]][] }[] = [];
  const from = vi.fn((table: string) => {
    const value = results.shift();
    const entry = { table, operations: [] as [string, unknown[]][] };
    calls.push(entry);
    const q: Record<string, unknown> = {
      then: (resolve: (x: unknown) => unknown) =>
        Promise.resolve(value).then(resolve),
    };
    for (const method of ["select", "eq", "limit", "insert", "update"])
      q[method] = (...args: unknown[]) => {
        entry.operations.push([method, args]);
        return q;
      };
    q.maybeSingle = () => Promise.resolve(value);
    q.single = () => Promise.resolve(value);
    return q;
  });
  return { from, calls };
}
function form(userId = other) {
  const f = new FormData();
  f.set("operation", "assign");
  f.set("userId", userId);
  f.set("roleId", rid);
  return f;
}
beforeEach(() => {
  vi.clearAllMocks();
});
function setup(results: unknown[]) {
  const c = client(results);
  mocks.workspace.mockResolvedValue({
    supabase: c,
    user: { id: uid },
    active: { organizationId: "org", schoolId: "school" },
    auth: { permissions: ["academics.scores.view"] },
  });
  return c;
}
describe("bounded school role actions", () => {
  function revokeForm() {
    const f = new FormData();
    f.set("operation", "revoke");
    f.set("assignmentId", rid);
    return f;
  }
  it("refuses to revoke your own assignment", async () => {
    const c = setup([{ data: { id: rid, user_id: uid, role_id: rid } }]);
    await changeRole(revokeForm());
    expect(c.calls).toHaveLength(1);
  });
  it("refuses to revoke protected Owner authority", async () => {
    const c = setup([
      { data: { id: rid, user_id: other, role_id: rid } },
      { data: { key: "organization_owner", is_system: true } },
    ]);
    await changeRole(revokeForm());
    expect(
      c.calls.some((c) => c.operations.some(([m]) => m === "update")),
    ).toBe(false);
  });
  it("ends only the selected active school assignment and retains history", async () => {
    const c = setup([
      { data: { id: rid, user_id: other, role_id: rid } },
      { data: { key: "teacher", is_system: false } },
      { data: [], error: null },
    ]);
    await changeRole(revokeForm());
    const write = c.calls[2];
    expect(write.operations).toContainEqual(["eq", ["school_id", "school"]]);
    expect(write.operations).toContainEqual(["eq", ["scope", "school"]]);
    expect(
      write.operations.find(([m]) => m === "update")?.[1][0],
    ).toMatchObject({ status: "ended" });
  });
  it("denies self-assignment before any database query", async () => {
    const c = setup([]);
    await changeRole(form(uid));
    expect(c.from).not.toHaveBeenCalled();
    expect(mocks.redirect).toHaveBeenCalledWith(
      expect.stringContaining("denied"),
    );
  });
  it("fails closed if management authorization fails", async () => {
    mocks.workspace.mockRejectedValue(new Error("denied"));
    await changeRole(form());
    expect(mocks.redirect).toHaveBeenCalledWith(
      expect.stringContaining("denied"),
    );
  });
  it("denies foreign or absent school membership", async () => {
    const c = setup([
      { data: { id: rid, key: "teacher", is_system: false } },
      { data: null },
      { data: { id: "member" } },
    ]);
    await changeRole(form());
    expect(
      c.calls.some((c) => c.operations.some(([m]) => m === "insert")),
    ).toBe(false);
  });
  it("blocks Owner/system roles", async () => {
    const c = setup([
      { data: { id: rid, key: "organization_owner", is_system: true } },
      { data: { id: "m" } },
      { data: { id: "m" } },
    ]);
    await changeRole(form());
    expect(c.calls).toHaveLength(3);
  });
  it("cannot delegate additional permissions", async () => {
    const c = setup([
      { data: { id: rid, key: "teacher", is_system: false } },
      { data: { id: "m" } },
      { data: { id: "m" } },
      { data: [{ permissions: { key: "role.manage" } }] },
    ]);
    await changeRole(form());
    expect(
      c.calls.some((c) => c.operations.some(([m]) => m === "insert")),
    ).toBe(false);
  });
  it("writes only the validated school role using the authenticated client", async () => {
    const c = setup([
      { data: { id: rid, key: "teacher", is_system: false } },
      { data: { id: "m" } },
      { data: { id: "m" } },
      { data: [{ permissions: { key: "academics.scores.view" } }] },
      { data: [] },
      { data: [], error: null },
    ]);
    await changeRole(form());
    const write = c.calls
      .flatMap((c) => c.operations)
      .find(([m]) => m === "insert");
    expect(write?.[1][0]).toMatchObject({
      organization_id: "org",
      school_id: "school",
      scope: "school",
      user_id: other,
      role_id: rid,
      status: "active",
    });
    expect(mocks.redirect).toHaveBeenCalledWith(
      expect.stringContaining("School%20role%20assigned"),
    );
  });
});
