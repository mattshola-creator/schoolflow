import { describe, expect, it } from "vitest";
import { appearanceThemes, contrastRatio } from "../appearance/themes";
import {
  demoThemeAvailable,
  resolveShowroomTheme,
  showroomThemes,
} from "./catalog";

describe("isolated showroom catalog", () => {
  it("preserves the original eight IDs and adds four original collections", () => {
    expect(showroomThemes.map((theme) => theme.id)).toEqual([
      "emerald",
      "ocean",
      "amethyst",
      "sunrise",
      "slate",
      "midnight",
      "obsidian",
      "aurora",
      "winter-frost",
      "autumn-heritage",
      "spring-bloom",
      "midnight-luxe",
    ]);
    expect(
      showroomThemes.filter((theme) => theme.tier === "core"),
    ).toHaveLength(6);
    expect(
      showroomThemes.filter((theme) => theme.tier === "composition"),
    ).toHaveLength(2);
    expect(
      showroomThemes.filter((theme) => theme.texture !== "none"),
    ).toHaveLength(4);
  });
  it("simulates six, eight and twelve choices without real subscription writes", () => {
    for (const [plan, count] of [
      ["starter", 6],
      ["growth", 8],
      ["professional", 12],
      ["enterprise", 12],
    ] as const)
      expect(
        showroomThemes.filter((theme) => demoThemeAvailable(theme.tier, plan)),
      ).toHaveLength(count);
    expect(
      demoThemeAvailable(resolveShowroomTheme("midnight").tier, "starter"),
    ).toBe(true);
  });
  it("retains old palette contracts and rejects unrecognized keys", () => {
    expect(resolveShowroomTheme("premium-emerald").primary).toBe(
      appearanceThemes["premium-emerald"].primary,
    );
    expect(resolveShowroomTheme("midnight-emerald").canvas).toBe(
      appearanceThemes["midnight-emerald"].canvas,
    );
    expect(resolveShowroomTheme("classic-light").primary).toBe(
      appearanceThemes["classic-light"].primary,
    );
    expect(resolveShowroomTheme("classic-light").canvas).toBe(
      appearanceThemes["classic-light"].canvas,
    );
    for (const id of [
      "__proto__",
      "constructor",
      "unknown",
      "https://example.com/style.css",
    ])
      expect(resolveShowroomTheme(id).id).toBe("emerald");
  });
  it("meets body text, muted text and primary action token contrast", () => {
    for (const theme of showroomThemes) {
      expect(
        contrastRatio(theme.ink, theme.surface),
        theme.name,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(theme.muted, theme.surface),
        theme.name,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(theme.muted, theme.canvas),
        theme.name,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(theme.primary, theme.surface),
        theme.name,
      ).toBeGreaterThanOrEqual(3);
      expect(
        contrastRatio(theme.onPrimary, theme.primary),
        theme.name,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
