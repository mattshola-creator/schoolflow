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
  { href: "/admissions", label: "Admissions", group: "Operations" },
  { href: "/students", label: "Students", group: "Operations" },
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
    expect(screen.getByRole("dialog")).toHaveClass(
      "h-dvh",
      "max-h-dvh",
      "overflow-hidden",
    );
    expect(screen.getByText("qa@example.test")).toBeInTheDocument();
    expect(screen.getByText("qa@example.test")).toHaveClass("break-words");
    expect(screen.getByText("qa@example.test")).not.toHaveClass("break-all");
    expect(screen.getByText("Signed in account")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-navigation-header")).toHaveClass(
      "shrink-0",
    );
    expect(screen.getByTestId("mobile-navigation-scroll")).toHaveClass(
      "min-h-0",
      "overflow-y-auto",
      "overscroll-contain",
    );
    expect(screen.getByRole("link", { name: "Admissions" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Students" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");
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
    expect(document.documentElement.style.overscrollBehavior).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("dismisses from the backdrop and restores the navigation trigger", () => {
    render(<WorkspaceNavigation variant="mobile" items={items} />);

    const trigger = screen.getByRole("button", {
      name: "Open workspace navigation",
    });
    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss workspace navigation" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it.each([320, 375, 390])(
    "keeps a long account identity bounded at %ipx",
    (width) => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: width,
      });
      render(
        <WorkspaceNavigation
          variant="mobile"
          items={items}
          userEmail="long.school.owner.identity@multi-campus-example.school"
        />,
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Open workspace navigation" }),
      );

      const identity = screen.getByText(
        "long.school.owner.identity@multi-campus-example.school",
      );
      expect(screen.getByTestId("mobile-navigation-panel")).toHaveClass(
        "w-[min(21rem,calc(100vw-1rem))]",
        "overflow-hidden",
      );
      expect(identity).toHaveClass("min-w-0", "break-words");
      expect(identity).not.toHaveClass("break-all");
    },
  );

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

  it("explains feature-gated modules without turning them into links", () => {
    render(
      <WorkspaceNavigation
        variant="desktop"
        items={items}
        unavailableItems={[
          { label: "Finance", reason: "Not activated for this organization" },
        ]}
      />,
    );

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(
      screen.getByText("Not activated for this organization"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Finance" })).toBeNull();
  });
});
