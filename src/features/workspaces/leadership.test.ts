import { expect, it } from "vitest";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import type { SchoolSummary } from "@/features/reporting/service";
import { projectLeadership } from "./leadership";
const auth: AuthorizationSnapshot = {
  organizationId: "org",
  schoolId: "school",
  permissions: [
    "reporting.dashboard.view",
    "reporting.academic.view",
    "academics.teaching_assignments.view",
  ],
  modules: ["reporting", "academics"].map((key) => ({
    key,
    entitled: true,
    enabled: true,
  })),
  features: [
    {
      key: "reporting.management_dashboard",
      module: "reporting",
      enabled: true,
    },
    { key: "reporting.standard_reports", module: "reporting", enabled: true },
    {
      key: "academics.teaching_management",
      module: "academics",
      enabled: true,
    },
  ],
};
const school = {
  schoolId: "school",
  teaching: { approvedPlans: 8, deliveredLessons: 6 },
  finance: { outstanding: "private" },
  students: { activeEnrollments: 180 },
  results: { publishedBatches: 10 },
  attendance: { entries: 4, present: 3 },
} as unknown as SchoolSummary;
it("serializes only specifically authorized leadership fields", () => {
  expect(projectLeadership(school, "school", auth)).toEqual({
    teaching: { approvedPlans: 8, deliveredLessons: 6 },
  });
  expect(
    projectLeadership(school, "school", { ...auth, permissions: [] }),
  ).toEqual({});
});
it("rejects foreign school data instead of rendering it", () => {
  expect(() => projectLeadership(school, "foreign", auth)).toThrow();
});
it("does not reveal teaching counts without domain access or entitlement", () => {
  expect(
    projectLeadership(school, "school", {
      ...auth,
      permissions: ["reporting.academic.view"],
    }),
  ).toEqual({});
  expect(projectLeadership(school, "school", { ...auth, modules: [] })).toEqual(
    {},
  );
});
