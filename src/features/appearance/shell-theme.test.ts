import { describe, expect, it } from "vitest";
import { shellThemeStyle } from "./shell-theme";
import { appearanceThemes, contrastRatio } from "./themes";

describe("scoped shell adapter", () => {
  for (const id of Object.keys(
    appearanceThemes,
  ) as (keyof typeof appearanceThemes)[]) {
    it(`${id} keeps navigation and primary text readable without changing application tokens`, () => {
      const style = shellThemeStyle(id) as Record<string, string>;
      expect(
        Object.keys(style).every((key) => key.startsWith("--shell-")),
      ).toBe(true);
      expect(
        contrastRatio(style["--shell-nav-ink"], style["--shell-nav"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(style["--shell-nav-ink"], style["--shell-nav-selected"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(style["--shell-nav-muted"], style["--shell-nav"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(
          style["--shell-nav-muted"],
          style["--shell-nav-selected"],
        ),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(style["--shell-primary-ink"], style["--shell-primary"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(style["--shell-nav-focus"], style["--shell-nav"]),
      ).toBeGreaterThanOrEqual(3);
    });
  }
});
