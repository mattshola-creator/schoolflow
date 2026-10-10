import { describe, expect, it } from "vitest";
import {
  buildTenantOptions,
  resolveActiveContext,
  type TenantOption,
} from "./context";
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

  it("offers organization-wide scope only to all-school memberships", () => {
    const schools = [
      { id: "school-a", name: "Primary", organization_id: "org-a" },
      { id: "school-b", name: "Academy", organization_id: "org-a" },
    ];
    const restricted = buildTenantOptions(
      [
        {
          organization_id: "org-a",
          organizations: { name: "Cedarbridge" },
          all_schools: false,
        },
      ],
      schools,
    );
    const allSchools = buildTenantOptions(
      [
        {
          organization_id: "org-a",
          organizations: { name: "Cedarbridge" },
          all_schools: true,
        },
      ],
      schools,
    );

    expect(restricted.every((option) => option.schoolId)).toBe(true);
    expect(allSchools[2]).toMatchObject({
      organizationId: "org-a",
      schoolId: null,
      schoolName: null,
    });
    expect(allSchools).toHaveLength(3);
  });
});
