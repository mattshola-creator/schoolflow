import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { loadStaffAttendanceSetup } = vi.hoisted(() => ({
  loadStaffAttendanceSetup: vi.fn(),
}));
vi.mock("@/features/attendance/service", () => ({ loadStaffAttendanceSetup }));

import StaffAttendanceSetupPage from "./page";

afterEach(cleanup);

describe("staff attendance setup page", () => {
  it("renders default and position policy controls", async () => {
    loadStaffAttendanceSetup.mockResolvedValue({
      active: { schoolName: "QA School" },
      positions: [
        { position_id: crypto.randomUUID(), position_name: "Teacher" },
      ],
      policies: [],
    });
    render(
      await StaffAttendanceSetupPage({ searchParams: Promise.resolve({}) }),
    );
    expect(
      screen.getByRole("heading", { name: "Working hours for QA School" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Policy applies to")).toHaveTextContent(
      "All staff (school default)",
    );
    expect(screen.getByLabelText("Monday")).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Save working-hours policy" }),
    ).toBeInTheDocument();
  });
});
