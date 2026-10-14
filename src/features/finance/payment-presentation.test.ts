import { describe, expect, it } from "vitest";
import {
  paymentAllocationLabel,
  paymentStatusLabel,
  sumMoneyAmounts,
} from "./payment-presentation";

describe("Finance payment presentation", () => {
  it("distinguishes recorded, verified, rejected, and reversed payments", () => {
    expect(paymentStatusLabel("recorded")).toBe("Pending verification");
    expect(paymentStatusLabel("verified")).toBe("Verified");
    expect(paymentStatusLabel("rejected")).toBe("Rejected");
    expect(paymentStatusLabel("reversed")).toBe("Reversed");
  });

  it("labels verified allocation states without floating-point comparisons", () => {
    expect(paymentAllocationLabel("verified", "100.00", "0.00")).toBe(
      "Not allocated",
    );
    expect(paymentAllocationLabel("verified", "100.00", "37.45")).toBe(
      "Partially allocated",
    );
    expect(paymentAllocationLabel("verified", "100.00", "100.00")).toBe(
      "Fully allocated",
    );
    expect(paymentAllocationLabel("recorded", "100.00", "0.00")).toBeNull();
  });

  it("keeps prior allocations visibly historical after a reversal", () => {
    expect(paymentAllocationLabel("reversed", "100.00", "45.00")).toBe(
      "Prior allocation retained in history",
    );
    expect(paymentAllocationLabel("reversed", "100.00", "0.00")).toBeNull();
  });

  it("sums allocations in exact minor units", () => {
    expect(sumMoneyAmounts(["0.10", "0.20", "10.05"])).toBe("10.35");
  });
});
