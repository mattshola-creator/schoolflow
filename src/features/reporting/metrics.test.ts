import { describe, expect, it } from "vitest";
import { addMoney, attendanceRate, formatNgn } from "./metrics";

describe("reporting metrics", () => {
  it("adds exact money without floating point arithmetic", () => {
    expect(addMoney(["9007199254740993.11", "0.89", "-1.00"])).toBe(
      "9007199254740993.00",
    );
    expect(formatNgn("1250000.5")).toBe("₦1,250,000.50");
  });
  it("uses present plus late as the supplied attendance numerator", () => {
    expect(attendanceRate(8, 10)).toBe("80.0%");
    expect(attendanceRate(0, 0)).toBe("—");
  });
});
