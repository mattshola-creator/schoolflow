import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkipLink } from "./skip-link";
import { StatusNotice } from "./status-notice";

describe("accessibility primitives", () => {
  it("provides a keyboard skip link to the shared content target", () => {
    render(<SkipLink />);

    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#main-content");
  });

  it("announces success without interrupting and errors immediately", () => {
    const { rerender } = render(
      <StatusNotice tone="success">Saved</StatusNotice>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Saved");

    rerender(<StatusNotice tone="error">Could not save</StatusNotice>);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
  });
});
