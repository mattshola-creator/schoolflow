import { expect, it } from "vitest";
import { AuthorizationError } from "@/lib/authorization";
import { unavailableOnAuthorizationDenial } from "./workspace-errors";
it.each([
  "permission_denied",
  "invalid_context",
  "not_entitled",
  "module_disabled",
  "feature_disabled",
] as const)("keeps %s as a record-free unavailable section", (reason) => {
  expect(
    unavailableOnAuthorizationDenial(new AuthorizationError(reason)),
  ).toBeNull();
});
it("preserves unexpected failures for the error boundary", () => {
  const error = new Error("Data source failed");
  expect(() => unavailableOnAuthorizationDenial(error)).toThrow(error);
});
