import { expect, it } from "vitest";
import {
  canIndependentlyVerifyPayment,
  paymentRegisterStatus,
} from "./payment-presentation";
it("never presents independent verification for the recorder or an unauthorized actor", () => {
  const payment = { status: "recorded", recorded_by: "recorder" };
  expect(canIndependentlyVerifyPayment(payment, "recorder", true)).toBe(false);
  expect(canIndependentlyVerifyPayment(payment, "verifier", false)).toBe(false);
  expect(canIndependentlyVerifyPayment(payment, "verifier", true)).toBe(true);
  expect(
    canIndependentlyVerifyPayment(
      { ...payment, status: "verified" },
      "verifier",
      true,
    ),
  ).toBe(false);
});
it("allowlists register filters", () => {
  expect(paymentRegisterStatus("recorded")).toBe("recorded");
  expect(paymentRegisterStatus("unexpected")).toBeUndefined();
});
