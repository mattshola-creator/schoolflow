import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ButtonLink, buttonClassName } from "./button";
import { DetailItem, DetailList } from "./detail-list";
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

  it("keeps detail data semantic and mobile-first", () => {
    const { container } = render(
      <DetailList>
        <DetailItem label="Student number">M7-QA-STUDENT-001</DetailItem>
      </DetailList>,
    );

    expect(container.querySelector("dl")).toHaveClass("grid-cols-1");
    expect(container.querySelector("dl")).toHaveClass("sm:grid-cols-2");
    expect(screen.getByText("Student number").tagName).toBe("DT");
    expect(screen.getByText("M7-QA-STUDENT-001").tagName).toBe("DD");
  });
});
