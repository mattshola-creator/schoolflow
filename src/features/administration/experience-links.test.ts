import { describe, it, expect } from "vitest";
import { experienceLinks } from "./experience-links";
const auth = {
  organizationId: "o",
  schoolId: "s",
  permissions: ["school.manage", "role.view"],
  modules: [{ key: "foundation", entitled: true, enabled: true }],
  features: [
    {
      key: "foundation.authorization_inspection",
      module: "foundation",
      enabled: true,
    },
  ],
};
describe("QA experience links", () => {
  it("does not advertise Studio to a non-Owner", () =>
    expect(experienceLinks(auth, false, true).map((x) => x.href)).not.toContain(
      "/administration/branding",
    ));
  it("does not enable QA routes in production", () =>
    expect(experienceLinks(auth, true, false)).toEqual([]));
  it("requires explicit school and capability", () =>
    expect(
      experienceLinks({ ...auth, schoolId: null }, true, true).map(
        (x) => x.href,
      ),
    ).not.toContain("/administration/branding"));
  it("shows Owner Studio and explorer plus authorized roles", () =>
    expect(experienceLinks(auth, true, true)).toHaveLength(4));
  it("keeps role management hidden without permission", () =>
    expect(
      experienceLinks({ ...auth, permissions: [] }, false, true).map(
        (x) => x.href,
      ),
    ).not.toContain("/administration/roles"));
});
