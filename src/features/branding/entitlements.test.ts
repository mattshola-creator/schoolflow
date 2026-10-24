import { expect, it, vi } from "vitest";
import { readGalleryAccess } from "./entitlements";
it.each([
  [[true, false, false], "starter"],
  [[true, true, false], "growth"],
  [[true, true, true], "professional"],
  [[false, false, false], null],
] as const)(
  "uses only approved boolean RPCs for %s",
  async (values, profile) => {
    const probe = vi
      .fn()
      .mockResolvedValueOnce({ data: values[0], error: null })
      .mockResolvedValueOnce({ data: values[1], error: null })
      .mockResolvedValueOnce({ data: values[2], error: null });
    expect(await readGalleryAccess(probe, "org", "school")).toBe(profile);
    expect(probe.mock.calls).toEqual([
      [
        "school_branding_theme_allowed",
        { org: "org", school: "school", theme: "emerald" },
      ],
      [
        "school_branding_theme_allowed",
        { org: "org", school: "school", theme: "obsidian" },
      ],
      ["school_branding_images_allowed", { org: "org", school: "school" }],
    ]);
  },
);
it("preserves unexpected entitlement failures", async () => {
  await expect(
    readGalleryAccess(
      vi.fn().mockResolvedValue({ data: null, error: { code: "42501" } }),
      "org",
      "school",
    ),
  ).rejects.toThrow("lookup failed");
});
it("rejects malformed RPC responses rather than granting default access", async () => {
  await expect(
    readGalleryAccess(
      vi.fn().mockResolvedValue({ data: "true", error: null }),
      "org",
      "school",
    ),
  ).rejects.toThrow("lookup failed");
});
