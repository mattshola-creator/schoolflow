import { beforeEach, describe, expect, it, vi } from "vitest";

const { saveStaffAttendancePolicy, redirect } = vi.hoisted(() => ({
  saveStaffAttendancePolicy: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/attendance/service", () => ({
  saveStaffAttendancePolicy,
}));

import { saveWorkingHoursPolicy } from "./actions";

function validForm() {
  const form = new FormData();
  form.set("name", "Teaching staff");
  form.set("startsAt", "07:30:00");
  form.set("endsAt", "16:00:00");
  form.set("graceMinutes", "15");
  form.set("effectiveFrom", "2026-09-01");
  for (const day of ["1", "2", "3", "4", "5"]) form.append("workingDays", day);
  return form;
}

describe("staff working-hours action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveStaffAttendancePolicy.mockResolvedValue(undefined);
  });

  it("rejects invalid hours before invoking the service", async () => {
    await expect(saveWorkingHoursPolicy(new FormData())).rejects.toThrow(
      "error=The+working-hours+policy+is+invalid",
    );
    expect(saveStaffAttendancePolicy).not.toHaveBeenCalled();
  });

  it("saves one validated policy", async () => {
    await expect(saveWorkingHoursPolicy(validForm())).rejects.toThrow(
      "message=Staff+working-hours+policy+saved",
    );
    expect(saveStaffAttendancePolicy).toHaveBeenCalledTimes(1);
    expect(saveStaffAttendancePolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        workingDays: [1, 2, 3, 4, 5],
        graceMinutes: 15,
      }),
    );
  });
});
