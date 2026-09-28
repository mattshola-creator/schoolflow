import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    loadStudentAttendanceWorkspace.mockResolvedValue({
      active: { schoolName: "QA School" },
      authorization: { permissions: ["attendance.student.correct"] },
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

  it("shows controlled correction forms only for submitted entries and authorized users", async () => {
    const scope = await loadStudentAttendanceWorkspace();
    const selected = scope.scopes[0];
    loadStudentAttendanceWorkspace.mockResolvedValue(scope);
    loadStudentAttendanceRoster.mockResolvedValue({
      roster: [
        {
          student_id: crypto.randomUUID(),
          student_number: "QA-001",
          first_name: "Ada",
          last_name: "Okafor",
          register_id: crypto.randomUUID(),
          entry_id: crypto.randomUUID(),
          attendance_status: "present",
          attendance_note: null,
          submitted_at: "2026-09-28T08:00:00Z",
          locks_at: "2026-09-29T08:00:00Z",
        },
      ],
    });
    render(
      await AttendancePage({
        searchParams: Promise.resolve({
          date: "2026-09-28",
          scope: `${selected.session_id}:${selected.class_level_id}:none`,
        }),
      }),
    );
    expect(screen.getByLabelText("Attendance corrections")).toBeInTheDocument();
    expect(screen.getByLabelText("New status")).not.toHaveTextContent(
      "Present",
    );
    expect(screen.getByLabelText("Audit reason")).toBeRequired();
    expect(
      screen.getByRole("button", { name: "Save correction" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Submit register" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a submitted register read-only when correction permission is absent", async () => {
    const scope = await loadStudentAttendanceWorkspace();
    const selected = scope.scopes[0];
    loadStudentAttendanceWorkspace.mockResolvedValue({
      ...scope,
      authorization: { permissions: [] },
    });
    loadStudentAttendanceRoster.mockResolvedValue({
      roster: [
        {
          student_id: crypto.randomUUID(),
          student_number: "QA-001",
          first_name: "Ada",
          last_name: "Okafor",
          register_id: crypto.randomUUID(),
          entry_id: crypto.randomUUID(),
          attendance_status: "present",
        },
      ],
    });
    render(
      await AttendancePage({
        searchParams: Promise.resolve({
          date: "2026-09-28",
          scope: `${selected.session_id}:${selected.class_level_id}:none`,
        }),
      }),
    );
    expect(
      screen.getByText(/do not have permission to correct/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Attendance corrections"),
    ).not.toBeInTheDocument();
  });
});
