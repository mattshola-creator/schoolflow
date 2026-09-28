import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadStudentAttendanceRoster, loadStudentAttendanceWorkspace } =
  vi.hoisted(() => ({
    loadStudentAttendanceRoster: vi.fn(),
    loadStudentAttendanceWorkspace: vi.fn(),
  }));

vi.mock("@/features/attendance/service", () => ({
  loadStudentAttendanceRoster,
  loadStudentAttendanceWorkspace,
}));

import AttendancePage from "./page";

describe("student attendance page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadStudentAttendanceWorkspace.mockResolvedValue({
      active: { schoolName: "QA School" },
      settings: {
        closing_register_enabled: false,
        lock_after_days: 1,
        enabled_student_statuses: ["present", "late", "absent"],
      },
      scopes: [
        {
          session_id: crypto.randomUUID(),
          session_name: "2026/2027",
          class_level_id: crypto.randomUUID(),
          class_level_name: "Primary 4",
          class_arm_id: null,
          class_arm_name: null,
          student_count: 2,
        },
      ],
    });
  });

  it("renders a responsive class/date selector without loading a roster early", async () => {
    render(
      await AttendancePage({
        searchParams: Promise.resolve({ date: "2026-09-28" }),
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Attendance at QA School" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Attendance date")).toHaveValue("2026-09-28");
    expect(screen.getByLabelText("Class")).toHaveTextContent(
      "Primary 4 · 2026/2027 (2)",
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(loadStudentAttendanceRoster).not.toHaveBeenCalled();
  });

  it("fails closed when the feature or context is unavailable", async () => {
    loadStudentAttendanceWorkspace.mockRejectedValueOnce(new Error("disabled"));
    render(
      await AttendancePage({
        searchParams: Promise.resolve({ date: "2026-09-28" }),
      }),
    );
    expect(
      screen.getByRole("heading", {
        name: "Student attendance is not available",
      }),
    ).toBeInTheDocument();
    expect(loadStudentAttendanceRoster).not.toHaveBeenCalled();
  });
});
