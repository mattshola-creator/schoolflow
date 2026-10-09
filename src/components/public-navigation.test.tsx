import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DesktopPublicNavigation,
  MobilePublicNavigation,
  publicNavigation,
} from "./public-navigation";

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

describe("public navigation", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/product");
    document.body.style.overflow = "";
  });

  afterEach(cleanup);

  it("marks the active desktop destination", () => {
    render(<DesktopPublicNavigation />);
    expect(screen.getByRole("link", { name: "Product" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("navigation", { name: "Public navigation" }),
    ).toBeVisible();
  });

  it.each([320, 375, 390, 430])(
    "keeps one independently scrolling navigation tree at %ipx",
    (width) => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: width,
      });
      render(<MobilePublicNavigation />);
      fireEvent.click(
        screen.getByRole("button", { name: "Open public navigation" }),
      );

      expect(screen.getByRole("dialog")).toHaveClass(
        "h-dvh",
        "overflow-hidden",
      );
      expect(screen.getByTestId("public-navigation-scroll")).toHaveClass(
        "overflow-y-auto",
        "overscroll-contain",
      );
      for (const [label] of publicNavigation) {
        expect(screen.getAllByRole("link", { name: label })).toHaveLength(1);
      }
      expect(document.body.style.overflow).toBe("hidden");
    },
  );

  it("supports focus containment, Escape dismissal, and focus restoration", () => {
    render(<MobilePublicNavigation />);
    const trigger = screen.getByRole("button", {
      name: "Open public navigation",
    });
    fireEvent.click(trigger);
    const close = screen.getByRole("button", {
      name: "Close public navigation",
    });
    const last = screen.getByRole("link", { name: "Explore onboarding" });
    expect(close).toHaveFocus();

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("dismisses from the backdrop and closes after navigation", () => {
    render(<MobilePublicNavigation />);
    let trigger = screen.getByRole("button", {
      name: "Open public navigation",
    });
    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss public navigation" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    trigger = screen.getByRole("button", { name: "Open public navigation" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("link", { name: "Product" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
