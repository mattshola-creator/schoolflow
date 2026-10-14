import { describe, expect, it } from "vitest";
import { parseSchoolScopeQuery } from "./scope-query";

describe("parseSchoolScopeQuery", () => {
  it("accepts comma-separated links and repeated form values", () => {
    expect(parseSchoolScopeQuery("school-a,school-b")).toEqual([
      "school-a",
      "school-b",
    ]);
    expect(parseSchoolScopeQuery(["school-a", "school-b"])).toEqual([
      "school-a",
      "school-b",
    ]);
  });

  it("deduplicates repeated values and leaves an empty scope to the service default", () => {
    expect(parseSchoolScopeQuery(["school-a", "school-a,school-b"])).toEqual([
      "school-a",
      "school-b",
    ]);
    expect(parseSchoolScopeQuery(undefined)).toBeUndefined();
    expect(parseSchoolScopeQuery(["", "  "])).toBeUndefined();
  });
});
