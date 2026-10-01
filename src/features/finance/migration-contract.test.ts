import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("finance database workflow contracts", () => {
  it("casts CASE-based status transitions to their PostgreSQL enums", () => {
    const migration = readFileSync(
      join(
        process.cwd(),
        "supabase/migrations/20261001112500_m9_finance_enum_status_fixes.sql",
      ),
      "utf8",
    );
    expect(migration).toContain("'verified'::public.payment_status");
    expect(migration).toContain("'approved'::public.expense_status");
    expect(migration).toContain("'reconciled'::public.reconciliation_status");
  });
});
