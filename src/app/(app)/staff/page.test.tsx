import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadStaff } = vi.hoisted(() => ({ loadStaff: vi.fn() }));
vi.mock("@/features/staff/service", () => ({ loadStaff }));

import StaffPage from "./page";

const result = {
  active: { schoolName: "Cedarbridge Academy" },
  authorization: { permissions: ["staff.view", "staff.manage"] },
  staff: [
    {
      id: "assignment-1",
      status: "active",
      positions: { name: "Teacher" },
      departments: { name: "Science" },
      employments: { employment_type: "permanent" },
      staff_profiles: {
        id: "staff-1",
        staff_number: "CBA-STAFF-01",
        people: { first_name: "Chidi", last_name: "Nwosu" },
      },
    },
  ],
  count: 21,
  page: 1,
  pageSize: 20,
  departments: [
    { id: "22222222-2222-4222-8222-222222222222", name: "Science" },
  ],
};

describe("RU3 staff register", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadStaff.mockResolvedValue(result);
  });

  it("renders accurate count, responsive record views and authorized actions", async () => {
    render(await StaffPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", { name: "Staff at Cedarbridge Academy" }),
    ).toBeInTheDocument();
    expect(screen.getByText("21 authorized staff members")).toBeInTheDocument();
    expect(screen.getAllByText("Chidi Nwosu")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: /Add staff/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Staff register pages" }),
    ).toBeInTheDocument();
  });

  it("passes normalized filters, pagination and sorting to the service", async () => {
    const departmentId = "22222222-2222-4222-8222-222222222222";
    render(
      await StaffPage({
        searchParams: Promise.resolve({
          q: " Chidi ",
          page: "2",
          status: "planned",
          departmentId,
          sort: "oldest",
        }),
      }),
    );
    expect(loadStaff).toHaveBeenCalledWith({
      query: "Chidi",
      page: 2,
      status: "planned",
      departmentId,
      sort: "oldest",
    });
  });

  it("does not present management controls to view-only staff", async () => {
    loadStaff.mockResolvedValueOnce({
      ...result,
      authorization: { permissions: ["staff.view"] },
    });
    render(await StaffPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.queryByRole("link", { name: /Add staff/i }),
    ).not.toBeInTheDocument();
  });
});
