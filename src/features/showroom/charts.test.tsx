import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  chartMaximum,
  combinedAttendance,
  formatChartValue,
  rate,
} from "./chart-model";
import {
  ComparisonBars,
  ProgressCard,
  SchoolComparison,
  StageChart,
  TrendChart,
} from "./charts";
import { receiptMethods, receiptsTrend } from "./demo-data";

const common = {
  title: "Attendance example",
  description: "Present plus late / recorded marks",
  period: "Fictional window",
};
afterEach(cleanup);

describe("visualization meaning and accessibility", () => {
  it("distinguishes missing denominators from zero and rejects impossible rates", () => {
    expect(rate(0, 0)).toBeNull();
    expect(rate(0, 20)).toBe(0);
    expect(rate(19, 20)).toBe(95);
    expect(rate(21, 20)).toBeNull();
    expect(rate(-1, 20)).toBeNull();
    expect(rate(Infinity, 20)).toBeNull();
  });
  it("keeps zero baselines and exact currency units", () => {
    expect(chartMaximum([91, 93], "percent")).toBe(100);
    expect(chartMaximum([0], "count")).toBe(1);
    expect(formatChartValue(4250000, "NGN")).toContain("42,500.00");
    expect(receiptMethods.reduce((sum, point) => sum + point.value, 0)).toBe(
      482000000,
    );
    expect(receiptsTrend.reduce((sum, point) => sum + point.value, 0)).toBe(
      482000000,
    );
  });
  it("combines rates by their denominators rather than averaging percentages", () => {
    expect(
      combinedAttendance([
        {
          schoolId: "a",
          schoolName: "A",
          presentIncludingLate: 1,
          recordedMarks: 2,
        },
        {
          schoolId: "b",
          schoolName: "B",
          presentIncludingLate: 99,
          recordedMarks: 100,
        },
      ]),
    ).toBeCloseTo(10000 / 102);
    expect(combinedAttendance([])).toBeNull();
  });
  it("offers point values to keyboard users and a complete data table", () => {
    render(
      <TrendChart
        {...common}
        points={[{ label: "Week 1", value: 95, detail: "19 / 20 marks" }]}
      />,
    );
    const point = screen.getByRole("button", { name: /Week 1: 95.0%/ });
    fireEvent.focus(point);
    expect(screen.getByRole("tooltip")).toHaveTextContent("19 / 20 marks");
    fireEvent.keyDown(point, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Explore data & accessible table"));
    expect(screen.getByRole("table")).toHaveTextContent("19 / 20 marks");
  });
  it("shows errors and empty states without fabricating zero charts", () => {
    const { rerender } = render(
      <TrendChart {...common} points={[]} state="empty" />,
    );
    expect(
      screen.getByText("No records for this selection."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    rerender(
      <TrendChart {...common} points={[{ label: "Bad", value: NaN }]} />,
    );
    expect(
      screen.getByText("Data could not be displayed."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Bad:/ }),
    ).not.toBeInTheDocument();
  });
  it("does not render a completed progress ring with no denominator", () => {
    render(<ProgressCard {...common} numerator={0} denominator={0} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "No denominator; rate unavailable.",
    );
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
  it("keeps exact bar totals in a table when a legend series is hidden", () => {
    render(
      <ComparisonBars
        {...common}
        points={[{ label: "Primary", first: 30, second: 20 }]}
        labels={["Arm A", "Arm B"]}
      />,
    );
    const legend = screen.getByRole("button", { name: "Arm B" });
    fireEvent.click(legend);
    expect(legend).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByText("Explore data & accessible table"));
    expect(screen.getByRole("table")).toHaveTextContent("50");
  });
  it("provides a truthful status definition after selecting a stage", () => {
    render(
      <StageChart
        {...common}
        points={[
          {
            label: "Accepted",
            value: 19,
            detail: "Current statuses, not a conversion rate.",
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Accepted/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "not a conversion rate",
    );
  });
  it("renders only supplied school DTOs and represents missing marks explicitly", () => {
    render(
      <SchoolComparison
        {...common}
        schools={[
          {
            schoolId: "permitted",
            schoolName: "Permitted demo school",
            presentIncludingLate: 0,
            recordedMarks: 0,
          },
        ]}
      />,
    );
    expect(screen.getAllByText("Permitted demo school").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.queryByText("Foreign school")).not.toBeInTheDocument();
  });
});
