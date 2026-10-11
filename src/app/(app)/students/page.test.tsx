import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadStudents } = vi.hoisted(() => ({ loadStudents: vi.fn() }));
vi.mock("@/features/students/service", () => ({ loadStudents }));

import StudentsPage from "./page";

const result = {
  active: { schoolName: "Cedarbridge Primary" },
  authorization: { permissions: ["students.view", "students.manage"] },
  students: [
    {
      id: "enrollment-1",
      status: "active",
      academic_sessions: { name: "2026/2027" },
      student_profiles: {
        id: "student-1",
        student_number: "CBP-001",
        people: { first_name: "Amara", last_name: "Okafor" },
      },
      class_memberships: [
        {
          status: "active",
          class_levels: { name: "Primary 5" },
          class_arms: { name: "A" },
        },
      ],
    },
  ],
  count: 21,
  page: 1,
  pageSize: 20,
  classLevels: [
    { id: "11111111-1111-4111-8111-111111111111", name: "Primary 5" },
  ],
};

describe("RU3 student register", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadStudents.mockResolvedValue(result);
  });

  it("renders accurate count, responsive record views and authorized actions", async () => {
    render(await StudentsPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", { name: "Students at Cedarbridge Primary" }),
    ).toBeInTheDocument();
    expect(screen.getByText("21 authorized learners")).toBeInTheDocument();
    expect(screen.getAllByText("Amara Okafor")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: /Add student/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Student register pages" }),
    ).toBeInTheDocument();
  });

  it("passes normalized search, scope filters and sorting to the service", async () => {
    const classLevelId = "11111111-1111-4111-8111-111111111111";
    loadStudents.mockResolvedValueOnce({ ...result, count: 41, page: 2 });
    render(
      await StudentsPage({
        searchParams: Promise.resolve({
          q: " Amara ",
          page: "2",
          status: "transferred",
          classLevelId,
          sort: "oldest",
        }),
      }),
    );
    expect(loadStudents).toHaveBeenCalledWith({
      query: "Amara",
      page: 2,
      status: "transferred",
      classLevelId,
      sort: "oldest",
    });
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      expect.stringContaining("q=Amara"),
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      expect.stringContaining("page=1"),
    );
  });

  it("keeps management actions hidden from view-only users", async () => {
    loadStudents.mockResolvedValueOnce({
      ...result,
      authorization: { permissions: ["students.view"] },
    });
    render(await StudentsPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.queryByRole("link", { name: /Add student/i }),
    ).not.toBeInTheDocument();
  });
});
