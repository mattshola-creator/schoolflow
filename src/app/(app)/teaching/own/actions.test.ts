import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  edit: vi.fn(),
  submit: vi.fn(),
  deliver: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/features/academics/own-teaching-service", () => ({
  createOwnLessonPlan: mocks.create,
  updateOwnLessonPlan: mocks.edit,
  submitOwnLessonPlan: mocks.submit,
  recordOwnLessonDelivery: mocks.deliver,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(url);
  },
}));
import { saveOwnTeaching } from "./actions";
import { LessonOperationError } from "@/features/academics/lesson-operation-error";
beforeEach(() => vi.resetAllMocks());
it.each([
  ["create", "create"],
  ["edit", "edit"],
  ["submit", "submit"],
  ["deliver", "deliver"],
] as const)(
  "dispatches %s through the authenticated own adapter",
  async (operation, key) => {
    const form = new FormData();
    form.set("operation", operation);
    form.set("id", "synthetic-id");
    await expect(saveOwnTeaching(form)).rejects.toThrow(
      "/teaching/own?message=Lesson+operation+saved",
    );
    expect(mocks[key]).toHaveBeenCalledWith({ operation, id: "synthetic-id" });
    expect(mocks.revalidate).toHaveBeenCalledWith("/workspace/teacher");
  },
);
it("rejects approval or management operations without calling a mutation", async () => {
  const form = new FormData();
  form.set("operation", "approve");
  await expect(saveOwnTeaching(form)).rejects.toThrow(
    "Invalid+lesson+operation",
  );
  expect(mocks.submit).not.toHaveBeenCalled();
  expect(mocks.create).not.toHaveBeenCalled();
});
it("keeps database failures distinct and does not report success or leak upstream text", async () => {
  mocks.create.mockRejectedValue(new LessonOperationError("XX000"));
  const form = new FormData();
  form.set("operation", "create");
  await expect(saveOwnTeaching(form)).rejects.toThrow("unexpected_failure");
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
