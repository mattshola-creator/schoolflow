import { describe, expect, it } from "vitest";
import {
  appearanceThemes,
  contrastRatio,
  defaultAppearanceTheme,
  isAppearanceTheme,
} from "./themes";

describe("curated appearance contracts", () => {
  it("defaults to Premium Emerald and rejects inherited or injected choices", () => {
    expect(defaultAppearanceTheme).toBe("premium-emerald");
    for (const value of ["__proto__", "constructor", "url(javascript:x)", ""]) {
      expect(isAppearanceTheme(value)).toBe(false);
    }
  });
  for (const [id, theme] of Object.entries(appearanceThemes)) {
    it(`${id} preserves readable text and primary action contrast`, () => {
      expect(isAppearanceTheme(id)).toBe(true);
      for (const background of [theme.surface, theme.canvas]) {
        expect(contrastRatio(theme.ink, background)).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(contrastRatio(theme.muted, background)).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(contrastRatio(theme.focus, background)).toBeGreaterThanOrEqual(
          3,
        );
      }
      expect(
        contrastRatio(theme.primaryInk, theme.primary),
      ).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(theme.gold, theme.forest)).toBeGreaterThanOrEqual(
        4.5,
      );
    });
  }
  it("uses reference contrast values and refuses arbitrary styling", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBe(21);
    expect(contrastRatio("#123456", "#123456")).toBe(1);
    expect(() => contrastRatio("red;display:none", "#FFFFFF")).toThrow();
  });
  it("keeps text readable at both hero gradient endpoints and sidebar selection", () => {
    for (const background of ["#073D2B", "#087C57"]) {
      expect(contrastRatio("#FFFFFF", background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio("#E6F4ED", background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio("#E8F6EE", "#166247")).toBeGreaterThanOrEqual(4.5);
  });
});
