import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";
describe("foundation page", () => {
  it("reports real bootstrap state", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /run every school with clarity and control/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/operational school modules are introduced/i),
    ).toBeInTheDocument();
  });
});
