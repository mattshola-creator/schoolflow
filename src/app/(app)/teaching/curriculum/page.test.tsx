import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadCurriculumWorkspace } = vi.hoisted(() => ({
  loadCurriculumWorkspace: vi.fn(),
}));
vi.mock("@/features/academics/curriculum-service", () => ({
  loadCurriculumWorkspace,
}));
import CurriculumPage from "./page";

const workspace = {
  active: { schoolName: "QA School" },
  authorization: { permissions: ["academics.curriculum.view"] },
  sessions: [],
  periods: [],
  assignments: [],
  items: [],
  levels: [],
  arms: [],
  subjects: [],
  staff: [],
};

describe("curriculum coverage page", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    loadCurriculumWorkspace.mockResolvedValue(workspace);
  });
  it("renders a read-only coverage summary", async () => {
    render(await CurriculumPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", { name: "Curriculum coverage at QA School" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No curriculum items have been planned."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create curriculum item" }),
    ).toBeNull();
  });
  it("shows controls only with manage permission", async () => {
    loadCurriculumWorkspace.mockResolvedValueOnce({
      ...workspace,
      authorization: {
        permissions: [
          "academics.curriculum.view",
          "academics.curriculum.manage",
        ],
      },
    });
    render(await CurriculumPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("button", { name: "Create curriculum item" }),
    ).toBeInTheDocument();
  });
  it("fails closed when disabled", async () => {
    loadCurriculumWorkspace.mockRejectedValueOnce(new Error("disabled"));
    render(await CurriculumPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", {
        name: "Curriculum coverage is not available",
      }),
    ).toBeInTheDocument();
  });
});
