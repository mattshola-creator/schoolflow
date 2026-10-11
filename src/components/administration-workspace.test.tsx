import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AdministrationWorkspace } from "./administration-workspace";

const workspace = {
  active: {
    organizationId: "org-a",
    organizationName: "Cedarbridge Group",
    schoolId: "school-a",
    schoolName: "Cedarbridge Primary",
  },
  options: [
    {
      organizationId: "org-a",
      organizationName: "Cedarbridge Group",
      schoolId: "school-a",
      schoolName: "Cedarbridge Primary",
    },
  ],
  permissions: {
    viewMembers: true,
    manageMembers: false,
    viewRoles: true,
    manageRoles: false,
    manageOrganization: false,
    manageSchools: false,
  },
  permissionGroups: [{ key: "membership", label: "Membership", count: 1 }],
  permissionCount: 1,
  memberCount: 4,
  invitationCount: 1,
  assignmentCount: 1,
  invitations: [
    {
      id: "invite-1",
      email: "new.staff@example.test",
      status: "pending" as const,
      expires_at: "2026-10-20T00:00:00Z",
      school_id: "school-a",
      roles: { name: "Teacher" },
    },
  ],
  assignments: [
    {
      id: "assignment-1",
      user_id: "12345678-1234-1234-1234-123456789012",
      scope: "school" as const,
      status: "active" as const,
      school_id: "school-a",
      roles: { name: "Teacher" },
      schools: { name: "Cedarbridge Primary" },
      management_groups: null,
    },
  ],
  groups: [],
  modules: [
    {
      label: "Finance",
      description: "School finance",
      available: false,
      reason: "This module is not enabled for this organization.",
    },
  ],
};

afterEach(cleanup);

describe("Administration workspace", () => {
  it("presents authorized live-scope summaries and privacy-limited access", () => {
    render(<AdministrationWorkspace workspace={workspace} />);
    expect(screen.getByText("new.staff@example.test")).toBeInTheDocument();
    expect(screen.getByText("Member 12345678")).toBeInTheDocument();
    expect(screen.getAllByText("Cedarbridge Primary")).not.toHaveLength(0);
  });

  it("keeps module unavailability distinct from permissions", () => {
    render(<AdministrationWorkspace workspace={workspace} />);
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("This module is not enabled for this organization."),
    ).toBeInTheDocument();
  });

  it("explains hidden member and role data", () => {
    render(
      <AdministrationWorkspace
        workspace={{
          ...workspace,
          permissions: {
            ...workspace.permissions,
            viewMembers: false,
            viewRoles: false,
          },
          memberCount: null,
          invitationCount: null,
          assignmentCount: null,
          invitations: [],
          assignments: [],
        }}
      />,
    );
    expect(
      screen.getByText(/does not include membership viewing/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not include role viewing/i),
    ).toBeInTheDocument();
  });
});
