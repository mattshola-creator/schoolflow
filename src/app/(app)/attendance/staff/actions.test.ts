import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  correctStaffClockEvent,
  recordStaffClockEvent,
  redirect,
  revalidatePath,
} = vi.hoisted(() => ({
  correctStaffClockEvent: vi.fn(),
  recordStaffClockEvent: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
  revalidatePath: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/features/attendance/service", () => ({
  correctStaffClockEvent,
  recordStaffClockEvent,
}));

import { correctStaffClock, recordStaffClock } from "./actions";

function validForm() {
  const form = new FormData();
  form.set("staffAssignmentId", crypto.randomUUID());
  form.set("eventType", "clock_in");
  form.set("idempotencyKey", crypto.randomUUID());
  return form;
}

function validCorrectionForm() {
  const form = new FormData();
  form.set("clockEventId", crypto.randomUUID());
  form.set("attendanceDate", "2026-09-28");
  form.set("correctedTime", "08:15");
  form.set("reason", "Approved time correction");
  return form;
}

describe("staff clock action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    correctStaffClockEvent.mockResolvedValue(crypto.randomUUID());
    recordStaffClockEvent.mockResolvedValue(crypto.randomUUID());
  });

  it("rejects malformed input before the service", async () => {
    await expect(recordStaffClock(new FormData())).rejects.toThrow(
      "REDIRECT:/attendance/staff?error=",
    );
    expect(recordStaffClockEvent).not.toHaveBeenCalled();
  });

  it("records exactly one server-timestamped event", async () => {
    await expect(recordStaffClock(validForm())).rejects.toThrow(
      "message=Staff+clock+event+recorded",
    );
    expect(recordStaffClockEvent).toHaveBeenCalledTimes(1);
    expect(recordStaffClockEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "clock_in",
        occurredAt: expect.stringMatching(/Z$/),
      }),
    );
  });

  it("does not retry or expose protected failure details", async () => {
    recordStaffClockEvent.mockRejectedValueOnce(new Error("database detail"));
    await expect(recordStaffClock(validForm())).rejects.toThrow(
      "error=The+clock+event+could+not+be+recorded",
    );
    expect(recordStaffClockEvent).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalledWith(
      expect.stringContaining("database"),
    );
  });

  it("rejects a malformed correction before the service", async () => {
    await expect(correctStaffClock(new FormData())).rejects.toThrow(
      "error=The+correction+request+is+invalid",
    );
    expect(correctStaffClockEvent).not.toHaveBeenCalled();
  });

  it("submits one offset-aware correction and preserves the selected date", async () => {
    const form = validCorrectionForm();
    await expect(correctStaffClock(form)).rejects.toThrow(
      "date=2026-09-28&message=Staff+clock+correction+saved",
    );
    expect(correctStaffClockEvent).toHaveBeenCalledTimes(1);
    expect(correctStaffClockEvent).toHaveBeenCalledWith({
      clockEventId: form.get("clockEventId"),
      correctedOccurredAt: "2026-09-28T08:15:00+01:00",
      reason: "Approved time correction",
    });
  });

  it("does not retry or disclose a protected correction failure", async () => {
    correctStaffClockEvent.mockRejectedValueOnce(
      new Error("protected database detail"),
    );
    await expect(correctStaffClock(validCorrectionForm())).rejects.toThrow(
      "error=The+clock+correction+could+not+be+saved",
    );
    expect(correctStaffClockEvent).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalledWith(
      expect.stringContaining("database"),
    );
  });
});
