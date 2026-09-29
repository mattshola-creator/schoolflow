import { beforeEach, describe, expect, it, vi } from "vitest";

const { createTimetableEntry, createTimetablePeriod, redirect } = vi.hoisted(
  () => ({
    createTimetableEntry: vi.fn(),
    createTimetablePeriod: vi.fn(),
    redirect: vi.fn((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    }),
  }),
);
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/academics/teaching-service", () => ({
  createTimetableEntry,
  createTimetablePeriod,
}));

import { saveTimetableEntry, saveTimetablePeriod } from "./actions";

describe("manual timetable actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid period before the service", async () => {
    await expect(saveTimetablePeriod(new FormData())).rejects.toThrow(
      "error=Check+the+period+details",
    );
    expect(createTimetablePeriod).not.toHaveBeenCalled();
  });

  it("does not write an unacknowledged conflict", async () => {
    createTimetableEntry.mockResolvedValueOnce({
      created: false,
      conflictKinds: ["teacher"],
    });
    const form = new FormData();
    form.set("sessionId", crypto.randomUUID());
    form.set("periodId", crypto.randomUUID());
    form.set("teachingAssignmentId", crypto.randomUUID());
    await expect(saveTimetableEntry(form)).rejects.toThrow(
      "warning=teacher+conflict+detected",
    );
    expect(createTimetableEntry).toHaveBeenCalledTimes(1);
  });

  it("keeps protected errors out of the public redirect", async () => {
    createTimetableEntry.mockRejectedValueOnce(new Error("database detail"));
    const form = new FormData();
    form.set("sessionId", crypto.randomUUID());
    form.set("periodId", crypto.randomUUID());
    form.set("teachingAssignmentId", crypto.randomUUID());
    await expect(saveTimetableEntry(form)).rejects.toThrow(
      "error=The+allocation+could+not+be+created",
    );
    expect(redirect).not.toHaveBeenCalledWith(
      expect.stringContaining("database"),
    );
  });
});
