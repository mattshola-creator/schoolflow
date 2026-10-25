import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireTeachingContext, from, insert, update } = vi.hoisted(() => ({
  requireTeachingContext: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));
vi.mock("./teaching-service", () => ({ requireTeachingContext }));
import {
  createHomeworkAssignment,
  createLessonDelivery,
  createLessonPlan,
  updateLessonPlanStatus,
} from "./lesson-service";

const organizationId = crypto.randomUUID();
const schoolId = crypto.randomUUID();
const userId = crypto.randomUUID();
const assignment = {
  subject_id: crypto.randomUUID(),
  class_level_id: crypto.randomUUID(),
  class_arm_id: crypto.randomUUID(),
};

function assignmentQuery() {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    maybeSingle: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({ data: assignment, error: null });
  return query;
}

describe("lesson service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insert.mockResolvedValue({ error: null });
    from.mockImplementation((table: string) =>
      table === "teaching_assignments" ? assignmentQuery() : { insert, update },
    );
    requireTeachingContext.mockResolvedValue({
      active: { organizationId, schoolId },
      user: { id: userId },
      supabase: { from },
    });
  });

  it("derives lesson-plan scope from the authorized assignment", async () => {
    await createLessonPlan({
      sessionId: crypto.randomUUID(),
      teachingAssignmentId: crypto.randomUUID(),
      lessonDate: "2026-09-29",
      topic: "Fractions",
      objectives: "Compare fractions.",
      contentOutline: "Use halves and quarters.",
    });
    expect(requireTeachingContext).toHaveBeenCalledWith(
      "academics.lesson_plans.manage",
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: organizationId,
        school_id: schoolId,
        subject_id: assignment.subject_id,
        class_level_id: assignment.class_level_id,
      }),
    );
  });

  it("requires approval permission for approved status", async () => {
    const chain = { eq: vi.fn() };
    chain.eq
      .mockReturnValueOnce(chain)
      .mockReturnValueOnce(chain)
      .mockResolvedValueOnce({ error: null });
    update.mockReturnValue(chain);
    await updateLessonPlanStatus({
      lessonPlanId: crypto.randomUUID(),
      status: "approved",
    });
    expect(requireTeachingContext).toHaveBeenCalledWith(
      "academics.lesson_plans.approve",
    );
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("records delivery once without requiring a lesson plan", async () => {
    await createLessonDelivery({
      sessionId: crypto.randomUUID(),
      teachingAssignmentId: crypto.randomUUID(),
      deliveredOn: "2026-09-29",
      topic: "Fractions",
      coverageNotes: "Compared halves and quarters.",
      status: "delivered",
    });
    expect(requireTeachingContext).toHaveBeenCalledWith(
      "academics.lesson_delivery.record",
    );
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ lesson_plan_id: null }),
    );
  });

  it("derives standalone homework scope from the authorized assignment", async () => {
    await createHomeworkAssignment({
      sessionId: crypto.randomUUID(),
      teachingAssignmentId: crypto.randomUUID(),
      title: "Fractions practice",
      instructions: "Complete questions one to five.",
      assignedOn: "2026-09-29",
      dueOn: "2026-09-30",
    });
    expect(requireTeachingContext).toHaveBeenCalledWith(
      "academics.homework.manage",
    );
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: organizationId,
        school_id: schoolId,
        lesson_delivery_id: null,
        subject_id: assignment.subject_id,
      }),
    );
  });
});

describe("lesson workspace authorization fallback", () => {
  it("does not retry or hide an unexpected authentication/data failure", async () => {
    vi.clearAllMocks();
    const error = new Error("Source unavailable");
    requireTeachingContext.mockRejectedValue(error);
    const { loadLessonWorkspace } = await import("./lesson-service");
    await expect(loadLessonWorkspace()).rejects.toBe(error);
    expect(requireTeachingContext).toHaveBeenCalledTimes(1);
    expect(from).not.toHaveBeenCalled();
  });
  it("tries the existing permission alternatives and returns a typed denial", async () => {
    vi.clearAllMocks();
    const { AuthorizationError } = await import("@/lib/authorization");
    requireTeachingContext.mockRejectedValue(
      new AuthorizationError("permission_denied"),
    );
    const { loadLessonWorkspace } = await import("./lesson-service");
    await expect(loadLessonWorkspace()).rejects.toBeInstanceOf(
      AuthorizationError,
    );
    expect(requireTeachingContext).toHaveBeenCalledTimes(4);
    expect(from).not.toHaveBeenCalled();
  });
});
