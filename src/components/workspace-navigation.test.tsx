import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WorkspaceNavigation } from "./workspace-navigation";

const usePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const items = [
  { href: "/admissions", label: "Admissions" },
  { href: "/students", label: "Students" },
];

describe("WorkspaceNavigation", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/admissions/example");
    document.body.style.overflow = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("opens an accessible mobile menu with the current authorized route", () => {
    render(
      <WorkspaceNavigation
        variant="mobile"
        items={items}
        userEmail="qa@example.test"
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Open workspace navigation",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("qa@example.test")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admissions" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Students" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes with Escape, restores scrolling, and returns focus", () => {
    render(<WorkspaceNavigation variant="mobile" items={items} />);

    const trigger = screen.getByRole("button", {
      name: "Open workspace navigation",
    });
    fireEvent.click(trigger);
    expect(
      screen.getByRole("button", { name: "Close workspace navigation" }),
    ).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("keeps keyboard focus inside the open mobile dialog", () => {
    render(<WorkspaceNavigation variant="mobile" items={items} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open workspace navigation" }),
    );
    const closeButton = screen.getByRole("button", {
      name: "Close workspace navigation",
    });
    const lastLink = screen.getByRole("link", { name: "Students" });

    lastLink.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(lastLink).toHaveFocus();
  });

  it("closes after navigation without rendering unprovided modules", () => {
    render(<WorkspaceNavigation variant="mobile" items={items.slice(0, 1)} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open workspace navigation" }),
    );
    fireEvent.click(screen.getByRole("link", { name: "Admissions" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Students" }),
    ).not.toBeInTheDocument();
  });

  it("renders the desktop navigation with a single current page", () => {
    render(<WorkspaceNavigation variant="desktop" items={items} />);

    expect(
      screen.getByRole("navigation", { name: "Workspace" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Admissions" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
