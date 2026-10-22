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
