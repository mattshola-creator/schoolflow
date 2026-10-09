import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OperationsPrototype } from "./operations-prototype";

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
    expect(screen.getAllByRole("option")).toHaveLength(11);
    fireEvent.change(perspective, {
      target: { value: "Teacher / Class Teacher" },
    });
    fireEvent.click(screen.getByRole("button", { name: "My Day" }));
    expect(screen.getByText("Primary 5 English")).toBeInTheDocument();
    expect(
      screen.getByText(/Multiple responsibilities are combined/i),
    ).toBeInTheDocument();
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
