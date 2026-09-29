import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadStaffTimeOffWorkspace } = vi.hoisted(() => ({
  loadStaffTimeOffWorkspace: vi.fn(),
}));
vi.mock("@/features/staff/service", () => ({ loadStaffTimeOffWorkspace }));

import StaffTimeOffPage from "./page";

describe("staff time-off page", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadStaffTimeOffWorkspace.mockResolvedValue({
      timezone: "Africa/Lagos",
      authorization: {
        permissions: [
          "staff.time_off.request",
          "staff.time_off.manage",
          "school.manage",
        ],
      },
      assignments: [
        {
          staff_assignment_id: crypto.randomUUID(),
          staff_name: "Ada Okafor",
          staff_number: "SF-001",
        },
      ],
      policies: [
        {
          policy_id: crypto.randomUUID(),
          policy_key: "staff.permission",
          policy_name: "Staff permission",
        },
      ],
      leaveTypes: [],
      requests: [],
    });
  });

  it("shows the authoritative timezone and protected configuration", async () => {
    render(await StaffTimeOffPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText(/Africa\/Lagos/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save timezone" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit for approval" }),
    ).toBeEnabled();
  });

  it("fails closed when the feature is unavailable", async () => {
    loadStaffTimeOffWorkspace.mockRejectedValueOnce(new Error("disabled"));
    render(await StaffTimeOffPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", { name: "Time off unavailable" }),
    ).toBeInTheDocument();
  });
});
