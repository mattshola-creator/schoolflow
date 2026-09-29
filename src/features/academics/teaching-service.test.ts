import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireCapability, requireUser, loadTenantContext, from, insert } =
  vi.hoisted(() => ({
    requireCapability: vi.fn(),
    requireUser: vi.fn(),
    loadTenantContext: vi.fn(),
    from: vi.fn(),
    insert: vi.fn(),
  }));

vi.mock("@/lib/authorization", () => ({ requireCapability }));
vi.mock("@/lib/auth", () => ({ requireUser }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext }));

import {
  createTeachingAssignment,
  findTimetableConflictKinds,
  requireTeachingContext,
} from "./teaching-service";

const authorization = {
  organizationId: crypto.randomUUID(),
  schoolId: crypto.randomUUID(),
};

describe("teaching management context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCapability.mockResolvedValue(authorization);
    insert.mockResolvedValue({ error: null });
    from.mockReturnValue({ insert });
    requireUser.mockResolvedValue({
      user: { id: crypto.randomUUID() },
      supabase: { from },
    });
    loadTenantContext.mockResolvedValue({
      active: {
        organizationId: authorization.organizationId,
        schoolId: authorization.schoolId,
      },
    });
  });

  it("uses the teaching-management feature instead of academic setup", async () => {
    await expect(requireTeachingContext()).resolves.toMatchObject({
      authorization,
    });
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "academics.teaching_assignments.view",
      module: "academics",
      feature: "academics.teaching_management",
    });
  });

  it("fails closed without a school-bound authorization context", async () => {
    requireCapability.mockResolvedValue({
      ...authorization,
      schoolId: null,
    });
    await expect(requireTeachingContext()).rejects.toThrow(
      "A school context is required",
    );
  });

  it("creates one tenant-bound teaching assignment", async () => {
    const input = {
      sessionId: crypto.randomUUID(),
      staffAssignmentId: crypto.randomUUID(),
      assignmentType: "subject_teacher" as const,
      subjectId: crypto.randomUUID(),
      classLevelId: crypto.randomUUID(),
      startedOn: "2026-09-01",
    };
    await createTeachingAssignment(input);
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "academics.teaching_assignments.manage",
      module: "academics",
      feature: "academics.teaching_management",
    });
    expect(from).toHaveBeenCalledWith("teaching_assignments");
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: authorization.organizationId,
        school_id: authorization.schoolId,
        session_id: input.sessionId,
        staff_assignment_id: input.staffAssignmentId,
      }),
    );
  });

  it("does not retry or expose a protected insert failure", async () => {
    insert.mockResolvedValueOnce({ error: { message: "database detail" } });
    await expect(
      createTeachingAssignment({
        sessionId: crypto.randomUUID(),
        staffAssignmentId: crypto.randomUUID(),
        assignmentType: "class_teacher",
        classLevelId: crypto.randomUUID(),
        startedOn: "2026-09-01",
      }),
    ).rejects.toThrow("Teaching assignment could not be created");
    expect(insert).toHaveBeenCalledTimes(1);
  });
});

describe("manual timetable conflict detection", () => {
  const target = {
    staff_assignment_id: "teacher-a",
    class_level_id: "level-a",
    class_arm_id: "arm-a",
  };

  it("distinguishes teacher and class conflicts", () => {
    expect(
      findTimetableConflictKinds(target, [
        { ...target, class_level_id: "level-b", class_arm_id: null },
        { ...target, staff_assignment_id: "teacher-b" },
      ]),
    ).toEqual(["teacher", "class"]);
  });

  it("returns no conflict for a different teacher and class", () => {
    expect(
      findTimetableConflictKinds(target, [
        {
          staff_assignment_id: "teacher-b",
          class_level_id: "level-b",
          class_arm_id: null,
        },
      ]),
    ).toEqual([]);
  });
});
