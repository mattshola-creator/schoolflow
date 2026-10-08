import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ContextRibbon } from "./context-ribbon";

const active = {
  organizationId: "org",
  organizationName: "Cedarbridge Group",
  schoolId: "school",
  schoolName: "Cedarbridge Primary",
};

describe("ContextRibbon", () => {
  afterEach(() => cleanup());
  it("shows server-provided organization, school, session and period", () => {
    render(
      <ContextRibbon
        active={active}
        options={[active]}
        academic={{
          sessionId: "session",
          sessionName: "2026/2027",
          periodId: "period",
          periodName: "First Term",
          available: true,
        }}
      />,
    );
    expect(
      screen.getByLabelText("Current SchoolFlow context"),
    ).toHaveTextContent("Cedarbridge Group");
    expect(
      screen.getByLabelText("Current SchoolFlow context"),
    ).toHaveTextContent("Cedarbridge Primary");
    expect(screen.getAllByText(/2026\/2027/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/First Term/).length).toBeGreaterThan(0);
  });

  it("uses explicit fallback language without inventing academic values", () => {
    render(
      <ContextRibbon
        active={active}
        options={[active]}
        academic={{
          sessionId: null,
          sessionName: null,
          periodId: null,
          periodName: null,
          available: false,
        }}
      />,
    );
    expect(
      screen.getAllByText(/Session not configured/).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Term not configured/).length).toBeGreaterThan(
      0,
    );
  });

  it("offers a compact mobile summary with complete long-name disclosure", () => {
    const longContext = {
      ...active,
      organizationName:
        "Cedarbridge International Learning and Development Organization",
      schoolName:
        "Cedarbridge Nursery Primary and Secondary Demonstration School",
    };
    render(
      <ContextRibbon
        active={longContext}
        options={[longContext]}
        academic={{
          sessionId: "session",
          sessionName: "2026/2027 Academic Session",
          periodId: "period",
          periodName: "First Term",
          available: true,
        }}
      />,
    );

    const disclosure = screen.getByText("Show complete SchoolFlow context");
    expect(disclosure.closest("summary")).toHaveClass("min-h-11");
    expect(
      screen.getAllByText(longContext.organizationName).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(longContext.schoolName).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText("2026/2027 Academic Session").length,
    ).toBeGreaterThan(0);
  });
});
