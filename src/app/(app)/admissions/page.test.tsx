import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadAdmissions } = vi.hoisted(() => ({ loadAdmissions: vi.fn() }));
vi.mock("@/features/admissions/service", () => ({ loadAdmissions }));

import AdmissionsPage from "./page";

const result = {
  active: { schoolName: "Cedarbridge Primary" },
  authorization: {
    permissions: ["admissions.view", "admissions.manage"],
  },
  applications: [
    {
      id: "application-1",
      application_number: "APP-2026-001",
      status: "under_review",
      applicant: { first_name: "Amara", last_name: "Okafor" },
      class_levels: { name: "Primary 5" },
      academic_sessions: { name: "2026/2027" },
    },
  ],
  count: 21,
  page: 1,
  pageSize: 20,
};

describe("RU4 admissions register", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadAdmissions.mockResolvedValue(result);
  });

  it("renders an accurate school-scoped count and responsive applicant views", async () => {
    render(await AdmissionsPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", {
        name: "Admissions at Cedarbridge Primary",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("21 authorized applications")).toBeInTheDocument();
    expect(screen.getAllByText("Amara Okafor")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: /New application/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Admissions register pages" }),
    ).toBeInTheDocument();
  });

  it("passes normalized filters and preserves them in pagination", async () => {
    loadAdmissions.mockResolvedValueOnce({ ...result, count: 41, page: 2 });
    render(
      await AdmissionsPage({
        searchParams: Promise.resolve({
          q: " Amara ",
          page: "2",
          status: "under_review",
          source: "parent_online",
          sort: "oldest",
        }),
      }),
    );
    expect(loadAdmissions).toHaveBeenCalledWith({
      query: "Amara",
      page: 2,
      status: "under_review",
      source: "parent_online",
      sort: "oldest",
    });
    const previous = screen.getByRole("link", { name: "Previous" });
    expect(previous).toHaveAttribute(
      "href",
      expect.stringContaining("q=Amara"),
    );
    expect(previous).toHaveAttribute(
      "href",
      expect.stringContaining("source=parent_online"),
    );
  });

  it("does not expose management actions to view-only users", async () => {
    loadAdmissions.mockResolvedValueOnce({
      ...result,
      authorization: { permissions: ["admissions.view"] },
    });
    render(await AdmissionsPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.queryByRole("link", { name: /New application/i }),
    ).not.toBeInTheDocument();
  });
});
