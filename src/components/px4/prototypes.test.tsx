import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ExperiencePrototype } from "./experience-prototype";
import { FamiliesPrototype } from "./families-prototype";
import {
  children,
  effectiveBrand,
  money,
  platformPersonas,
  tenants,
} from "./fixtures";
import { PlatformPrototype } from "./platform-prototype";

vi.mock("next/navigation", () => ({ usePathname: () => "/px4-families" }));

beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});
afterEach(cleanup);

describe("PX4 Prototype Packs C–E", () => {
  it("keeps linked child records separate and removes stale learner data", () => {
    render(<FamiliesPrototype />);
    expect(screen.getAllByText("Amara Okafor").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole("combobox", { name: "Linked learner" }), {
      target: { value: "musa" },
    });
    expect(screen.getAllByText("Musa Ibrahim").length).toBeGreaterThan(0);
    expect(
      screen.queryByText("Primary sports day consent"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fees & payments" }));
    expect(
      screen.getByText(money(children.musa.billedCents)),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sibling balances remain separate/i),
    ).toBeInTheDocument();
  });

  it("keeps student access self-only and guardian controls unavailable", () => {
    render(<FamiliesPrototype />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Family persona preview" }),
      { target: { value: "student" } },
    );
    expect(
      screen.getByRole("combobox", { name: "Linked learner" }),
    ).toBeDisabled();
    expect(
      screen.getByText(/student persona cannot switch learners/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Published results" }));
    expect(
      screen.getByText(/Unpublished assessment hidden/i),
    ).toBeInTheDocument();
  });

  it("renders explicit unrelated and cross-tenant denial language", () => {
    render(<FamiliesPrototype />);
    expect(
      screen.getByText(
        /No guardian relationship and outside the authorized tenant/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/School-wide or school-wide ledger/i),
    ).not.toBeInTheDocument();
  });

  it("materially differentiates all three platform personas", () => {
    const unique = new Set(
      Object.values(platformPersonas).map(
        (role) =>
          `${role.summary}:${role.priorities.join("|")}:${role.navigation.join("|")}`,
      ),
    );
    expect(unique.size).toBe(3);
    render(<PlatformPrototype />);
    const selector = screen.getByRole("combobox", {
      name: "Platform operator persona",
    });
    fireEvent.change(selector, { target: { value: "support" } });
    expect(screen.getByText(/Read-only: no lifecycle/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Feature rollout" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Organization Owner denied/i)).toBeInTheDocument();
  });

  it("keeps all high-impact platform mutations disabled", () => {
    render(<PlatformPrototype />);
    fireEvent.click(screen.getByRole("button", { name: "Tenant 360" }));
    for (const name of [
      "Restrict tenant",
      "Reactivate tenant",
      "Apply entitlement changes",
    ]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    expect(
      screen.getByText(/No production tenant status/i),
    ).toBeInTheDocument();
  });

  it("uses the approved tenant lifecycle model without deletion", () => {
    expect(tenants.map((tenant) => tenant.status)).toEqual([
      "Active",
      "Restricted",
      "Suspended",
      "Reactivated",
    ]);
    render(<PlatformPrototype />);
    fireEvent.click(screen.getByRole("button", { name: "Organizations" }));
    expect(screen.queryByText(/delete tenant/i)).not.toBeInTheDocument();
  });

  it("resolves branding inheritance and keeps publish concepts disabled", () => {
    expect(effectiveBrand("school").name).toBe("Cedarbridge Academy");
    render(<ExperiencePrototype />);
    fireEvent.click(screen.getByRole("button", { name: "Branding Studio" }));
    expect(
      screen.getByText("Platform → organization → school"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publish branding" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Rollback published version" }),
    ).toBeDisabled();
  });

  it("separates search visibility from command authorization", () => {
    render(<ExperiencePrototype />);
    fireEvent.click(screen.getByRole("button", { name: "Search & commands" }));
    expect(screen.getByText("Northgate learner")).toBeInTheDocument();
    expect(screen.getByText("Restricted result")).toBeInTheDocument();
    expect(
      screen.getByText(/search visibility does not authorize/i),
    ).toBeInTheDocument();
  });

  it("provides shared pack navigation and accessible workspace controls", () => {
    render(<FamiliesPrototype />);
    expect(
      screen.getByRole("navigation", { name: "PX4 prototype packs" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Family workspace" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", {
        name: /Home|For You|Attendance|Fees & payments|Published results|Messages & documents/,
      }),
    ).toHaveLength(6);
  });
});
