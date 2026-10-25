import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WorkspaceCard, WorkspaceHeader } from "./workspace-presentation";
import { FinanceWorkspaceNav } from "./finance-workspace-nav";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
afterEach(cleanup);
const recorder: AuthorizationSnapshot = {
  organizationId: "organization",
  schoolId: "school",
  permissions: [
    "finance.view",
    "finance.billing.view",
    "finance.payments.view",
    "finance.payments.record",
  ],
  modules: [{ key: "finance", entitled: true, enabled: true }],
  features: ["billing", "collections", "reporting", "expenses"].map((key) => ({
    key: `finance.${key}`,
    module: "finance",
    enabled: true,
  })),
};
describe("premium operational workspace presentation", () => {
  it("retains contextual titles, actions and metric drill-downs", () => {
    render(
      <>
        <WorkspaceHeader
          eyebrow="Academic operations"
          title="Selected school"
          description="Authorized reporting period"
        >
          <a href="/workspaces">My workspaces</a>
        </WorkspaceHeader>
        <WorkspaceCard
          title="Awaiting review"
          value="12"
          description="Submitted batches in the selected academic scope."
          href="/assessments?status=submitted"
        />
      </>,
    );
    expect(
      screen
        .getByRole("link", { name: "Open workspace" })
        .getAttribute("style"),
    ).toContain("--shell-ink");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Selected school",
    );
    expect(
      screen.getByRole("link", { name: "Open workspace" }),
    ).toHaveAttribute("href", "/assessments?status=submitted");
    expect(
      screen.getByText("Submitted batches in the selected academic scope."),
    ).toBeInTheDocument();
  });
  it("does not expose expense or reporting navigation to the four-permission recorder", () => {
    render(
      <FinanceWorkspaceNav
        authorization={recorder}
        currentPath="/finance/overview"
      />,
    );
    expect(
      screen.getByRole("link", { name: "Collections" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Student bills" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Expenses" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Reports" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
  it("keeps theme colors token-based in both current and inactive Finance links", () => {
    render(
      <FinanceWorkspaceNav
        authorization={recorder}
        currentPath="/finance/overview"
      />,
    );
    expect(
      screen.getByRole("link", { name: "Overview" }).getAttribute("style"),
    ).toContain("--shell-primary-ink");
    expect(
      screen.getByRole("link", { name: "Collections" }).getAttribute("style"),
    ).toContain("--shell-ink");
  });
  it("hides navigation when the module entitlement is unavailable", () => {
    render(
      <FinanceWorkspaceNav
        authorization={{ ...recorder, modules: [] }}
        currentPath="/finance/overview"
      />,
    );
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
