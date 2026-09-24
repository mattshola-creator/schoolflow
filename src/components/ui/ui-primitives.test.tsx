import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ButtonLink, buttonClassName } from "./button";
import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";

describe("UI primitives", () => {
  it("uses accessible button defaults and stable variants", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button",
    );
    expect(buttonClassName({ variant: "secondary" })).toContain("bg-surface");
  });

  it("renders navigation actions as links", () => {
    render(<ButtonLink href="/admissions/new">New application</ButtonLink>);

    expect(
      screen.getByRole("link", { name: "New application" }),
    ).toHaveAttribute("href", "/admissions/new");
  });

  it("provides a consistent page heading and optional actions", () => {
    render(
      <PageHeader
        eyebrow="Admissions"
        title="Applicants"
        description="Manage applications."
        actions={<Button>Filter</Button>}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Applicants" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Manage applications.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
  });

  it("renders status text without relying on color alone", () => {
    render(<StatusBadge tone="success">Enrolled</StatusBadge>);

    expect(screen.getByText("Enrolled")).toHaveClass("text-brand-strong");
  });
});
