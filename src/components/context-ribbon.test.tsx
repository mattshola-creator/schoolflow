import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContextRibbon } from "./context-ribbon";

const active = {
  organizationId: "org",
  organizationName: "Cedarbridge Group",
  schoolId: "school",
  schoolName: "Cedarbridge Primary",
};

describe("ContextRibbon", () => {
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
});
