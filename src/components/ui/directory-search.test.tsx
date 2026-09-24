import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DirectorySearch } from "./directory-search";

describe("DirectorySearch", () => {
  it("renders a labelled, mobile-first search form", () => {
    render(
      <DirectorySearch
        defaultValue="QA-001"
        id="student-search"
        label="Search by student number"
        placeholder="Search student number"
      />,
    );

    expect(screen.getByRole("search")).toHaveClass("grid");
    expect(screen.getByRole("search")).toHaveClass(
      "sm:grid-cols-[minmax(0,1fr)_auto]",
    );
    expect(
      screen.getByRole("textbox", { name: "Search by student number" }),
    ).toHaveValue("QA-001");
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});
