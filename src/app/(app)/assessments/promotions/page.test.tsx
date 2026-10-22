import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthorizationError } from "@/lib/authorization";
import { loadPromotionWorkspace } from "@/features/assessments/service";
import PromotionsPage from "./page";

vi.mock("@/features/assessments/service", () => ({
  loadPromotionWorkspace: vi.fn(),
}));
vi.mock("./actions", () => ({ recordStudentPromotion: vi.fn() }));
afterEach(() => vi.clearAllMocks());
const render = () => PromotionsPage({ searchParams: Promise.resolve({}) });
describe("promotion workspace", () => {
  it("does not expose forms or learner records when authorization is denied", async () => {
    vi.mocked(loadPromotionWorkspace).mockRejectedValue(
      new AuthorizationError("permission_denied"),
    );
    const html = renderToStaticMarkup(await render());
    expect(html).toContain("Promotion access unavailable");
    expect(html).not.toContain("<form");
  });
  it("renders readable scoped choices and existing historical decisions with a private replay key", async () => {
    vi.mocked(loadPromotionWorkspace).mockResolvedValue({
      students: [
        {
          id: "student",
          student_number: "SYN-001",
          people: { first_name: "Synthetic", last_name: "Learner" },
        },
      ],
      sessions: [
        { id: "session", name: "Synthetic session", status: "active" },
      ],
      periods: [{ id: "period", session_id: "session", name: "Final term" }],
      levels: [{ id: "level", name: "Primary 4" }],
      arms: [],
      history: [
        {
          id: "promotion",
          student_id: "student",
          source_period_id: "period",
          outcome: "promoted",
          target_session_id: "session",
          target_class_level_id: "level",
        },
      ],
    } as unknown as Awaited<ReturnType<typeof loadPromotionWorkspace>>);
    const html = renderToStaticMarkup(await render());
    expect(html).toContain("Synthetic Learner");
    expect(html).toContain("Promotion history");
    expect(html).toContain("Final term");
    expect(html).toMatch(
      /type="hidden" name="idempotencyKey" value="[a-f0-9-]{36}"/,
    );
    expect(html).toContain("Primary 4");
  });
  it("preserves genuine loading failures", async () => {
    const error = new Error("database unavailable");
    vi.mocked(loadPromotionWorkspace).mockRejectedValue(error);
    await expect(render()).rejects.toBe(error);
  });
});
