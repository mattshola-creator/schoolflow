import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthorizationError } from "@/lib/authorization";
const mocks = vi.hoisted(() => ({ load: vi.fn(), rpc: vi.fn() }));
vi.mock("@/features/assessments/service", () => ({
  loadAssessmentWorkspace: mocks.load,
}));
vi.mock("@/features/owner-dashboard/entry", () => ({
  ownerEntryEnabled: () => true,
}));
import Page from "./page";
beforeEach(() => {
  mocks.rpc.mockResolvedValue({
    data: {
      subjectName: "Mathematics",
      sessionName: "2026/27",
      periodName: "First term",
      className: "Primary 3",
      armName: "Blue",
      assignedTeacherName: "Assigned Teacher",
    },
    error: null,
  });
  mocks.load.mockResolvedValue({
    supabase: { rpc: mocks.rpc },
    active: { organizationId: "org", schoolId: "school", schoolName: "School" },
    authorization: {
      organizationId: "org",
      schoolId: "school",
      permissions: ["academics.scores.view"],
      modules: [{ key: "academics", enabled: true, entitled: true }],
      features: [
        { key: "academics.score_entry", module: "academics", enabled: true },
      ],
    },
    batches: [
      {
        id: "batch",
        version: 1,
        status: "submitted",
        subject_id: "subject",
        class_level_id: "class",
        class_arm_id: "arm",
      },
    ],
  });
});
afterEach(() => vi.resetAllMocks());
it("uses the authenticated six-label RPC with exact context and shows submitted status", async () => {
  const html = renderToStaticMarkup(await Page());
  expect(mocks.rpc).toHaveBeenCalledWith("get_assessment_score_sheet_context", {
    target_batch_id: "batch",
    target_organization_id: "org",
    target_school_id: "school",
  });
  for (const value of [
    "Mathematics",
    "Primary 3",
    "Blue",
    "Assigned Teacher",
    "Submitted",
    "/assessments/batch",
  ])
    expect(html).toContain(value);
  expect(html).not.toContain('href="/finance');
  expect(html).not.toContain('href="/teaching/timetable');
  expect(html).not.toContain("<form");
});
it("keeps denied workspaces record-free", async () => {
  mocks.load.mockRejectedValue(new AuthorizationError("permission_denied"));
  const html = renderToStaticMarkup(await Page());
  expect(html).toContain("Teacher workspace unavailable");
  expect(mocks.rpc).not.toHaveBeenCalled();
  expect(html).not.toContain("Mathematics");
});
it("does not disguise unexpected database failures as denied or empty data", async () => {
  const error = new Error("Unexpected database failure");
  mocks.load.mockRejectedValue(error);
  await expect(Page()).rejects.toBe(error);
});
it("retains explicit missing metadata without inventing labels", async () => {
  mocks.rpc.mockResolvedValue({
    data: {
      subjectName: null,
      sessionName: null,
      periodName: null,
      className: null,
      armName: null,
      assignedTeacherName: null,
    },
    error: null,
  });
  const html = renderToStaticMarkup(await Page());
  expect(html).toContain("Subject label unavailable");
  expect(html).toContain("Assigned teacher details unavailable");
});
