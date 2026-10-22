import { describe, expect, it } from "vitest";
import {
  reportingFiltersSchema,
  reportingSearchSchema,
  sessionRolloverSchema,
} from "./schemas";

describe("reporting schemas", () => {
  it.each([false, true])(
    "rejects duplicate schools including case aliases (%s)",
    (uppercase) => {
      const schoolId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
      const schoolIds = [
        schoolId,
        uppercase ? schoolId.toUpperCase() : schoolId,
      ];
      expect(
        reportingFiltersSchema.safeParse({
          schoolIds,
          dateFrom: "2026-09-01",
          dateTo: "2026-09-30",
        }).success,
      ).toBe(false);
      expect(
        reportingSearchSchema.safeParse({ schoolIds, query: "student" })
          .success,
      ).toBe(false);
    },
  );
  it("rejects school scopes over the database limit", () => {
    expect(
      reportingSearchSchema.safeParse({
        schoolIds: Array.from({ length: 101 }, () => crypto.randomUUID()),
        query: "student",
      }).success,
    ).toBe(false);
  });
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
