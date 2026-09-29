import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createTeachingAssignment,
  updateTeachingAssignmentLifecycle,
  redirect,
} = vi.hoisted(() => ({
  createTeachingAssignment: vi.fn(),
  updateTeachingAssignmentLifecycle: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/academics/teaching-service", () => ({
  createTeachingAssignment,
  updateTeachingAssignmentLifecycle,
}));

import { changeTeachingAssignment, saveTeachingAssignment } from "./actions";

function validForm() {
  const form = new FormData();
  form.set("sessionId", crypto.randomUUID());
  form.set("staffAssignmentId", crypto.randomUUID());
  form.set("assignmentType", "subject_teacher");
  form.set("subjectId", crypto.randomUUID());
  form.set("classLevelId", crypto.randomUUID());
  form.set("startedOn", "2026-09-01");
  return form;
}

describe("teaching assignment actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTeachingAssignment.mockResolvedValue(undefined);
    updateTeachingAssignmentLifecycle.mockResolvedValue(undefined);
  });

  it("rejects malformed assignment input before the service", async () => {
    await expect(saveTeachingAssignment(new FormData())).rejects.toThrow(
      "error=Check+the+teaching+assignment+details",
    );
    expect(createTeachingAssignment).not.toHaveBeenCalled();
  });

  it("creates one validated assignment", async () => {
    await expect(saveTeachingAssignment(validForm())).rejects.toThrow(
      "message=Teaching+assignment+created",
    );
    expect(createTeachingAssignment).toHaveBeenCalledTimes(1);
  });

  it("does not retry or expose a protected create failure", async () => {
    createTeachingAssignment.mockRejectedValueOnce(
      new Error("database detail"),
    );
    await expect(saveTeachingAssignment(validForm())).rejects.toThrow(
      "error=The+teaching+assignment+could+not+be+created",
    );
    expect(createTeachingAssignment).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalledWith(
      expect.stringContaining("database"),
    );
  });

  it("requires valid lifecycle input before updating", async () => {
    await expect(changeTeachingAssignment(new FormData())).rejects.toThrow(
      "error=The+assignment+change+is+invalid",
    );
    expect(updateTeachingAssignmentLifecycle).not.toHaveBeenCalled();
  });
});
