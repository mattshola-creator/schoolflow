import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  capability: vi.fn(),
  user: vi.fn(),
  context: vi.fn(),
  read: vi.fn(),
  insert: vi.fn(),
  eq: vi.fn(),
  from: vi.fn(),
}));
vi.mock("@/lib/authorization", () => ({
  requireCapability: mocks.capability,
  AuthorizationError: class extends Error {
    constructor(reason: string) {
      super(reason);
    }
  },
}));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext: mocks.context }));
import { createResultBatch, loadScoreSheet } from "./service";
const input = {
  sessionId: "session",
  periodId: "period",
  classLevelId: "class",
  classArmId: "blue",
  subjectId: "english",
  schemeId: "scheme",
  teachingAssignmentId: "assignment",
};
beforeEach(() => {
  vi.resetAllMocks();
  const chain = {
    select: () => chain,
    eq: mocks.eq,
    maybeSingle: mocks.read,
    insert: mocks.insert,
  };
  mocks.eq.mockReturnValue(chain);
  mocks.from.mockReturnValue(chain);
  mocks.capability.mockResolvedValue({
    organizationId: "org",
    schoolId: "school",
  });
  mocks.user.mockResolvedValue({
    supabase: { from: mocks.from },
    user: { id: "teacher" },
  });
  mocks.context.mockResolvedValue({
    active: { organizationId: "org", schoolId: "school" },
  });
  mocks.insert.mockResolvedValue({ error: null });
});
it("treats an RLS-hidden batch as record-free denial without querying its roster", async () => {
  mocks.read.mockResolvedValue({ data: null, error: null });
  await expect(loadScoreSheet("foreign")).rejects.toThrow("permission_denied");
  expect(mocks.from).toHaveBeenCalledTimes(1);
  expect(mocks.eq).toHaveBeenCalledWith("organization_id", "org");
  expect(mocks.eq).toHaveBeenCalledWith("school_id", "school");
});
it("preserves unexpected query failures", async () => {
  mocks.read.mockResolvedValue({ data: null, error: { code: "XX000" } });
  await expect(loadScoreSheet("batch")).rejects.toThrow(
    "Score sheet could not be loaded",
  );
});
it.each([
  {
    assignment_type: "subject_teacher",
    subject_id: "math",
    class_arm_id: "blue",
  },
  {
    assignment_type: "subject_teacher",
    subject_id: "english",
    class_arm_id: "red",
  },
  null,
])(
  "rejects missing or mismatched assignment before batch insertion",
  async (assignment) => {
    mocks.read.mockResolvedValue({ data: assignment, error: null });
    await expect(createResultBatch(input)).rejects.toThrow("permission_denied");
    expect(mocks.insert).not.toHaveBeenCalled();
  },
);
it("preserves the authorized assignment linkage in the batch", async () => {
  mocks.read.mockResolvedValue({
    data: {
      id: "assignment",
      assignment_type: "subject_teacher",
      subject_id: "english",
      class_arm_id: "blue",
    },
    error: null,
  });
  await createResultBatch(input);
  expect(mocks.eq).toHaveBeenCalledWith("session_id", "session");
  expect(mocks.eq).toHaveBeenCalledWith("class_level_id", "class");
  expect(mocks.insert).toHaveBeenCalledWith(
    expect.objectContaining({
      organization_id: "org",
      school_id: "school",
      teaching_assignment_id: "assignment",
    }),
  );
});
