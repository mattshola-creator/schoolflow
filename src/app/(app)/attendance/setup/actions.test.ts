import { beforeEach, describe, expect, it, vi } from "vitest";

const { saveAttendanceSettings, redirect, revalidatePath } = vi.hoisted(() => ({
  saveAttendanceSettings: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/features/attendance/service", () => ({ saveAttendanceSettings }));

import { saveAttendancePolicy } from "./actions";

function validPolicy() {
  const form = new FormData();
  form.set("lockAfterDays", "1");
  for (const status of ["present", "late", "absent", "excused", "left_early"])
    form.append("enabledStudentStatuses", status);
  for (const day of ["1", "2", "3", "4", "5"])
    form.append("studentAttendanceDays", day);
  return form;
}

describe("attendance policy action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveAttendanceSettings.mockResolvedValue(undefined);
  });

  it("rejects an incomplete policy before invoking the service", async () => {
    await expect(saveAttendancePolicy(new FormData())).rejects.toThrow(
      "REDIRECT:/attendance/setup?error=",
    );
    expect(saveAttendanceSettings).not.toHaveBeenCalled();
  });

  it("saves one validated baseline policy", async () => {
    await expect(saveAttendancePolicy(validPolicy())).rejects.toThrow(
      "message=Attendance+policy+saved",
    );
    expect(saveAttendanceSettings).toHaveBeenCalledTimes(1);
    expect(saveAttendanceSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        closingRegisterEnabled: false,
        lockAfterDays: 1,
        studentAttendanceDays: [1, 2, 3, 4, 5],
      }),
    );
  });

  it("does not retry or expose details when saving fails", async () => {
    saveAttendanceSettings.mockRejectedValueOnce(new Error("database detail"));
    await expect(saveAttendancePolicy(validPolicy())).rejects.toThrow(
      "REDIRECT:/attendance/setup?error=",
    );
    expect(saveAttendanceSettings).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalledWith(
      expect.stringContaining("database"),
    );
  });
});
