import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUser: async () => ({
    user: { id: "user-1" },
    supabase: { rpc: mocks.rpc, from: mocks.from },
  }),
}));

import { loadPortalMessages } from "./service";

describe("loadPortalMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("limits thread reads to portal_context learners and returns ordered messages", async () => {
    mocks.rpc.mockResolvedValue({
      data: [
        {
          schoolId: "school-1",
          learners: [{ studentId: "learner-1" }],
        },
      ],
      error: null,
    });
    const threadOrder = vi.fn().mockResolvedValue({
      data: [
        {
          id: "thread-1",
          subject: "Attendance follow-up",
          status: "open",
          student_id: "learner-1",
          school_id: "school-1",
          updated_at: "2026-10-14T10:00:00Z",
        },
      ],
      error: null,
    });
    const studentFilter = vi.fn(() => ({
      in: vi.fn(() => ({ order: threadOrder })),
    }));
    const threadIdFilter = vi.fn(() => ({
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "message-1",
            thread_id: "thread-1",
            sender_user_id: "user-1",
            body: "Thank you.",
            sent_at: "2026-10-14T10:01:00Z",
            status: "sent",
          },
        ],
        error: null,
      }),
    }));
    mocks.from
      .mockImplementationOnce(() => ({ select: () => ({ in: studentFilter }) }))
      .mockImplementationOnce(() => ({
        select: () => ({ in: threadIdFilter }),
      }));

    const result = await loadPortalMessages();

    expect(mocks.rpc).toHaveBeenCalledWith("portal_context");
    expect(studentFilter).toHaveBeenCalledWith("student_id", ["learner-1"]);
    expect(studentFilter.mock.results[0]?.value.in).toHaveBeenCalledWith(
      "school_id",
      ["school-1"],
    );
    expect(threadIdFilter).toHaveBeenCalledWith("thread_id", ["thread-1"]);
    expect(result).toEqual({
      userId: "user-1",
      threads: [
        {
          id: "thread-1",
          threadId: "thread-1",
          subject: "Attendance follow-up",
          status: "open",
          studentId: "learner-1",
          schoolId: "school-1",
          updatedAt: "2026-10-14T10:00:00Z",
          messages: [
            {
              id: "message-1",
              senderUserId: "user-1",
              body: "Thank you.",
              sentAt: "2026-10-14T10:01:00Z",
              status: "sent",
            },
          ],
        },
      ],
    });
  });

  it("does not query message tables when no linked learner is available", async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null });
    await expect(loadPortalMessages()).resolves.toEqual({
      userId: "user-1",
      threads: [],
    });
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
