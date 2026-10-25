import { AuthorizationError } from "@/lib/authorization";
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

  it("provides a focused daily view and accessible day selection", async () => {
    render(
      await TimetablePage({
        searchParams: Promise.resolve({ view: "daily", day: "2" }),
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Tuesday timetable" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Select timetable day" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Monday" }),
    ).not.toBeInTheDocument();
  });

  it("fails closed when the feature is disabled", async () => {
    loadTimetableWorkspace.mockRejectedValueOnce(
      new AuthorizationError("feature_disabled"),
    );
    render(await TimetablePage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", { name: "Timetable is not available" }),
    ).toBeInTheDocument();
  });
});

it("does not describe unexpected timetable failures as missing access", async () => {
  const error = new Error("Timetable source unavailable");
  loadTimetableWorkspace.mockRejectedValueOnce(error);
  await expect(
    TimetablePage({ searchParams: Promise.resolve({}) }),
  ).rejects.toBe(error);
});
it("keeps an actual authorization denial unavailable", async () => {
  const { AuthorizationError } = await import("@/lib/authorization");
  loadTimetableWorkspace.mockRejectedValueOnce(
    new AuthorizationError("permission_denied"),
  );
  render(await TimetablePage({ searchParams: Promise.resolve({}) }));
  expect(
    screen.getByRole("heading", { name: "Timetable is not available" }),
  ).toBeInTheDocument();
});

it.each([
  [undefined, "current"],
  ["foreign", "current"],
  ["planned", "planned"],
])(
  "selects current session by default while preserving valid requested scope %s",
  async (requested, expected) => {
    loadTimetableWorkspace.mockResolvedValueOnce({
      ...workspace,
      sessions: [
        { id: "planned", name: "Future session", status: "planned" },
        { id: "current", name: "Current session", status: "current" },
      ],
    });
    render(
      await TimetablePage({
        searchParams: Promise.resolve({ session: requested }),
      }),
    );
    expect(
      screen.getByRole("combobox", { name: "Academic session" }),
    ).toHaveValue(expected);
    cleanup();
  },
);
