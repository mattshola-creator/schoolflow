import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  loadTeachingAssignmentWorkspace,
  loadStudentAttendanceWorkspace,
  loadStudentAttendanceRoster,
  loadLessonWorkspace,
} = vi.hoisted(() => ({
  loadTeachingAssignmentWorkspace: vi.fn(),
  loadStudentAttendanceWorkspace: vi.fn(),
  loadStudentAttendanceRoster: vi.fn(),
  loadLessonWorkspace: vi.fn(),
}));

vi.mock("@/features/academics/teaching-service", () => ({
  loadTeachingAssignmentWorkspace,
}));
vi.mock("@/features/attendance/service", () => ({
  loadStudentAttendanceWorkspace,
  loadStudentAttendanceRoster,
}));
vi.mock("@/features/academics/lesson-service", () => ({ loadLessonWorkspace }));

import TeachingClassPage from "./page";

describe("teaching class workspace", () => {
  const ids = {
    assignment: "fb03a4f3-344d-453c-a81e-5dcc41dcbcc5",
    session: "4a004bb9-a05e-41f4-b891-efef88795e77",
    level: "11111111-1111-4111-8111-111111111111",
    arm: "22222222-2222-4222-8222-222222222222",
    student: "33333333-3333-4333-8333-333333333333",
  };

  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadTeachingAssignmentWorkspace.mockResolvedValue({
      active: { schoolName: "QA School" },
      authorization: {
        permissions: [
          "academics.teaching_assignments.view",
          "attendance.student.record",
          "academics.homework.manage",
        ],
      },
      sessions: [{ id: ids.session, name: "2026/2027" }],
      levels: [{ id: ids.level, name: "Primary 4" }],
      arms: [{ id: ids.arm, name: "Blue" }],
      subjects: [{ id: "subject-1", name: "Mathematics" }],
      staff: [],
      assignments: [
        {
          id: ids.assignment,
          session_id: ids.session,
          assignment_type: "subject_teacher",
          status: "active",
          started_on: "2026-09-01",
          ended_on: null,
          staff_assignment_id: "staff-1",
          subject_id: "subject-1",
          class_level_id: ids.level,
          class_arm_id: ids.arm,
        },
      ],
    });
    loadStudentAttendanceWorkspace.mockResolvedValue({
      scopes: [
        {
          session_id: ids.session,
          session_name: "2026/2027",
          class_level_id: ids.level,
          class_level_name: "Primary 4",
          class_arm_id: ids.arm,
          class_arm_name: "Blue",
          student_count: 1,
        },
      ],
    });
    loadStudentAttendanceRoster.mockResolvedValue({
      roster: [
        {
          student_id: ids.student,
          student_number: "QA-001",
          first_name: "Ada",
          last_name: "Okafor",
        },
      ],
    });
    loadLessonWorkspace.mockResolvedValue({
      plans: [],
      homework: [
        {
          id: "homework-1",
          teaching_assignment_id: ids.assignment,
          title: "Fractions",
          due_on: "2026-10-20",
          status: "published",
        },
      ],
    });
  });

  it("shows the class-scoped roster, activities, and a scoped attendance link", async () => {
    render(
      await TeachingClassPage({
        params: Promise.resolve({ assignmentId: ids.assignment }),
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Primary 4 · Blue" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ada Okafor")).toBeInTheDocument();
    expect(screen.getByText("Fractions")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open attendance/ }),
    ).toHaveAttribute("href", expect.stringContaining("/attendance?date="));
    expect(loadStudentAttendanceRoster).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: ids.session,
        classLevelId: ids.level,
        classArmId: ids.arm,
        registerType: "morning",
      }),
    );
  });

  it("fails closed for assignments outside the loaded authorized scope", async () => {
    render(
      await TeachingClassPage({
        params: Promise.resolve({ assignmentId: "not-authorized" }),
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Class workspace unavailable" }),
    ).toBeInTheDocument();
    expect(loadStudentAttendanceWorkspace).not.toHaveBeenCalled();
    expect(loadStudentAttendanceRoster).not.toHaveBeenCalled();
  });

  it("does not load or display a roster when attendance permission is absent", async () => {
    loadTeachingAssignmentWorkspace.mockResolvedValueOnce({
      active: { schoolName: "QA School" },
      authorization: { permissions: ["academics.teaching_assignments.view"] },
      sessions: [],
      levels: [{ id: ids.level, name: "Primary 4" }],
      arms: [],
      subjects: [],
      staff: [],
      assignments: [
        {
          id: ids.assignment,
          session_id: ids.session,
          assignment_type: "class_teacher",
          status: "active",
          started_on: "2026-09-01",
          ended_on: null,
          staff_assignment_id: "staff-1",
          subject_id: null,
          class_level_id: ids.level,
          class_arm_id: null,
        },
      ],
    });
    render(
      await TeachingClassPage({
        params: Promise.resolve({ assignmentId: ids.assignment }),
      }),
    );
    expect(
      screen.getByText(/roster is unavailable in this workspace/),
    ).toBeInTheDocument();
    expect(loadStudentAttendanceWorkspace).not.toHaveBeenCalled();
  });
});
