import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  correctStudentAttendanceEntry,
  submitStudentAttendanceRegister,
  redirect,
} = vi.hoisted(() => ({
  correctStudentAttendanceEntry: vi.fn(),
  submitStudentAttendanceRegister: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/features/attendance/service", () => ({
  correctStudentAttendanceEntry,
  submitStudentAttendanceRegister,
}));

import { correctAttendanceEntry, submitAttendanceRegister } from "./actions";

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

function validCorrectionForm() {
  const form = validForm();
  form.set("entryId", crypto.randomUUID());
  form.set("status", "excused");
  form.set("reason", "Medical note received");
  return form;
}

describe("student attendance submission action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    correctStudentAttendanceEntry.mockResolvedValue(crypto.randomUUID());
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

  it("rejects an invalid correction before invoking the correction RPC service", async () => {
    const form = validCorrectionForm();
    form.set("reason", "x");
    await expect(correctAttendanceEntry(form)).rejects.toThrow(
      "REDIRECT:/attendance?error=",
    );
    expect(correctStudentAttendanceEntry).not.toHaveBeenCalled();
  });

  it("saves one validated correction with its reason", async () => {
    await expect(correctAttendanceEntry(validCorrectionForm())).rejects.toThrow(
      "message=Attendance+correction+saved",
    );
    expect(correctStudentAttendanceEntry).toHaveBeenCalledTimes(1);
    expect(correctStudentAttendanceEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "excused",
        reason: "Medical note received",
      }),
    );
  });

  it("does not retry or expose details when correction fails", async () => {
    correctStudentAttendanceEntry.mockRejectedValueOnce(
      new Error("sensitive database detail"),
    );
    await expect(correctAttendanceEntry(validCorrectionForm())).rejects.toThrow(
      "error=The+attendance+correction+could+not+be+saved",
    );
    expect(correctStudentAttendanceEntry).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalledWith(
      expect.stringContaining("sensitive"),
    );
  });
});
