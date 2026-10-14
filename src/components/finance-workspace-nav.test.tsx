import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import { FinanceWorkspaceNav } from "./finance-workspace-nav";

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

const authorization: AuthorizationSnapshot = {
  organizationId: "org-1",
  schoolId: "school-1",
  permissions: [
    "finance.view",
    "finance.payments.view",
    "finance.reports.view",
  ],
  modules: [{ key: "finance", entitled: true, enabled: true }],
  features: [
    { key: "finance.fee_management", module: "finance", enabled: true },
    { key: "finance.collections", module: "finance", enabled: true },
    { key: "finance.expenses", module: "finance", enabled: true },
    { key: "finance.reporting", module: "finance", enabled: true },
  ],
};

describe("FinanceWorkspaceNav", () => {
  it("shows only sections allowed by the current authorization snapshot", () => {
    render(
      <FinanceWorkspaceNav
        authorization={authorization}
        currentPath="/finance/payments"
      />,
    );

    expect(screen.getByRole("link", { name: "Fee setup" })).toHaveAttribute(
      "href",
      "/finance",
    );
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/finance/overview",
    );
    expect(screen.queryByRole("link", { name: "Student bills" })).toBeNull();
    expect(screen.getByRole("link", { name: "Collections" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByRole("link", { name: "Expenses" })).toBeNull();
    expect(screen.getByRole("link", { name: "Reports" })).toBeInTheDocument();
  });

  it("hides every destination when its module is disabled", () => {
    render(
      <FinanceWorkspaceNav
        authorization={{
          ...authorization,
          modules: [{ key: "finance", entitled: true, enabled: false }],
        }}
        currentPath="/finance"
      />,
    );

    expect(
      screen.queryByRole("link", { name: "Fee setup" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Collections" }),
    ).not.toBeInTheDocument();
  });

  it("shows student billing only when its existing permission and feature are enabled", () => {
    render(
      <FinanceWorkspaceNav
        authorization={{
          ...authorization,
          permissions: [...authorization.permissions, "finance.billing.view"],
          features: [
            ...authorization.features,
            { key: "finance.billing", module: "finance", enabled: true },
          ],
        }}
        currentPath="/finance/billing"
      />,
    );

    expect(screen.getByRole("link", { name: "Student bills" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
