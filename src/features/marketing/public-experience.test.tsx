import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OnboardingPrototype } from "@/components/onboarding-prototype";
import {
  demoPersonas,
  prototypePlans,
  publicModules,
} from "@/features/marketing/catalog";

describe("PX2 public SaaS hub", () => {
  it("publishes the approved public navigation without privileged routes", () => {
    const shell = readFileSync("src/components/marketing-shell.tsx", "utf8");

    for (const route of [
      "/product",
      "/solutions",
      "/modules",
      "/plans",
      "/demo",
      "/security",
    ]) {
      expect(shell).toContain(`"${route}"`);
    }

    expect(shell).not.toContain("/admin/platform");
    expect(shell).not.toContain("service_role");
  });

  it("keeps commercial packaging explicitly non-binding", () => {
    expect(prototypePlans).toHaveLength(3);
    expect(prototypePlans.every((plan) => plan.note.length > 0)).toBe(true);

    const plans = readFileSync("src/app/plans/page.tsx", "utf8");
    expect(plans).toContain("Pricing to be decided");
    expect(plans).toContain("no binding price");
    expect(plans).not.toMatch(/[₦$£€]\s?\d/);
  });

  it("labels all demonstration boundaries and uses only synthetic framing", () => {
    const home = readFileSync("src/app/page.tsx", "utf8");
    const demo = readFileSync("src/app/demo/page.tsx", "utf8");

    expect(home).toContain("Synthetic preview");
    expect(demo).toContain("fictional");
    expect(demo).toMatch(/does not create demo\s+credentials/);
    expect(demoPersonas).toContain("Director / Organization Owner");
    expect(demoPersonas).not.toContain("Platform Super Admin");
  });

  it("represents the implemented module surface without changing entitlements", () => {
    expect(publicModules.length).toBeGreaterThanOrEqual(10);
    expect(publicModules.map((item) => item.title)).toEqual(
      expect.arrayContaining([
        "Students",
        "Staff",
        "Attendance & teaching",
        "Finance",
        "Assessment & results",
        "Management insights",
      ]),
    );
  });

  it("runs the onboarding walkthrough without a persistence action", () => {
    render(<OnboardingPrototype />);

    expect(
      screen.getByRole("heading", { name: /tell us about the organization/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/nothing entered here is submitted/i),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("heading", { name: /describe the first school/i }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Prototype complete — no data was saved.",
    );
    expect(
      screen.queryByRole("button", { name: /submit|create organization/i }),
    ).not.toBeInTheDocument();
  });
});
