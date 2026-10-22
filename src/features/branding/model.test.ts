import { expect, it } from "vitest";
import { showroomThemes } from "@/features/showroom/catalog";
import {
  themePermitted,
  validatedAppearance,
  cropSchema,
  customBackgroundPermitted,
} from "./model";
it.each([
  ["starter", 6],
  ["growth", 8],
  ["professional", 12],
  ["enterprise", 12],
] as const)("enforces %s theme availability", (plan, total) => {
  expect(showroomThemes.filter((t) => themePermitted(t.id, plan))).toHaveLength(
    total,
  );
});
it("keeps legacy identifiers and free dark appearance", () => {
  for (const id of ["premium-emerald", "classic-light", "midnight-emerald"])
    expect(themePermitted(id, "starter")).toBe(true);
});
it("rejects arbitrary styling, unknown themes and unsubscribed collections", () => {
  for (const themeId of ["url(javascript:bad)", "missing", "winter-frost"]) {
    expect(() =>
      validatedAppearance(
        { themeId, preset: "executive", focalX: 50, focalY: 50, overlay: 0.65 },
        "starter",
      ),
    ).toThrow();
  }
});
it("rejects crops outside image bounds and unsafe overlay values", () => {
  expect(
    cropSchema.safeParse({ x: 0.8, y: 0, width: 0.5, height: 1 }).success,
  ).toBe(false);
  expect(() =>
    validatedAppearance(
      {
        themeId: "emerald",
        preset: "executive",
        focalX: 50,
        focalY: 50,
        overlay: 0.2,
      },
      "starter",
    ),
  ).toThrow();
});
it("does not let core theme access imply custom image access", () => {
  expect(customBackgroundPermitted("starter")).toBe(false);
  expect(customBackgroundPermitted("growth")).toBe(false);
  expect(customBackgroundPermitted("professional")).toBe(true);
});

// The Studio header overlays its full gradient with 65% black before white text.
it("keeps Studio gradient header text readable across all curated themes", async () => {
  const { contrastRatio } = await import("@/features/appearance/themes");
  for (const theme of showroomThemes) {
    for (let step = 0; step <= 20; step++) {
      const mix = step / 20;
      const color =
        "#" +
        [1, 3, 5]
          .map((offset) => {
            const left = parseInt(theme.nav.slice(offset, offset + 2), 16);
            const right = parseInt(theme.primary.slice(offset, offset + 2), 16);
            return Math.round((left * (1 - mix) + right * mix) * 0.35)
              .toString(16)
              .padStart(2, "0");
          })
          .join("");
      expect(contrastRatio("#FFFFFF", color)).toBeGreaterThanOrEqual(4.5);
    }
  }
});
