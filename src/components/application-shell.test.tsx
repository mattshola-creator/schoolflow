import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationShell } from "./application-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ApplicationShell", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => cleanup());
  it("does not link utilities whose authorized routes are absent", () => {
    render(
      <ApplicationShell
        items={[]}
        unavailableItems={[]}
        contextRibbon={<div>Context</div>}
      >
        <p>Content</p>
      </ApplicationShell>,
    );
    expect(
      screen.getByRole("button", { name: "Global search unavailable" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Notifications unavailable" }),
    ).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Global search" })).toBeNull();
  });

  it("exposes authorized utility destinations and persists sidebar preference", () => {
    render(
      <ApplicationShell
        items={[]}
        unavailableItems={[]}
        searchHref="/management#workspace-search"
        notificationHref="/action-center"
        contextRibbon={<div>Context</div>}
      >
        <p>Content</p>
      </ApplicationShell>,
    );
    expect(screen.getByRole("link", { name: "Global search" })).toHaveAttribute(
      "href",
      "/management#workspace-search",
    );
    expect(
      screen.getByRole("link", { name: "Notifications and actions" }),
    ).toHaveAttribute("href", "/action-center");
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(window.localStorage.getItem("sf-shell-collapsed")).toBe("true");
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();
  });

  it("gives utility and account controls explicit accessible identities", () => {
    render(
      <ApplicationShell
        items={[]}
        unavailableItems={[]}
        searchHref="/management#workspace-search"
        notificationHref="/action-center"
        userEmail="long.account.identity@schoolflow.example"
        contextRibbon={<div>Context</div>}
      >
        <p>Content</p>
      </ApplicationShell>,
    );

    expect(screen.getByRole("link", { name: "Global search" })).toHaveClass(
      "size-11",
    );
    expect(
      screen.getByRole("link", { name: "Notifications and actions" }),
    ).toHaveClass("size-11");
    expect(
      screen.getByLabelText(
        "Open account menu for long.account.identity@schoolflow.example",
      ),
    ).toHaveClass("size-11");
    expect(
      screen.getByText("long.account.identity@schoolflow.example"),
    ).toHaveClass("break-all");
  });
});
