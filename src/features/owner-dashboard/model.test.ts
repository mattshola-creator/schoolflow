import { describe, expect, it } from "vitest";
import {
  assertOwnerSchool,
  ownerVisibility,
  projectOwnerSummary,
} from "./model";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import type { SchoolSummary } from "@/features/reporting/service";
const auth: AuthorizationSnapshot = {
  organizationId: "org",
  schoolId: "school",
  permissions: [
    "reporting.dashboard.view",
    "reporting.school.view",
    "reporting.attendance.view",
    "reporting.academic.view",
    "students.view",
    "attendance.view",
    "academics.scores.view",
    "finance.view",
    "shared.tasks.view",
  ],
  modules: [
    "foundation",
    "students",
    "attendance",
    "academics",
    "finance",
    "reporting",
  ].map((key) => ({ key, entitled: true, enabled: true })),
  features: [
    {
      key: "reporting.management_dashboard",
      module: "reporting",
      enabled: true,
    },
    { key: "reporting.standard_reports", module: "reporting", enabled: true },
    { key: "academics.score_entry", module: "academics", enabled: true },
    { key: "foundation.action_center", module: "foundation", enabled: true },
  ],
};
const school = {
  schoolId: "school",
  schoolName: "Not serialized",
  students: { activeEnrollments: 12, male: 8, female: 4 },
  attendance: { entries: 24, present: 22, late: 2, absent: 2 },
  results: {
    publishedBatches: 3,
    publishedResults: 12,
    passedResults: 10,
    gradeDistribution: { A: 8 },
    promoted: 10,
  },
  finance: { outstanding: "SECRET-FIELD" },
  admissions: { applications: 99 },
} as unknown as SchoolSummary;
describe("Owner school DTO boundary", () => {
  it("rejects organization-only, foreign school and mismatched organization contexts", () => {
    for (const context of [
      null,
      {
        organizationId: "org",
        organizationName: "Org",
        schoolId: null,
        schoolName: null,
      },
      {
        organizationId: "foreign",
        organizationName: "Other",
        schoolId: "school",
        schoolName: "Other",
      },
      {
        organizationId: "org",
        organizationName: "Org",
        schoolId: "foreign",
        schoolName: "Other",
      },
    ])
      expect(() => assertOwnerSchool(context, auth)).toThrow();
  });
  it("emits only specifically permitted summary fields", () => {
    const result = projectOwnerSummary(school, "school", ownerVisibility(auth));
    expect(result).toEqual({
      activeEnrollments: 12,
      attendance: { recordedMarks: 24, presentIncludingLate: 22 },
      publicationVersions: 3,
    });
    expect(JSON.stringify(result)).not.toContain("SECRET");
    expect(JSON.stringify(result)).not.toContain("gradeDistribution");
  });
  it("omits unauthorized metrics instead of sending hidden values or zeros", () => {
    const limited = {
      ...auth,
      permissions: ["reporting.dashboard.view", "shared.tasks.view"],
    };
    expect(
      projectOwnerSummary(school, "school", ownerVisibility(limited)),
    ).toEqual({});
    expect(ownerVisibility(limited).approvals).toBe(false);
    expect(ownerVisibility(limited).notifications).toBe(false);
  });
  it("does not let domain permissions bypass disabled modules or features", () => {
    expect(ownerVisibility({ ...auth, features: [] }).attendance).toBe(false);
    expect(
      ownerVisibility({
        ...auth,
        modules: auth.modules.map((m) => ({ ...m, entitled: false })),
      }).finance,
    ).toBe(false);
  });
  it("rejects a foreign school returned by a service", () => {
    expect(() =>
      projectOwnerSummary(school, "foreign", ownerVisibility(auth)),
    ).toThrow("Unexpected reporting school");
  });
});
