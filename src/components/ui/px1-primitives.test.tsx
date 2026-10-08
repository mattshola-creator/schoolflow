import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField, TextInput } from "./form-field";
import { LoadingSkeleton } from "./loading-skeleton";
import { StatePanel } from "./state-panel";
import { SurfaceCard } from "./surface-card";
import { Tab, Tabs } from "./tabs";

describe("PX1 design system primitives", () => {
  it("connects labels, descriptions and validation errors", () => {
    render(
      <FormField
        htmlFor="name"
        label="Name"
        description="Use the legal name"
        error="Name is required"
      >
        <TextInput id="name" />
      </FormField>,
    );
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
  });

  it("distinguishes permission and entitlement states in text", () => {
    render(
      <>
        <StatePanel
          kind="unauthorized"
          title="Permission required"
          description="Your role does not grant access."
        />
        <StatePanel
          kind="unentitled"
          title="Not in plan"
          description="This subscription does not include the module."
        />
      </>,
    );
    expect(screen.getByText("Permission required")).toBeInTheDocument();
    expect(screen.getByText("Not in plan")).toBeInTheDocument();
  });

  it("provides semantic cards, tabs and loading status", () => {
    render(
      <SurfaceCard title="Summary">
        <Tabs label="Profile sections">
          <Tab selected>Overview</Tab>
        </Tabs>
        <LoadingSkeleton />
      </SurfaceCard>,
    );
    expect(
      screen.getByRole("heading", { name: "Summary" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("status", { name: "Loading content" }),
    ).toBeInTheDocument();
  });
});
