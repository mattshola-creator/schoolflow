import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadStaffClockCorrections, loadStaffClockWorkspace } = vi.hoisted(
  () => ({
    loadStaffClockCorrections: vi.fn(),
    loadStaffClockWorkspace: vi.fn(),
  }),
);
vi.mock("@/features/attendance/service", () => ({
  loadStaffClockCorrections,
  loadStaffClockWorkspace,
}));

import StaffAttendancePage from "./page";

describe("staff attendance page", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadStaffClockCorrections.mockResolvedValue([]);
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

  it("shows controlled correction forms only with correction permission", async () => {
    const eventId = crypto.randomUUID();
    loadStaffClockWorkspace.mockResolvedValueOnce({
      active: { schoolName: "QA School" },
      authorization: {
        permissions: ["attendance.staff.correct"],
      },
      assignments: [],
    });
    loadStaffClockCorrections.mockResolvedValueOnce([
      {
        clock_event_id: eventId,
        staff_assignment_id: crypto.randomUUID(),
        staff_name: "Ada Okafor",
        staff_number: "SF-001",
        position_name: "Teacher",
        event_type: "clock_in",
        effective_occurred_at: "2026-09-28T07:30:00+01:00",
        attendance_date: "2026-09-28",
      },
    ]);

    render(
      await StaffAttendancePage({
        searchParams: Promise.resolve({ date: "2026-09-28" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Controlled clock corrections" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save correction" }),
    ).toBeInTheDocument();
    expect(loadStaffClockCorrections).toHaveBeenCalledWith("2026-09-28");
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
