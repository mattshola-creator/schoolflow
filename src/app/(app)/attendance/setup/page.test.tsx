import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { loadAttendanceFoundation } = vi.hoisted(() => ({
  loadAttendanceFoundation: vi.fn(),
}));
vi.mock("@/features/attendance/service", () => ({ loadAttendanceFoundation }));

import AttendanceSetupPage from "./page";

afterEach(cleanup);

describe("attendance setup page", () => {
  it("renders the authorized baseline policy form", async () => {
    loadAttendanceFoundation.mockResolvedValue({
      active: { schoolName: "QA School" },
      authorization: { permissions: ["attendance.configure"] },
      settings: null,
      calendarExceptions: [],
    });
    render(await AttendanceSetupPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", { name: "Attendance policy for QA School" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Lock corrections after")).toHaveValue("1");
    expect(screen.getByLabelText("Monday")).toBeChecked();
    expect(screen.getByLabelText("Sunday")).not.toBeChecked();
  });

  it("fails closed when configuration is unavailable", async () => {
    loadAttendanceFoundation.mockRejectedValueOnce(new Error("disabled"));
    render(await AttendanceSetupPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", {
        name: "Attendance setup is not available",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save attendance policy" }),
    ).not.toBeInTheDocument();
  });
});
