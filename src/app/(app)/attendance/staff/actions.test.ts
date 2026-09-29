import { beforeEach, describe, expect, it, vi } from "vitest";

const { recordStaffClockEvent, redirect, revalidatePath } = vi.hoisted(() => ({
  recordStaffClockEvent: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
  revalidatePath: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/features/attendance/service", () => ({ recordStaffClockEvent }));

import { recordStaffClock } from "./actions";

function validForm() {
  const form = new FormData();
  form.set("staffAssignmentId", crypto.randomUUID());
  form.set("eventType", "clock_in");
  form.set("idempotencyKey", crypto.randomUUID());
  return form;
}

describe("staff clock action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
