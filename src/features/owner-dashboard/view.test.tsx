import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OwnerDashboard } from "./view";
import type { OwnerDashboardDTO } from "./service";
afterEach(cleanup);
const data: OwnerDashboardDTO = {
  schoolName: "A very long authorized school name",
  organizationName: "Selected organization",
  sessionName: "2026/27",
  periodName: "First term",
  summary: {
    activeEnrollments: 180,
    attendance: { presentIncludingLate: 809, recordedMarks: 852 },
    publicationVersions: 1,
  },
  reportingWindow: { from: "2026-09-24", to: "2026-10-24" },
  reportingError: false,
  visibility: {
    enrollment: true,
    attendance: true,
    publications: true,
    finance: false,
    approvals: false,
    notifications: false,
    work: false,
  },
  financeError: false,
  finance: null,
  workError: false,
  work: null,
};
describe("operational Owner executive presentation", () => {
  it("renders authorized values and preserves metric definitions and chart alternatives", () => {
    render(<OwnerDashboard data={data} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      data.schoolName,
    );
    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText(/Not unique learners\./)).toBeInTheDocument();
    expect(screen.getByText(/809 \/ 852 recorded marks/)).toBeInTheDocument();
    expect(
      screen.getByText(/2026-09-24 through 2026-10-24, inclusive/),
    ).toBeInTheDocument();
    expect(screen.getByText("Period & metric definition")).toBeInTheDocument();
    expect(
      screen.getByText("Explore data & accessible table"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Demo data")).not.toBeInTheDocument();
    expect(screen.queryByText("Riverside Academy")).not.toBeInTheDocument();
  });
  it("omits unauthorized Finance and work actions rather than displaying sample metrics", () => {
    render(<OwnerDashboard data={data} />);
    expect(
      screen.queryByRole("link", { name: "Finance overview" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Review my work" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "School Finance" }),
    ).not.toBeInTheDocument();
  });
  it("preserves unavailable states without inventing zero summaries", () => {
    render(
      <OwnerDashboard data={{ ...data, summary: {}, reportingError: true }} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No zero values are inferred",
    );
    expect(
      screen.queryByRole("heading", { name: "Active enrollments" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Explore data & accessible table"),
    ).not.toBeInTheDocument();
  });
  it("keeps the explicit legacy fallback", () => {
    render(<OwnerDashboard data={data} />);
    expect(
      screen.getByRole("link", { name: "Use legacy dashboard" }),
    ).toHaveAttribute("href", "/dashboard?appearance=legacy");
  });
});
