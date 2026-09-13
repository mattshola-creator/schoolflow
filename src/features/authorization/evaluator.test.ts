import { describe, expect, it } from "vitest";
import { evaluateAccess, type AuthorizationSnapshot } from "./evaluator";

const snapshot: AuthorizationSnapshot = {
  organizationId: "org-a",
  schoolId: "school-a",
  permissions: ["students.view"],
  modules: [
    { key: "students", entitled: true, enabled: true },
    { key: "finance", entitled: false, enabled: true },
    { key: "attendance", entitled: true, enabled: false },
  ],
  features: [
    { key: "students.directory", module: "students", enabled: true },
    { key: "students.import", module: "students", enabled: false },
  ],
};

describe("evaluateAccess", () => {
  it("allows a permitted, entitled and enabled capability", () => {
    expect(
      evaluateAccess(snapshot, {
        permission: "students.view",
        module: "students",
        feature: "students.directory",
      }),
    ).toEqual({ allowed: true, reason: "allowed" });
  });

  it.each([
    [
      { permission: "students.manage", module: "students" },
      "permission_denied",
    ],
    [{ permission: "finance.view", module: "finance" }, "not_entitled"],
    [
      { permission: "attendance.view", module: "attendance" },
      "module_disabled",
    ],
    [
      {
        permission: "students.view",
        module: "students",
        feature: "students.import",
      },
      "feature_disabled",
    ],
  ] as const)("denies %o as %s", (requirement, reason) => {
    expect(evaluateAccess(snapshot, requirement)).toEqual({
      allowed: false,
      reason,
    });
  });
});
