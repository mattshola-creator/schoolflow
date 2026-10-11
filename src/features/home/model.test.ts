import { describe, expect, it } from "vitest";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import {
  composeOperationalCounts,
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

  it("keeps exact totals independent of the bounded 20-item lists", () => {
    expect(
      composeOperationalCounts({
        taskCount: 47,
        approvalCount: 26,
        notificationCount: 81,
        urgentTaskCount: 23,
      }),
    ).toEqual({ tasks: 47, approvals: 26, notifications: 81, urgent: 49 });
  });

  it("returns zero totals for empty count results", () => {
    expect(
      composeOperationalCounts({
        taskCount: 0,
        approvalCount: 0,
        notificationCount: 0,
        urgentTaskCount: 0,
      }),
    ).toEqual({ tasks: 0, approvals: 0, notifications: 0, urgent: 0 });
  });
});
