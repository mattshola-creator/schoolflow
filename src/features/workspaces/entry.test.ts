import { expect, it } from "vitest";
import { parseWorkspace, workspaceDestination } from "./entry";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
const auth: AuthorizationSnapshot = {
  organizationId: "org",
  schoolId: "school",
  permissions: ["finance.view"],
  modules: [{ key: "finance", entitled: true, enabled: true }],
  features: [
    { key: "finance.fee_management", module: "finance", enabled: true },
  ],
};
it("ignores external URLs and unknown login intents", () => {
  expect(parseWorkspace("https://evil.example")).toBe("auto");
  expect(workspaceDestination("https://evil.example", auth)).toBeNull();
});
it("requires effective permissions, entitlement, feature and school", () => {
  expect(workspaceDestination("finance", auth)).toBe("/finance/overview");
  expect(
    workspaceDestination("finance", { ...auth, permissions: [] }),
  ).toBeNull();
  expect(
    workspaceDestination("finance", { ...auth, schoolId: null }),
  ).toBeNull();
  expect(workspaceDestination("finance", { ...auth, modules: [] })).toBeNull();
  expect(workspaceDestination("finance", { ...auth, features: [] })).toBeNull();
});
it("a platform or Owner selection never grants authority", () => {
  expect(workspaceDestination("platform", auth)).toBeNull();
  expect(workspaceDestination("owner", auth)).toBeNull();
  expect(workspaceDestination("leadership", auth)).toBeNull();
});
