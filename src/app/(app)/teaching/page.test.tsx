import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadTeachingAssignmentWorkspace } = vi.hoisted(() => ({
  loadTeachingAssignmentWorkspace: vi.fn(),
}));
vi.mock("@/features/academics/teaching-service", () => ({
  loadTeachingAssignmentWorkspace,
}));

import TeachingPage from "./page";

describe("teaching assignment page", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
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
        name: "Teaching assignments at QA School",
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
});
