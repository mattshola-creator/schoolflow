import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/20261001230144_m12_management_reporting.sql",
  "utf8",
);
describe("M12 database contract", () => {
  it("authorizes every requested school including cross-school scope", () => {
    expect(sql).toContain("foreach sid in array requested_schools");
    expect(sql).toContain("reporting.cross_school.view");
    expect(sql).toContain("public.can_access_reporting(org,sid");
  });
  it("keeps money exact and operational tables authoritative", () => {
    expect(sql).toContain("sum(c.original_amount)");
    expect(sql).toContain("::text");
    expect(sql).not.toContain("double precision");
    expect(sql).not.toContain("materialized view");
  });
  it("uses bounded searches and minimal access audit evidence", () => {
    expect(sql).toContain("char_length(q)<2");
    expect(sql).toContain("queryLength");
    expect(sql).not.toContain("queryText");
    expect(sql).toContain("reporting_access_events");
  });
  it("creates locked close and idempotent draft rollover controls", () => {
    expect(sql).toContain("Source session must be closed");
    expect(sql).toContain("idempotencyKey");
    expect(sql).toContain("'draft'");
    expect(sql).toContain("academic_locks");
  });
  it("enables RLS and denies direct event insertion", () => {
    expect(sql).toContain("enable row level security");
    expect(sql).toContain(
      "revoke all on public.reporting_access_events from anon,authenticated",
    );
  });
});
