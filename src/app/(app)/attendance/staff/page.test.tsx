import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadStaffClockWorkspace } = vi.hoisted(() => ({
  loadStaffClockWorkspace: vi.fn(),
}));
vi.mock("@/features/attendance/service", () => ({ loadStaffClockWorkspace }));

import StaffAttendancePage from "./page";

describe("staff attendance page", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadStaffClockWorkspace.mockResolvedValue({
      active: { schoolName: "QA School" },
      authorization: { permissions: ["attendance.configure"] },
      assignments: [
        {
          staff_assignment_id: crypto.randomUUID(),
          staff_name: "Ada Okafor",
          staff_number: "SF-001",
          position_name: "Teacher",
          policy_name: "Teaching staff",
          policy_starts_at: "07:30:00",
          policy_ends_at: "16:00:00",
          policy_grace_minutes: 15,
          clock_in_at: null,
          clock_out_at: null,
        },
      ],
    });
  });

  it("renders a mobile-safe clock card and protected setup link", async () => {
    render(
      await StaffAttendancePage({
        searchParams: Promise.resolve({}),
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Staff clock at QA School" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ada Okafor")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clock in" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /working-hours setup/i }),
    ).toHaveAttribute("href", "/attendance/staff/setup");
  });

  it("fails closed when the feature or context is unavailable", async () => {
    loadStaffClockWorkspace.mockRejectedValueOnce(new Error("disabled"));
    render(await StaffAttendancePage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", {
        name: "Staff attendance is not available",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clock in" })).toBeNull();
  });
});
