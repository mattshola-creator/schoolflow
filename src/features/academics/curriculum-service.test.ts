import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireTeachingContext, from, insert, update } = vi.hoisted(() => ({
  requireTeachingContext: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));
vi.mock("./teaching-service", () => ({ requireTeachingContext }));
import {
  createCurriculumItem,
  updateCurriculumCoverage,
} from "./curriculum-service";

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

describe("curriculum service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insert.mockResolvedValue({ error: null });
    const assignmentBuilder = assignmentQuery();
    from.mockImplementation((table: string) =>
      table === "teaching_assignments" ? assignmentBuilder : { insert, update },
    );
    requireTeachingContext.mockResolvedValue({
      active: { organizationId, schoolId },
      user: { id: userId },
      supabase: { from },
    });
  });

  it("derives curriculum scope from one authorized subject assignment", async () => {
    const input = {
      sessionId: crypto.randomUUID(),
      teachingAssignmentId: crypto.randomUUID(),
      sequence: 1,
      title: "Fractions",
      plannedStart: "2026-09-01",
      plannedEnd: "2026-09-05",
    };
    await createCurriculumItem(input);
    expect(requireTeachingContext).toHaveBeenCalledWith(
      "academics.curriculum.manage",
    );
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: organizationId,
        school_id: schoolId,
        subject_id: assignment.subject_id,
        class_level_id: assignment.class_level_id,
        class_arm_id: assignment.class_arm_id,
      }),
    );
  });

  it("does not insert or retry when the assignment is unavailable", async () => {
    const query = assignmentQuery();
    query.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    from.mockImplementation((table: string) =>
      table === "teaching_assignments" ? query : { insert, update },
    );
    await expect(
      createCurriculumItem({
        sessionId: crypto.randomUUID(),
        teachingAssignmentId: crypto.randomUUID(),
        sequence: 1,
        title: "Fractions",
        plannedStart: "2026-09-01",
        plannedEnd: "2026-09-05",
      }),
    ).rejects.toThrow("The curriculum teaching assignment is unavailable");
    expect(insert).not.toHaveBeenCalled();
  });

  it("updates coverage once with verified actor and tenant scope", async () => {
    const chain = { eq: vi.fn() };
    chain.eq
      .mockReturnValueOnce(chain)
      .mockReturnValueOnce(chain)
      .mockResolvedValueOnce({ error: null });
    update.mockReturnValue(chain);
    await updateCurriculumCoverage({
      curriculumItemId: crypto.randomUUID(),
      status: "completed",
      completedOn: "2026-09-05",
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
        completed_on: "2026-09-05",
        updated_by: userId,
      }),
    );
  });
});
