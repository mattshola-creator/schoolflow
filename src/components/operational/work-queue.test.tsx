import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WorkQueue } from "./work-queue";

afterEach(cleanup);
describe("authorized operational queue presentation", () => {
  it("retains filtered destinations and distinguishes a real zero from an unavailable count", () => {
    render(
      <WorkQueue
        title="Your work"
        description="Current school"
        items={[
          {
            key: "payment",
            title: "Recorded payments",
            href: "/finance/payments?status=recorded#payment-register",
            count: 0,
          },
          {
            key: "sheet",
            title: "Submitted sheet",
            href: "/assessments/example",
            status: "Submitted · read-only",
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("link", { name: /Recorded payments/ }),
    ).toHaveAttribute(
      "href",
      "/finance/payments?status=recorded#payment-register",
    );
    expect(screen.getAllByText("Records:")).toHaveLength(1);
    expect(screen.getByText("Submitted · read-only")).toBeInTheDocument();
  });
  it("does not invent actions or sample data for an empty authorized result", () => {
    render(
      <WorkQueue title="Your work" description="Current school" items={[]} />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.getByText("No pending work returned for this scope."),
    ).toBeInTheDocument();
  });
});
