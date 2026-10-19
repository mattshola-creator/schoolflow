import { afterEach, describe, expect, it, vi } from "vitest";
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

  it("maps authorization denial to not found", async () => {
    vi.mocked(loadScoreSheet).mockRejectedValue(
      new AuthorizationError("permission_denied"),
    );

    await expect(renderPage()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("preserves score sheet data errors", async () => {
    const error = new Error("Score sheet details could not be loaded");
    vi.mocked(loadScoreSheet).mockRejectedValue(error);

    await expect(renderPage()).rejects.toBe(error);
  });
});
