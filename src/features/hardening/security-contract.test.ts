import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const netlify = readFileSync("netlify.toml", "utf8");
const next = readFileSync("next.config.ts", "utf8");
const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const databaseBackup = readFileSync("scripts/backup-database.sh", "utf8");
const storageBackup = readFileSync("scripts/backup-storage.mjs", "utf8");

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

  it("keeps database and private storage backups explicit and separate", () => {
    expect(databaseBackup).toContain("supabase db dump");
    expect(databaseBackup).toContain("--data-only --use-copy");
    expect(databaseBackup).toContain("sha256sum");
    expect(storageBackup).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(storageBackup).toContain("client.storage.listBuckets()");
    expect(storageBackup).toContain('join(destination, "manifest.json")');
  });
});
