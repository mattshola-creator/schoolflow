import { describe, expect, it } from "vitest";
import type { AuthorizationSnapshot } from "./evaluator";
import { buildWorkspaceAccess, describeAccessReason } from "./navigation";

const authorization: AuthorizationSnapshot = {
  organizationId: "00000000-0000-4000-8000-000000000001",
  schoolId: "00000000-0000-4000-8000-000000000002",
  permissions: [
    "organization.view",
    "finance.view",
    "academics.teaching_assignments.view",
    "students.view",
  ],
  modules: [
    { key: "foundation", entitled: true, enabled: true },
    { key: "finance", entitled: true, enabled: true },
    { key: "academics", entitled: true, enabled: true },
    { key: "students", entitled: true, enabled: true },
  ],
  features: [
    {
      key: "foundation.authorization_inspection",
      module: "foundation",
      enabled: true,
    },
    { key: "finance.fee_management", module: "finance", enabled: false },
    {
      key: "academics.teaching_management",
      module: "academics",
      enabled: false,
    },
    { key: "students.student_records", module: "students", enabled: true },
  ],
};

describe("workspace access presentation", () => {
  it("shows permitted modules and explains feature-gated ones", () => {
    const access = buildWorkspaceAccess(authorization);

    expect(access.available.map((item) => item.label)).toEqual(
      expect.arrayContaining(["Students", "Administration"]),
    );
    expect(access.unavailable.map((item) => item.label)).toEqual(
      expect.arrayContaining(["Teaching", "Finance"]),
    );
    expect(
      access.unavailable.every((item) => item.reason === "feature_disabled"),
    ).toBe(true);
  });

  it("does not advertise modules hidden only by missing permissions", () => {
    const access = buildWorkspaceAccess(authorization);

    expect(access.unavailable.map((item) => item.label)).not.toContain(
      "Admissions",
    );
    expect(describeAccessReason("feature_disabled")).toBe(
      "Not activated for this organization",
    );
  });
});
