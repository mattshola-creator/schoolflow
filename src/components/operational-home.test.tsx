import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OperationalSummary, PriorityWork } from "./operational-home";

describe("operational Home presentation", () => {
  afterEach(() => cleanup());

  it("labels summaries with the authorized scope", () => {
    render(
      <OperationalSummary
        counts={{ tasks: 2, approvals: 1, notifications: 3, urgent: 1 }}
        moduleCount={5}
        scopeLabel="Cedarbridge Academy"
      />,
    );
    expect(
      screen.getByLabelText("Operational summary for Cedarbridge Academy"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pending approvals")).toBeInTheDocument();
  });

  it("provides an honest empty state and an accessible My Day link", () => {
    const { rerender } = render(<PriorityWork tasks={[]} limit={6} />);
    expect(screen.getByText("Nothing needs attention")).toBeInTheDocument();
    rerender(
      <PriorityWork
        tasks={[
          {
            id: "task",
            title: "Verify attendance",
            status: "open",
            priority: "urgent",
            dueAt: null,
            kind: "task",
            href: "/action-center",
          },
        ]}
        limit={6}
      />,
    );
    expect(screen.getByRole("link", { name: "View My Day" })).toHaveAttribute(
      "href",
      "/my-day",
    );
    expect(
      screen.getByRole("link", { name: /Verify attendance/ }),
    ).toHaveAttribute("href", "/action-center");
  });
});
