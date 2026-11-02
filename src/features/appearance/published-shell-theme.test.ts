import { describe, expect, it } from "vitest";
import { publishedShellThemeStyle } from "./published-shell-theme";
import { showroomThemes } from "@/features/showroom/catalog";
import { contrastRatio } from "./themes";
import { shellThemeStyle } from "./shell-theme";
describe("published scoped shell tokens", () => {
  it("keeps published and temporary flagship aliases visually consistent", () => {
    expect(publishedShellThemeStyle("emerald")).toEqual(
      shellThemeStyle("premium-emerald"),
    );
    expect(publishedShellThemeStyle("midnight")).toEqual(
      shellThemeStyle("midnight-emerald"),
    );
    expect(publishedShellThemeStyle("ocean")).toEqual(shellThemeStyle("ocean"));
  });
  for (const t of showroomThemes)
    it(t.id + " preserves readable navigation, body and primary text", () => {
      const s = publishedShellThemeStyle(t.id) as Record<string, string>;
      expect(Object.keys(s).every((k) => k.startsWith("--shell-"))).toBe(true);
      expect(
        contrastRatio(s["--shell-nav-ink"], s["--shell-nav"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(s["--shell-ink"], s["--shell-surface"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(s["--shell-muted"], s["--shell-surface"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(s["--shell-primary-ink"], s["--shell-primary"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(s["--shell-nav-focus"], s["--shell-nav"]),
      ).toBeGreaterThanOrEqual(3);
    });
});
