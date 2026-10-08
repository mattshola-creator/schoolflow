import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("PX1 design-system contract", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const reference = readFileSync(
    "src/app/(app)/experience-preview/page.tsx",
    "utf8",
  );
  it("defines semantic, tenant accent, focus and motion tokens", () => {
    for (const token of [
      "--tenant-accent",
      "--status-success",
      "--status-danger",
      "--focus-ring",
      "--motion-standard",
      "--radius-lg",
      "--shadow-md",
    ])
      expect(css).toContain(token);
  });
  it("honors reduced-motion preferences", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("transition-duration: 0.01ms");
  });
  it("uses a mobile learner-card view while retaining the standard table", () => {
    expect(reference).toContain('className="hidden md:block"');
    expect(reference).toContain(
      'aria-label="Synthetic learner reference data"',
    );
    expect(reference).toContain('className="divide-border border-border');
    expect(reference).toContain("<DataTable");
  });
});
