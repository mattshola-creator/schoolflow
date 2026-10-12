import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError } from "@/lib/authorization";
import { FinanceUnavailableState } from "./finance-unavailable-state";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe("FinanceUnavailableState", () => {
  it("explains permission denial without exposing or broadening access", () => {
    render(
      <FinanceUnavailableState
        area="Collections"
        error={new AuthorizationError("permission_denied")}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Finance access is not available for this role",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to school overview" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("distinguishes disabled features from technical load errors", () => {
    const { rerender } = render(
      <FinanceUnavailableState
        area="Fee setup"
        error={new AuthorizationError("feature_disabled")}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "This Finance workspace is not enabled",
        level: 1,
      }),
    ).toBeInTheDocument();

    rerender(<FinanceUnavailableState area="Reports" error={new Error()} />);
    expect(
      screen.getByRole("heading", {
        name: "Reports could not be loaded",
        level: 1,
      }),
    ).toBeInTheDocument();
  });
});
