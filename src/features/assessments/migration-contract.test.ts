import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20261001090000_m10_assessment_results.sql",
  ),
  "utf8",
);

describe("assessment database contracts", () => {
  it("enforces tenant access, feature gates and academic locks", () => {
    expect(migration).toContain("can_access_assessments");
    expect(migration).toContain("has_school_membership");
    expect(migration).toContain("is_feature_enabled");
    expect(migration).toContain("assessment_period_locked");
  });

  it("keeps scoring, transitions and promotion server-authoritative", () => {
    expect(migration).toContain("upsert_assessment_score");
    expect(migration).toContain("transition_result_batch");
    expect(migration).toContain("promote_student");
    expect(migration).toContain("for update");
  });

  it("preserves immutable publication and idempotent promotion evidence", () => {
    expect(migration).toContain("result_publications");
    expect(migration).toContain("unique (batch_id)");
    expect(migration).toContain("unique (school_id, idempotency_key)");
    expect(migration).toContain("correction_of_id");
  });
});
