import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";
describe("public product homepage", () => {
  it("presents the PX2 value proposition and prototype boundary", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /one calm operating system for your whole school group/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Synthetic preview")).toBeInTheDocument();
    expect(screen.getByText(/no pricing commitment/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /take the guided tour/i }),
    ).toHaveAttribute("href", "/demo");
  });
});
