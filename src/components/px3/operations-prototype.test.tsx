import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OperationsPrototype } from "./operations-prototype";
import {
  getScopeFixture,
  percentage,
  perspectiveOptions,
} from "./operations-fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/px3-operations",
}));

afterEach(cleanup);

describe("PX3 school operations prototype", () => {
  it("labels the experience synthetic and keeps the inaccessible school disabled", () => {
    render(<OperationsPrototype />);
    expect(
      screen.getByText(/Synthetic operations prototype/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /Northgate School/ }),
    ).toBeDisabled();
  });

  it("supports all seven responsibilities and combines role work in My Day", () => {
    render(<OperationsPrototype />);
    const perspective = screen.getByLabelText("Perspective");
    expect(screen.getAllByRole("option").length).toBeGreaterThanOrEqual(11);
    fireEvent.change(perspective, {
      target: { value: "teacher" },
    });
    fireEvent.click(screen.getByRole("button", { name: "My Day" }));
    expect(screen.getByText("Primary 5 English")).toBeInTheDocument();
    expect(
      screen.getByText(/Multiple responsibilities are combined/i),
    ).toBeInTheDocument();
  });

  it("renders materially distinct home priorities for every perspective", () => {
    render(<OperationsPrototype />);
    const perspective = screen.getByLabelText("Perspective");
    const expected = [
      ["owner", "Cross-school performance"],
      ["principal", "Attendance, teaching readiness"],
      ["teacher", "Today’s teaching, attendance"],
      ["admissions", "Applications, document checks"],
      ["bursar", "Billing, collections"],
      ["assessment", "Score-sheet progress"],
      ["registrar", "Enrollment, guardian relationships"],
    ];
    for (const [id, description] of expected) {
      fireEvent.change(perspective, { target: { value: id } });
      expect(screen.getByText(new RegExp(description))).toBeInTheDocument();
    }
    expect(perspectiveOptions).toHaveLength(7);
  });

  it("reconciles additive totals and uses weighted rates", () => {
    const primary = getScopeFixture("primary");
    const academy = getScopeFixture("academy");
    const all = getScopeFixture("all");
    expect(all.learners).toBe(primary.learners + academy.learners);
    expect(all.present).toBe(primary.present + academy.present);
    expect(all.collectedCents).toBe(
      primary.collectedCents + academy.collectedCents,
    );
    expect(percentage(all.present, all.learners)).toBe("94.2%");
  });

  it("keeps scope context and workspace content coherent", () => {
    render(<OperationsPrototype />);
    const scope = screen.getByLabelText("Operating scope");
    fireEvent.change(scope, { target: { value: "academy" } });
    expect(screen.getAllByText("Cedarbridge Academy").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("600")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Students" }));
    expect(screen.getAllByText("Musa Ibrahim").length).toBeGreaterThan(0);
    expect(screen.queryByText("Amara Okafor")).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Finance" })[0]);
    expect(screen.getByText("₦12,880,000.00")).toBeInTheDocument();
    expect(
      screen.getByText(/production context unchanged/i),
    ).toBeInTheDocument();
  });

  it("renders each workspace switcher exactly once", () => {
    render(<OperationsPrototype />);
    for (const name of [
      "Home",
      "My Day",
      "Administration",
      "Students",
      "Admissions",
      "Teaching & attendance",
      "Finance",
      "Assessment",
    ]) {
      expect(screen.getAllByRole("button", { name })).toHaveLength(1);
    }
  });

  it("uses mobile cards and disables authoritative prototype mutations", () => {
    render(<OperationsPrototype />);
    fireEvent.click(screen.getByRole("button", { name: "Finance" }));
    expect(screen.getByText("₦31,480,000.00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verify selected payment" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Assessment" }));
    expect(
      screen.getByRole("button", { name: "Submit score sheet" }),
    ).toBeDisabled();
  });

  it("preserves exact admissions workflow stages", () => {
    render(<OperationsPrototype />);
    fireEvent.click(screen.getByRole("button", { name: "Admissions" }));
    expect(screen.getByLabelText("Workflow progress")).toHaveTextContent(
      "Offer accepted",
    );
    expect(screen.getByText("Conversion readiness")).toBeInTheDocument();
  });
});
