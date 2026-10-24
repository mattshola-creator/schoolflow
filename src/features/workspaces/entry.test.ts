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

it("routes score-only teachers to existing assignment-scoped Assessment without granting teaching access", () => {
  const teacher: AuthorizationSnapshot = {
    organizationId: "org",
    schoolId: "school",
    permissions: ["academics.scores.view"],
    modules: [{ key: "academics", enabled: true, entitled: true }],
    features: [
      { key: "academics.score_entry", module: "academics", enabled: true },
    ],
  };
  expect(workspaceDestination("teaching", teacher)).toBe("/assessments");
  expect(
    workspaceDestination("teaching", { ...teacher, permissions: [] }),
  ).toBeNull();
  expect(
    workspaceDestination("teaching", { ...teacher, features: [] }),
  ).toBeNull();
  expect(
    workspaceDestination("teaching", { ...teacher, schoolId: null }),
  ).toBeNull();
  expect(
    workspaceDestination("teaching", { ...teacher, modules: [] }),
  ).toBeNull();
});
