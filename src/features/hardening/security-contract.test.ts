import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const netlify = readFileSync("netlify.toml", "utf8");
const next = readFileSync("next.config.ts", "utf8");
const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

describe("M13 production hardening contracts", () => {
  it("sends baseline browser security headers", () => {
    expect(netlify).toContain('X-Content-Type-Options = "nosniff"');
    expect(netlify).toContain('X-Frame-Options = "DENY"');
    expect(netlify).toContain('Strict-Transport-Security = "max-age=31536000"');
    expect(netlify).toContain(
      'Referrer-Policy = "strict-origin-when-cross-origin"',
    );
    expect(netlify).toContain('Cross-Origin-Opener-Policy = "same-origin"');
    expect(next).toContain('key: "X-DNS-Prefetch-Control", value: "off"');
    expect(next).toContain(
      'key: "Cross-Origin-Opener-Policy", value: "same-origin"',
    );
  });

  it("keeps production dependency and secret checks in CI", () => {
    expect(workflow).toContain("pnpm audit --audit-level=high");
    expect(workflow).toContain("Potential privileged secret found");
  });

  it("does not grant sensitive browser capabilities", () => {
    expect(netlify).toContain(
      'Permissions-Policy = "camera=(), microphone=(), geolocation=()"',
    );
  });
});
