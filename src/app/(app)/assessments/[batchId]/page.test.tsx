import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthorizationError } from "@/lib/authorization";
import { loadScoreSheet } from "@/features/assessments/service";
import ScoreSheetPage from "./page";

vi.mock("@/features/assessments/service", () => ({
  loadScoreSheet: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("../actions", () => ({
  saveAssessmentScore: vi.fn(),
}));

describe("assessment score sheet access handling", () => {
  afterEach(() => vi.clearAllMocks());

  const renderPage = () =>
    ScoreSheetPage({
      params: Promise.resolve({
        batchId: "060c826b-ecc1-4e6b-b9f2-406bafe6e2b1",
      }),
      searchParams: Promise.resolve({}),
    });

  it.each([
    "permission_denied",
    "invalid_context",
    "not_entitled",
    "module_disabled",
    "feature_disabled",
  ] as const)("explains %s without exposing score records", async (reason) => {
    vi.mocked(loadScoreSheet).mockRejectedValue(new AuthorizationError(reason));
    const html = renderToStaticMarkup(await renderPage());
    expect(html).toContain("Assessment access unavailable");
    expect(html).not.toContain("060c826b-ecc1-4e6b-b9f2-406bafe6e2b1");
    expect(html).not.toContain("<form");
  });

  it("preserves score sheet data errors", async () => {
    const error = new Error("Score sheet details could not be loaded");
    vi.mocked(loadScoreSheet).mockRejectedValue(error);

    await expect(renderPage()).rejects.toBe(error);
  });
  it("renders authorized scores when academic label embeds are hidden by RLS", async () => {
    const workspace = {
      batch: {
        status: "published",
        subjects: null,
        class_levels: null,
        academic_sessions: null,
        academic_periods: null,
        class_arms: null,
        assessment_schemes: {
          name: "QA scheme",
          assessment_components: [
            { id: "component", name: "Exam", maximum_score: 100, sequence: 1 },
          ],
        },
      },
      students: [
        {
          student_id: "student",
          student_profiles: [
            {
              student_number: "QA-1",
              people: { first_name: "Synthetic", last_name: "Learner" },
            },
          ],
        },
      ],
      scores: [{ student_id: "student", component_id: "component", score: 72 }],
      results: [],
    } as unknown as Awaited<ReturnType<typeof loadScoreSheet>>;
    vi.mocked(loadScoreSheet).mockResolvedValue(workspace);
    const html = renderToStaticMarkup(await renderPage());
    for (const label of ["Subject", "Class", "Session", "Period"])
      expect(html).toContain(`${label} label unavailable`);
    expect(html).toContain("Synthetic");
    expect(html).toContain("Exam");
    expect(html).toContain("72");
    expect(html).not.toContain("Assessment access unavailable");
    expect(html).not.toContain("No active students");
    expect(html).not.toContain("<form");
  });
});
