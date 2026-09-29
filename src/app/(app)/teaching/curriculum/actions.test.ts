import { beforeEach, describe, expect, it, vi } from "vitest";

const { createCurriculumItem, updateCurriculumCoverage, redirect } = vi.hoisted(
  () => ({
    createCurriculumItem: vi.fn(),
    updateCurriculumCoverage: vi.fn(),
    redirect: vi.fn((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    }),
  }),
);
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/academics/curriculum-service", () => ({
  createCurriculumItem,
  updateCurriculumCoverage,
}));
import { changeCurriculumCoverage, saveCurriculumItem } from "./actions";

function validItem() {
  const form = new FormData();
  form.set("sessionId", crypto.randomUUID());
  form.set("teachingAssignmentId", crypto.randomUUID());
  form.set("sequence", "1");
  form.set("title", "Fractions");
  form.set("plannedStart", "2026-09-01");
  form.set("plannedEnd", "2026-09-05");
  return form;
}

describe("curriculum actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createCurriculumItem.mockResolvedValue(undefined);
    updateCurriculumCoverage.mockResolvedValue(undefined);
  });
  it("rejects malformed input before the service", async () => {
    await expect(saveCurriculumItem(new FormData())).rejects.toThrow(
      "error=Check+the+curriculum+details",
    );
    expect(createCurriculumItem).not.toHaveBeenCalled();
  });
  it("creates one validated curriculum item", async () => {
    await expect(saveCurriculumItem(validItem())).rejects.toThrow(
      "message=Curriculum+item+created",
    );
    expect(createCurriculumItem).toHaveBeenCalledTimes(1);
  });
  it("does not expose or retry a protected failure", async () => {
    createCurriculumItem.mockRejectedValueOnce(new Error("database detail"));
    await expect(saveCurriculumItem(validItem())).rejects.toThrow(
      "error=The+curriculum+item+could+not+be+created",
    );
    expect(createCurriculumItem).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalledWith(
      expect.stringContaining("database"),
    );
  });
  it("requires a completion date before updating", async () => {
    const form = new FormData();
    form.set("curriculumItemId", crypto.randomUUID());
    form.set("status", "completed");
    await expect(changeCurriculumCoverage(form)).rejects.toThrow(
      "error=Check+the+coverage+update",
    );
    expect(updateCurriculumCoverage).not.toHaveBeenCalled();
  });
});
