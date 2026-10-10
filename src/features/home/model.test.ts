import { describe, expect, it } from "vitest";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import {
  deriveResponsibilities,
  safeOperationalHref,
  sortDailyWork,
} from "./model";

const authorization: AuthorizationSnapshot = {
  organizationId: "org",
  schoolId: "school",
  permissions: ["finance.view", "admissions.view", "organization.view"],
  modules: [],
  features: [],
};

describe("operational Home model", () => {
  it("combines only the caller's established responsibilities", () => {
    expect(deriveResponsibilities(authorization)).toEqual([
      "Finance",
      "Admissions",
      "Administration",
    ]);
  });

  it("orders urgent work first and then by due date", () => {
    const sorted = sortDailyWork([
      {
        id: "normal",
        title: "Normal",
        status: "open",
        priority: "normal",
        dueAt: "2026-10-10",
        kind: "task",
        href: "/action-center",
      },
      {
        id: "urgent-later",
        title: "Urgent later",
        status: "open",
        priority: "urgent",
        dueAt: "2026-10-12",
        kind: "task",
        href: "/action-center",
      },
      {
        id: "urgent-first",
        title: "Urgent first",
        status: "open",
        priority: "urgent",
        dueAt: "2026-10-11",
        kind: "task",
        href: "/action-center",
      },
    ]);
    expect(sorted.map((item) => item.id)).toEqual([
      "urgent-first",
      "urgent-later",
      "normal",
    ]);
  });

  it("keeps notification links within the application", () => {
    expect(safeOperationalHref("/students")).toBe("/students");
    expect(safeOperationalHref("https://example.com")).toBe("/communication");
    expect(safeOperationalHref("//example.com")).toBe("/communication");
  });
});
