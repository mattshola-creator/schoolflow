import { describe, expect, it } from "vitest";
import { resolveActiveContext, type TenantOption } from "./context";
const options: TenantOption[] = [
  {
    organizationId: "org-a",
    organizationName: "A",
    schoolId: "school-a",
    schoolName: "A School",
  },
  {
    organizationId: "org-b",
    organizationName: "B",
    schoolId: "school-b",
    schoolName: "B School",
  },
];
describe("active tenant context", () => {
  it("accepts only an available context", () => {
    expect(
      resolveActiveContext(options, "org-b", "school-b")?.organizationId,
    ).toBe("org-b");
  });
  it("falls back when a client supplies an unauthorized context", () => {
    expect(resolveActiveContext(options, "org-x", "school-x")).toEqual(
      options[0],
    );
  });
  it("returns null without memberships", () => {
    expect(resolveActiveContext([])).toBeNull();
  });
});
