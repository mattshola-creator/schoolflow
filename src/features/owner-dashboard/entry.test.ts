// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { shouldOpenOwnerDashboard } from "./entry";
const auth = {
  organizationId: "org",
  schoolId: "school",
  permissions: ["organization.view"],
  modules: [{ key: "foundation", entitled: true, enabled: true }],
  features: [
    {
      key: "foundation.authorization_inspection",
      module: "foundation",
      enabled: true,
    },
  ],
};
const active = { organizationId: "org", schoolId: "school" };
function client(
  rows: unknown[] = [{ effective_from: "2020-01-01", effective_to: null }],
  error: unknown = null,
) {
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    then: (done: (r: unknown) => unknown) =>
      Promise.resolve({ data: rows, error }).then(done),
  };
  q.select.mockReturnValue(q);
  q.eq.mockReturnValue(q);
  return { from: vi.fn().mockReturnValue(q), q };
}
beforeEach(() => {
  vi.stubEnv("SCHOOLFLOW_SHELL_REVIEW", "true");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://afqykqlxecpzspjoyegc.supabase.co",
  );
});
afterEach(() => vi.unstubAllEnvs());
describe("QA Owner login destination", () => {
  it("works when the server has no build-only CONTEXT variable", async () => {
    vi.stubEnv("CONTEXT", undefined);
    expect(
      await shouldOpenOwnerDashboard(
        client() as never,
        "u",
        active as never,
        auth,
      ),
    ).toBe(true);
  });
  it("requires an identity-bound effective organization Owner assignment", async () => {
    const c = client();
    expect(
      await shouldOpenOwnerDashboard(
        c as never,
        "actual-user",
        active as never,
        auth,
      ),
    ).toBe(true);
    expect(c.q.eq).toHaveBeenCalledWith("user_id", "actual-user");
    expect(c.q.eq).toHaveBeenCalledWith("organization_id", "org");
    expect(c.q.eq).toHaveBeenCalledWith("roles.key", "organization_owner");
    expect(c.q.eq).toHaveBeenCalledWith("scope", "organization");
  });
  it.each(["false", undefined])(
    "does not activate without the compiled QA marker (%s)",
    async (marker) => {
      vi.stubEnv("SCHOOLFLOW_SHELL_REVIEW", marker);
      const c = client();
      expect(
        await shouldOpenOwnerDashboard(c as never, "u", active as never, auth),
      ).toBe(false);
      expect(c.from).not.toHaveBeenCalled();
    },
  );
  it("excludes production project binding", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://production.supabase.co");
    const c = client();
    expect(
      await shouldOpenOwnerDashboard(c as never, "u", active as never, auth),
    ).toBe(false);
    expect(c.from).not.toHaveBeenCalled();
  });
  it("retains explicit legacy escape and group context", async () => {
    const c = client();
    expect(
      await shouldOpenOwnerDashboard(
        c as never,
        "u",
        active as never,
        auth,
        true,
      ),
    ).toBe(false);
    expect(
      await shouldOpenOwnerDashboard(
        c as never,
        "u",
        { ...active, schoolId: null } as never,
        auth,
      ),
    ).toBe(false);
    expect(c.from).not.toHaveBeenCalled();
  });
  it("denies foreign context, missing permission and entitlement before querying roles", async () => {
    const c = client();
    for (const a of [
      { ...auth, schoolId: "foreign" },
      { ...auth, permissions: [] },
      { ...auth, modules: [] },
    ])
      expect(
        await shouldOpenOwnerDashboard(c as never, "u", active as never, a),
      ).toBe(false);
    expect(c.from).not.toHaveBeenCalled();
  });
  it("does not route teachers or expired owners", async () => {
    for (const rows of [
      [],
      [{ effective_from: "2020-01-01", effective_to: "2021-01-01" }],
    ])
      expect(
        await shouldOpenOwnerDashboard(
          client(rows) as never,
          "u",
          active as never,
          auth,
        ),
      ).toBe(false);
  });
  it("preserves unexpected lookup failures", async () => {
    await expect(
      shouldOpenOwnerDashboard(
        client([], new Error("backend")) as never,
        "u",
        active as never,
        auth,
      ),
    ).rejects.toThrow("authority lookup failed");
  });
});
