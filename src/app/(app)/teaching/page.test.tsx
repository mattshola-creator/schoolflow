import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  loadTeachingAssignmentWorkspace,
  loadTimetableWorkspace,
  loadLessonWorkspace,
} = vi.hoisted(() => ({
  loadTeachingAssignmentWorkspace: vi.fn(),
  loadTimetableWorkspace: vi.fn(),
  loadLessonWorkspace: vi.fn(),
}));
vi.mock("@/features/academics/teaching-service", () => ({
  loadTeachingAssignmentWorkspace,
  loadTimetableWorkspace,
}));
vi.mock("@/features/academics/lesson-service", () => ({ loadLessonWorkspace }));

import TeachingPage from "./page";

describe("teaching assignment page", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadTimetableWorkspace.mockResolvedValue({ periods: [], entries: [] });
    loadLessonWorkspace.mockResolvedValue({ plans: [], homework: [] });
    loadTeachingAssignmentWorkspace.mockResolvedValue({
      active: { schoolName: "QA School" },
      authorization: {
        permissions: ["academics.teaching_assignments.view"],
      },
      sessions: [],
      levels: [],
      arms: [],
      subjects: [],
      staff: [],
      assignments: [],
    });
  });

  it("renders a read-only empty state without management controls", async () => {
    render(await TeachingPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", {
        name: "My Teaching",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No active teaching assignments/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create assignment" }),
    ).toBeNull();
  });

  it("shows the responsive create form only with management permission", async () => {
    loadTeachingAssignmentWorkspace.mockResolvedValueOnce({
      active: { schoolName: "QA School" },
      authorization: {
        permissions: [
          "academics.teaching_assignments.view",
          "academics.teaching_assignments.manage",
        ],
      },
      sessions: [],
      levels: [],
      arms: [],
      subjects: [],
      staff: [],
      assignments: [],
    });
    render(await TeachingPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("button", { name: "Create assignment" }),
    ).toBeInTheDocument();
  });

  it("fails closed when teaching management is disabled", async () => {
    loadTeachingAssignmentWorkspace.mockRejectedValueOnce(
      new Error("disabled"),
    );
    render(await TeachingPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", {
        name: "Teaching management is not available",
      }),
    ).toBeInTheDocument();
  });

  it("shows role-authorized teaching links without exposing management controls", async () => {
    loadTeachingAssignmentWorkspace.mockResolvedValueOnce({
      active: { schoolName: "QA School" },
      authorization: {
        permissions: [
          "academics.teaching_assignments.view",
          "academics.timetable.view",
          "academics.curriculum.view",
          "academics.lesson_plans.manage",
          "academics.homework.manage",
          "attendance.student.record",
        ],
      },
      sessions: [{ id: "session-1", name: "2026/2027" }],
      levels: [],
      arms: [],
      subjects: [],
      staff: [],
      assignments: [],
    });
    render(await TeachingPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getAllByRole("link", { name: /Timetable/ })[0],
    ).toHaveAttribute("href", "/teaching/timetable");
    expect(screen.getByRole("link", { name: /Homework/ })).toHaveAttribute(
      "href",
      "/teaching/lessons#homework-heading",
    );
    expect(
      screen.getAllByRole("link", { name: /Take attendance/ })[0],
    ).toHaveAttribute("href", "/attendance");
    expect(
      screen.queryByRole("button", { name: "Create assignment" }),
    ).toBeNull();
  });

  it("recognizes existing M8 lesson permissions for teaching activity access", async () => {
    loadTeachingAssignmentWorkspace.mockResolvedValueOnce({
      active: { schoolName: "QA School" },
      authorization: {
        permissions: ["academics.lesson_plans.manage"],
      },
      sessions: [],
      levels: [],
      arms: [],
      subjects: [],
      staff: [],
      assignments: [],
    });

    render(await TeachingPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("link", { name: "Lessons & homework" }),
    ).toHaveAttribute("href", "/teaching/lessons");
    expect(
      screen.queryByText("Lesson-plan access is not available in this role."),
    ).toBeNull();
  });
});
