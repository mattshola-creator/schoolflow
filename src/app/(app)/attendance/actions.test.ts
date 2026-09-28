import { beforeEach, describe, expect, it, vi } from "vitest";

const { submitStudentAttendanceRegister, redirect } = vi.hoisted(() => ({
  submitStudentAttendanceRegister: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/features/attendance/service", () => ({
  submitStudentAttendanceRegister,
}));

import { submitAttendanceRegister } from "./actions";

function validForm() {
  const sessionId = crypto.randomUUID();
  const classLevelId = crypto.randomUUID();
  const studentId = crypto.randomUUID();
  const form = new FormData();
  form.set("attendanceDate", "2026-09-28");
  form.set("registerType", "morning");
  form.set("scope", `${sessionId}:${classLevelId}:none`);
  form.set("idempotencyKey", crypto.randomUUID());
  form.append("studentId", studentId);
  form.set(`status:${studentId}`, "present");
  return form;
}

describe("student attendance submission action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitStudentAttendanceRegister.mockResolvedValue(crypto.randomUUID());
  });

  it("rejects malformed input before invoking the attendance RPC service", async () => {
    await expect(submitAttendanceRegister(new FormData())).rejects.toThrow(
      "REDIRECT:/attendance?error=",
    );
    expect(submitStudentAttendanceRegister).not.toHaveBeenCalled();
  });

  it("submits one validated complete form and redirects safely", async () => {
    await expect(submitAttendanceRegister(validForm())).rejects.toThrow(
      "message=Attendance+register+submitted",
    );
    expect(submitStudentAttendanceRegister).toHaveBeenCalledTimes(1);
    expect(submitStudentAttendanceRegister).toHaveBeenCalledWith(
      expect.objectContaining({
        attendanceDate: "2026-09-28",
        registerType: "morning",
        entries: [expect.objectContaining({ status: "present" })],
      }),
    );
  });

  it("does not retry when the submission service rejects", async () => {
    submitStudentAttendanceRegister.mockRejectedValueOnce(
      new Error("database detail"),
    );
    await expect(submitAttendanceRegister(validForm())).rejects.toThrow(
      "error=The+attendance+register+could+not+be+submitted",
    );
    expect(submitStudentAttendanceRegister).toHaveBeenCalledTimes(1);
  });
});
