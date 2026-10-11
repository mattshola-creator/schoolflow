import { describe, expect, it } from "vitest";
import {
  getAdministrationCapabilities,
  groupPermissions,
  shortMemberReference,
} from "./model";

const authorization = {
  organizationId: "org",
  schoolId: null,
  permissions: ["membership.view", "role.manage", "school.view"],
  modules: [],
  features: [],
};

describe("administration presentation model", () => {
  it("derives controls from the existing permission snapshot", () => {
    expect(getAdministrationCapabilities(authorization)).toEqual({
      viewMembers: true,
      manageMembers: false,
      viewRoles: false,
      manageRoles: true,
      manageOrganization: false,
      manageSchools: false,
    });
  });

  it("groups effective permissions without changing authority", () => {
    expect(groupPermissions(authorization.permissions)).toEqual([
      { key: "membership", label: "Membership", count: 1 },
      { key: "role", label: "Role", count: 1 },
      { key: "school", label: "School", count: 1 },
    ]);
  });

  it("uses a privacy-limited member reference", () => {
    expect(shortMemberReference("12345678-1234-1234-1234-123456789012")).toBe(
      "Member 12345678",
    );
  });
});
