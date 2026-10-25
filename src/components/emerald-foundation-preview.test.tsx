import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EmeraldFoundationPreview } from "./emerald-foundation-preview";
afterEach(cleanup);

describe("contained Emerald foundation", () => {
  it("clearly labels synthetic data and starts with Premium Emerald", () => {
    render(<EmeraldFoundationPreview />);
    expect(screen.getByLabelText("Preview theme")).toHaveValue(
      "premium-emerald",
    );
    expect(screen.getByText(/not live school records/)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /publish|save draft/i }),
    ).toBeNull();
  });
  it("switches the curated dark theme within the sample only", () => {
    const { container } = render(<EmeraldFoundationPreview />);
    fireEvent.change(screen.getByLabelText("Preview theme"), {
      target: { value: "midnight-emerald" },
    });
    expect(container.querySelector("[data-theme]")).toHaveAttribute(
      "data-theme",
      "midnight-emerald",
    );
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(window.localStorage.getItem("sf-theme")).toBeNull();
  });
  it("offers mobile inspection and makes sample actions explicit", () => {
    const { container } = render(<EmeraldFoundationPreview />);
    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    expect(container.querySelector(".sf-design")).toHaveClass(
      "sf-design-mobile",
    );
    fireEvent.click(screen.getByRole("button", { name: "Compare schools" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Sample comparison only",
    );
  });
});
