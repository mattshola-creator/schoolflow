import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadTimetableWorkspace } = vi.hoisted(() => ({
  loadTimetableWorkspace: vi.fn(),
}));
vi.mock("@/features/academics/teaching-service", () => ({
  loadTimetableWorkspace,
}));
import TimetablePage from "./page";

const workspace = {
  active: { schoolName: "QA School" },
  authorization: { permissions: ["academics.timetable.view"] },
  sessions: [],
  periods: [],
  assignments: [],
  entries: [],
  levels: [],
  arms: [],
  subjects: [],
  staff: [],
};

describe("manual timetable page", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadTimetableWorkspace.mockResolvedValue(workspace);
  });

  it("renders a responsive read-only weekly timetable", async () => {
    render(await TimetablePage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", { name: "Manual timetable at QA School" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Monday" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create period" })).toBeNull();
  });

  it("shows management controls only with timetable management permission", async () => {
    loadTimetableWorkspace.mockResolvedValueOnce({
      ...workspace,
      authorization: {
        permissions: ["academics.timetable.view", "academics.timetable.manage"],
      },
    });
    render(await TimetablePage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("button", { name: "Create period" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Check and allocate" }),
    ).toBeInTheDocument();
  });

  it("fails closed when the feature is disabled", async () => {
    loadTimetableWorkspace.mockRejectedValueOnce(new Error("disabled"));
    render(await TimetablePage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", { name: "Timetable is not available" }),
    ).toBeInTheDocument();
  });
});
