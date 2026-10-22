import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthorizationError } from "@/lib/authorization";
import { loadPublishedReport } from "@/features/assessments/service";
import ReportCardPage from "./page";

vi.mock("@/features/assessments/service", () => ({
  loadPublishedReport: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("published report access handling", () => {
  afterEach(() => vi.clearAllMocks());

  const renderPage = () =>
    ReportCardPage({
      params: Promise.resolve({
        batchId: "060c826b-ecc1-4e6b-b9f2-406bafe6e2b1",
      }),
    });

  it.each([
    "permission_denied",
    "invalid_context",
    "not_entitled",
    "module_disabled",
    "feature_disabled",
  ] as const)("explains %s without exposing score records", async (reason) => {
    vi.mocked(loadPublishedReport).mockRejectedValue(
      new AuthorizationError(reason),
    );
    const html = renderToStaticMarkup(await renderPage());
    expect(html).toContain("Report access unavailable");
    expect(html).not.toContain("060c826b-ecc1-4e6b-b9f2-406bafe6e2b1");
    expect(html).not.toContain("<form");
  });

  it("preserves score sheet data errors", async () => {
    const error = new Error("Published report could not be loaded");
    vi.mocked(loadPublishedReport).mockRejectedValue(error);

    await expect(renderPage()).rejects.toBe(error);
  });
});
