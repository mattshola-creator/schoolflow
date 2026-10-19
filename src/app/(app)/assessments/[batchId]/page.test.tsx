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
});
