import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError } from "@/lib/authorization";
import { promoteStudent, PromotionError } from "@/features/assessments/service";
import { recordStudentPromotion } from "./actions";

vi.mock("@/features/assessments/service", () => ({
  promoteStudent: vi.fn(),
  PromotionError: class extends Error {},
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));
const student = "11111111-1111-4111-8111-111111111111",
  period = "22222222-2222-4222-8222-222222222222";
function form(outcome = "graduated") {
  const f = new FormData();
  Object.entries({
    studentId: student,
    sourcePeriodId: period,
    outcome,
    idempotencyKey: "same-request-key",
    notes: "Synthetic workflow",
  }).forEach(([key, value]) => f.set(key, value));
  return f;
}
beforeEach(() => vi.clearAllMocks());
describe("promotion action", () => {
  it("rejects a promoted outcome without a target before calling the service", async () => {
    await expect(recordStudentPromotion(form("promoted"))).rejects.toThrow(
      "Check+the+promotion+details",
    );
    expect(promoteStudent).not.toHaveBeenCalled();
  });
  it("preserves the submitted idempotency key and uses the authorized service", async () => {
    vi.mocked(promoteStudent).mockResolvedValue(undefined);
    await expect(recordStudentPromotion(form())).rejects.toThrow(
      "Promotion+recorded",
    );
    expect(promoteStudent).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: student,
        sourcePeriodId: period,
        outcome: "graduated",
        idempotencyKey: "same-request-key",
      }),
    );
  });
  it("reports a permission denial without claiming success", async () => {
    vi.mocked(promoteStudent).mockRejectedValue(
      new AuthorizationError("permission_denied"),
    );
    await expect(recordStudentPromotion(form())).rejects.toThrow(
      "Promotion+is+unavailable",
    );
  });
  it("explains a rejected database workflow safely", async () => {
    vi.mocked(promoteStudent).mockRejectedValue(
      new PromotionError("private database detail"),
    );
    await expect(recordStudentPromotion(form())).rejects.toThrow(
      "Check+published+results",
    );
  });
  it("preserves authentication redirects and unexpected errors", async () => {
    const redirect = new Error("NEXT_REDIRECT");
    vi.mocked(promoteStudent).mockRejectedValue(redirect);
    await expect(recordStudentPromotion(form())).rejects.toBe(redirect);
  });
});
