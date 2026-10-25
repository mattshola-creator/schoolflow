// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { loadOwnerAppearance } from "./appearance";
function client({
  personal = null,
  published = "ocean",
  denied = [] as string[],
  fail = false,
}: {
  personal?: string | null;
  published?: string | null;
  denied?: string[];
  fail?: boolean;
} = {}) {
  const queries: { table: string; filters: [string, unknown][] }[] = [];
  return {
    queries,
    rpc: vi.fn(async (_name: string, args: { theme: string }) => ({
      data: !denied.includes(args.theme),
      error: fail ? {} : null,
    })),
    from: vi.fn((table: string) => {
      const entry = { table, filters: [] as [string, unknown][] };
      queries.push(entry);
      const q = {
        select: () => q,
        eq: (key: string, value: unknown) => {
          entry.filters.push([key, value]);
          return q;
        },
        maybeSingle: async () => ({
          error: null,
          data:
            table === "school_branding_state"
              ? published
                ? { published_version_id: "published-id" }
                : null
              : table === "school_appearance_preferences"
                ? personal
                  ? { theme_id: personal }
                  : null
                : { config: { themeId: published } },
        }),
      };
      return q;
    }),
  };
}
describe("Owner published appearance precedence", () => {
  it("loads only the scoped published selection, never a draft", async () => {
    const c = client();
    expect(
      await loadOwnerAppearance(c as never, "user", "org", "school"),
    ).toEqual({ themeId: "ocean", source: "published", fallback: false });
    for (const q of c.queries) {
      expect(q.filters).toContainEqual(["organization_id", "org"]);
      expect(q.filters).toContainEqual(["school_id", "school"]);
    }
    expect(
      c.queries.find((q) => q.table === "school_branding_versions")?.filters,
    ).toContainEqual(["id", "published-id"]);
  });
  it("uses only the current user's eligible personal preference", async () => {
    const c = client({ personal: "midnight" });
    expect(
      (await loadOwnerAppearance(c as never, "user", "org", "school")).source,
    ).toBe("personal");
    expect(
      c.queries.find((q) => q.table === "school_appearance_preferences")
        ?.filters,
    ).toContainEqual(["user_id", "user"]);
    expect(c.queries.some((q) => q.table === "school_branding_versions")).toBe(
      false,
    );
  });
  it("falls back from revoked personal to eligible published appearance", async () => {
    expect(
      await loadOwnerAppearance(
        client({ personal: "obsidian", denied: ["obsidian"] }) as never,
        "u",
        "org",
        "school",
      ),
    ).toEqual({ themeId: "ocean", source: "published", fallback: true });
  });
  it("falls back after published downgrade without writing or deleting history", async () => {
    const c = client({ published: "winter-frost", denied: ["winter-frost"] });
    expect(await loadOwnerAppearance(c as never, "u", "org", "school")).toEqual(
      { themeId: "emerald", source: "default", fallback: true },
    );
    expect(c.rpc).toHaveBeenCalledWith("school_branding_theme_allowed", {
      org: "org",
      school: "school",
      theme: "winter-frost",
    });
  });
  it("defaults safely when nothing is published", async () => {
    expect(
      (
        await loadOwnerAppearance(
          client({ published: null }) as never,
          "u",
          "org",
          "school",
        )
      ).themeId,
    ).toBe("emerald");
  });
  it("does not turn entitlement failures into a grant or normal fallback", async () => {
    await expect(
      loadOwnerAppearance(
        client({ fail: true }) as never,
        "u",
        "org",
        "school",
      ),
    ).rejects.toThrow("entitlement lookup failed");
  });
  it("rejects unrecognized persisted styling", async () => {
    await expect(
      loadOwnerAppearance(
        client({ published: "url(unsafe)" }) as never,
        "u",
        "org",
        "school",
      ),
    ).rejects.toThrow("unavailable");
  });
});
