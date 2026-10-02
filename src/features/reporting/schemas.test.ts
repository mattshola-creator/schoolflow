import { describe, expect, it } from "vitest";
import {
  reportingFiltersSchema,
  reportingSearchSchema,
  sessionRolloverSchema,
} from "./schemas";

describe("reporting schemas", () => {
  it("accepts deterministic scoped filters", () => {
    expect(
      reportingFiltersSchema.safeParse({
        schoolIds: [crypto.randomUUID()],
        dateFrom: "2026-09-01",
        dateTo: "2026-09-30",
      }).success,
    ).toBe(true);
  });
  it("rejects reversed ranges and empty school scope", () => {
    expect(
      reportingFiltersSchema.safeParse({
        schoolIds: [],
        dateFrom: "2026-10-01",
        dateTo: "2026-09-01",
      }).success,
    ).toBe(false);
  });
  it("bounds global search and rollover dates", () => {
    expect(
      reportingSearchSchema.safeParse({
        query: "a",
        schoolIds: [crypto.randomUUID()],
      }).success,
    ).toBe(false);
    expect(
      sessionRolloverSchema.safeParse({
        sourceSessionId: crypto.randomUUID(),
        targetName: "2027/2028",
        targetStart: "2027-09-01",
        targetEnd: "2027-07-01",
        idempotencyKey: crypto.randomUUID(),
      }).success,
    ).toBe(false);
  });
});
