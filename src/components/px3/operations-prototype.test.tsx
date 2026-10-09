import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { OperationsPrototype } from "./operations-prototype";
import {
  formatMoney,
  getScopedRolePresentation,
  getScopeFixture,
  percentage,
  perspectiveOptions,
  scopeOptions,
} from "./operations-fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/px3-operations",
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});

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
    fireEvent.click(screen.getByRole("tab", { name: "My Day" }));
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
    expect(formatMoney(primary.collectedCents)).toBe("₦14,880,000.00");
    expect(formatMoney(academy.collectedCents)).toBe("₦9,800,450.00");
    expect(formatMoney(all.collectedCents)).toBe("₦24,680,450.00");
    for (const key of [
      "attendanceFollowUps",
      "billedCents",
      "verificationCents",
      "verificationCount",
      "pendingApprovals",
      "overdueRegisters",
      "lessonPlansApproved",
      "lessonPlansTotal",
      "scoreSheets",
      "submittedSheets",
      "assessmentBlockers",
      "publishedSnapshots",
    ] as const) {
      expect(all[key]).toBe(primary[key] + academy[key]);
    }
  });

  it("defines meaningful scoped language for all 21 perspective and scope combinations", () => {
    const presentations = new Set<string>();
    for (const scope of scopeOptions) {
      for (const perspective of perspectiveOptions) {
        const presentation = getScopedRolePresentation(
          scope.id,
          perspective.id,
        );
        expect(presentation.tasks).toHaveLength(3);
        expect(presentation.description).toMatch(
          scope.id === "all"
            ? /authorized schools|Cross-school/
            : new RegExp(scope.label),
        );
        presentations.add(
          `${scope.id}:${perspective.id}:${presentation.title}:${presentation.tasks[0]}`,
        );
      }
    }
    expect(presentations.size).toBe(21);
  });

  it("uses organization and individual-school owner headings and exceptions", () => {
    render(<OperationsPrototype />);
    expect(
      screen.getByRole("heading", { name: "Your school group today" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Compare authorized school performance"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Operating scope"), {
      target: { value: "primary" },
    });
    expect(
      screen.getByRole("heading", {
        name: "Cedarbridge Primary School overview",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Review Cedarbridge Primary operating health"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Compare authorized school performance"),
    ).not.toBeInTheDocument();
  });

  it("keeps scope context and workspace content coherent", () => {
    render(<OperationsPrototype />);
    const scope = screen.getByLabelText("Operating scope");
    fireEvent.change(scope, { target: { value: "academy" } });
    expect(screen.getAllByText("Cedarbridge Academy").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("600")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Students" }));
    expect(screen.getAllByText("Musa Ibrahim").length).toBeGreaterThan(0);
    expect(screen.queryByText("Amara Okafor")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Finance" }));
    expect(screen.getByText("₦12,880,000.00")).toBeInTheDocument();
    expect(
      screen.getByText(/production context unchanged/i),
    ).toBeInTheDocument();
  });

  it("covers every workspace at every authorized operating scope", () => {
    render(<OperationsPrototype />);
    const scopeControl = screen.getByLabelText("Operating scope");
    const scenarios = [
      {
        scope: "all",
        home: "Your school group today",
        memberCount: "126",
        student: "Amara Okafor",
        applicant: "Amina Bello",
        teaching: "09:30 · Primary 5 English",
        billed: "₦31,480,000.00",
        assessment: "Primary 5 A · English",
      },
      {
        scope: "primary",
        home: "Cedarbridge Primary School overview",
        memberCount: "68",
        student: "Amara Okafor",
        applicant: "Amina Bello",
        teaching: "09:30 · Primary 5 English",
        billed: "₦18,600,000.00",
        assessment: "Primary 5 A · English",
      },
      {
        scope: "academy",
        home: "Cedarbridge Academy overview",
        memberCount: "58",
        student: "Musa Ibrahim",
        applicant: "Daniel Mensah",
        teaching: "09:30 · JSS 2 Literature",
        billed: "₦12,880,000.00",
        assessment: "JSS 2 Gold · Literature",
      },
    ];

    for (const scenario of scenarios) {
      fireEvent.change(scopeControl, { target: { value: scenario.scope } });
      fireEvent.click(screen.getByRole("tab", { name: "Home" }));
      expect(
        screen.getByRole("heading", { name: scenario.home }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("tab", { name: "My Day" }));
      expect(
        screen.getByRole("heading", { name: "My Day" }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("tab", { name: "Administration" }));
      expect(screen.getAllByText(scenario.memberCount).length).toBeGreaterThan(
        0,
      );
      fireEvent.click(screen.getByRole("tab", { name: "Students" }));
      expect(screen.getAllByText(scenario.student).length).toBeGreaterThan(0);
      fireEvent.click(screen.getByRole("tab", { name: "Admissions" }));
      expect(
        screen.getByText(new RegExp(scenario.applicant)),
      ).toBeInTheDocument();
      fireEvent.click(
        screen.getByRole("tab", { name: "Teaching & attendance" }),
      );
      expect(screen.getByText(scenario.teaching)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("tab", { name: "Finance" }));
      expect(screen.getByText(scenario.billed)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("tab", { name: "Assessment" }));
      expect(screen.getByText(scenario.assessment)).toBeInTheDocument();
    }
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
      expect(screen.getAllByRole("tab", { name })).toHaveLength(1);
    }
    expect(
      screen.getByText("Swipe to explore all workspaces"),
    ).toBeInTheDocument();
    const active = screen.getByRole("tab", { name: "Home" });
    expect(active).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(active, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "My Day" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("uses mobile cards and disables authoritative prototype mutations", () => {
    render(<OperationsPrototype />);
    fireEvent.click(screen.getByRole("tab", { name: "Finance" }));
    expect(screen.getByText("₦31,480,000.00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verify selected payment" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("tab", { name: "Assessment" }));
    expect(
      screen.getByRole("button", { name: "Submit score sheet" }),
    ).toBeDisabled();
  });

  it("preserves exact admissions workflow stages", () => {
    render(<OperationsPrototype />);
    fireEvent.click(screen.getByRole("tab", { name: "Admissions" }));
    expect(screen.getByLabelText("Workflow progress")).toHaveTextContent(
      "Offer accepted",
    );
    expect(screen.getByText("Conversion readiness")).toBeInTheDocument();
  });
});
