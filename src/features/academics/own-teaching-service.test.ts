import { beforeEach, expect, it, vi } from "vitest";
const { requireTeachingContext, from, rows, calls } = vi.hoisted(() => ({
  requireTeachingContext: vi.fn(),
  from: vi.fn(),
  rows: [] as unknown[],
  calls: [] as unknown[],
}));
vi.mock("./teaching-service", () => ({ requireTeachingContext }));
import {
  createOwnLessonPlan,
  updateOwnLessonPlan,
  submitOwnLessonPlan,
  recordOwnLessonDelivery,
  loadOwnTeachingWorkspace,
} from "./own-teaching-service";
const id = "00000000-0000-4000-8000-000000000001";
const input = {
  sessionId: id,
  academicPeriodId: id,
  teachingAssignmentId: id,
  lessonDate: "2026-10-25",
  topic: "Synthetic topic",
  objectives: "Synthetic objectives",
  contentOutline: "Synthetic outline",
};
beforeEach(() => {
  rows.length = 0;
  calls.length = 0;
  vi.clearAllMocks();
  from.mockImplementation((table) => {
    const query: Record<string, unknown> = {};
    for (const name of ["select", "eq", "insert", "update", "in"])
      query[name] = vi.fn((...args) => {
        calls.push({ table, name, args });
        return query;
      });
    query.maybeSingle = () => Promise.resolve(rows.shift());
    query.single = () => Promise.resolve(rows.shift());
    query.then = (resolve: (value: unknown) => unknown) =>
      Promise.resolve(rows.shift()).then(resolve);
    return query;
  });
  requireTeachingContext.mockResolvedValue({
    supabase: { from },
    authorization: { permissions: [], modules: [], features: [] },
    active: { organizationId: "authorized-org", schoolId: "authorized-school" },
    user: { id: "actual-actor" },
  });
});
const assignment = {
  data: {
    id,
    subject_id: "derived-subject",
    class_level_id: "derived-class",
    class_arm_id: "derived-arm",
  },
  error: null,
};
it("derives tenant, class, subject and actor from authenticated context and assignment", async () => {
  rows.push(assignment, { data: { id }, error: null });
  await createOwnLessonPlan({
    ...input,
    organization_id: "foreign",
    subject_id: "foreign",
    created_by: "forged",
  });
  expect(requireTeachingContext).toHaveBeenCalledWith("academics.teaching.own");
  expect(calls).toContainEqual(
    expect.objectContaining({
      table: "lesson_plans",
      name: "insert",
      args: [
        expect.objectContaining({
          organization_id: "authorized-org",
          school_id: "authorized-school",
          subject_id: "derived-subject",
          class_level_id: "derived-class",
          class_arm_id: "derived-arm",
          created_by: "actual-actor",
          status: "draft",
        }),
      ],
    }),
  );
});
it("denies an assignment hidden by RLS instead of inventing a scope", async () => {
  rows.push({ data: null, error: null });
  await expect(createOwnLessonPlan(input)).rejects.toThrow();
  expect(calls.some((x) => (x as { name?: string }).name === "insert")).toBe(
    false,
  );
});
it("keeps unexpected assignment lookup failures as failures", async () => {
  rows.push({ data: null, error: { code: "XX000" } });
  await expect(createOwnLessonPlan(input)).rejects.toMatchObject({
    category: "unexpected_failure",
  });
});
it("requires explicit academic period before any mutation", async () => {
  await expect(
    createOwnLessonPlan({ ...input, academicPeriodId: undefined }),
  ).rejects.toThrow();
  expect(requireTeachingContext).not.toHaveBeenCalled();
});
it("does not claim a zero-row submission succeeded", async () => {
  rows.push({ data: null, error: null });
  await expect(submitOwnLessonPlan({ id })).rejects.toThrow("not submitted");
});
it("submits only own draft using original actor", async () => {
  rows.push({ data: { id }, error: null });
  await submitOwnLessonPlan({ id });
  expect(calls).toContainEqual({
    table: "lesson_plans",
    name: "eq",
    args: ["created_by", "actual-actor"],
  });
  expect(calls).toContainEqual({
    table: "lesson_plans",
    name: "eq",
    args: ["status", "draft"],
  });
});
it("rejects non-recording delivery states before access", async () => {
  await expect(
    recordOwnLessonDelivery({
      ...input,
      deliveredOn: "2026-10-25",
      coverageNotes: "Synthetic notes",
      status: "cancelled",
    }),
  ).rejects.toThrow();
  expect(requireTeachingContext).not.toHaveBeenCalled();
});
it("propagates workspace database errors rather than empty acceptance", async () => {
  rows.push(
    { data: [], error: { code: "XX000" } },
    ...Array.from({ length: 4 }, () => ({ data: [], error: null })),
  );
  await expect(loadOwnTeachingWorkspace()).rejects.toMatchObject({
    category: "unexpected_failure",
  });
});

it("edits only own draft contents, leaving assignment and academic scope immutable", async () => {
  rows.push(assignment, { data: { id }, error: null });
  await updateOwnLessonPlan({ ...input, id, created_by: "forged" });
  expect(calls).toContainEqual({
    table: "lesson_plans",
    name: "eq",
    args: ["created_by", "actual-actor"],
  });
  expect(calls).toContainEqual({
    table: "lesson_plans",
    name: "eq",
    args: ["academic_period_id", id],
  });
  const update = calls.find(
    (x) => (x as { name: string }).name === "update",
  ) as { args: Record<string, unknown>[] };
  expect(update.args[0]).not.toHaveProperty("teaching_assignment_id");
  expect(update.args[0]).not.toHaveProperty("academic_period_id");
  expect(update.args[0].updated_by).toBe("actual-actor");
});
it("does not claim a missing or submitted draft was edited", async () => {
  rows.push(assignment, { data: null, error: null });
  await expect(updateOwnLessonPlan({ ...input, id })).rejects.toThrow(
    "not saved",
  );
});
it("denies expired or revoked capability before loading workspace data", async () => {
  requireTeachingContext.mockRejectedValueOnce(new Error("permission denied"));
  await expect(loadOwnTeachingWorkspace()).rejects.toThrow("permission denied");
  expect(from).not.toHaveBeenCalled();
});
it("loads only assignment-referenced metadata and canonical own identity", async () => {
  rows.push(
    { data: [{ ...assignment.data, session_id: id }], error: null },
    ...Array.from({ length: 9 }, () => ({ data: [], error: null })),
    { data: { person_id: id }, error: null },
    { data: { first_name: "Pilot", last_name: "Teacher" }, error: null },
  );
  const w = await loadOwnTeachingWorkspace();
  expect(w.teacherName).toBe("Pilot Teacher");
  expect(calls).toContainEqual({
    table: "academic_sessions",
    name: "in",
    args: ["id", [id]],
  });
  expect(calls).toContainEqual({
    table: "profiles",
    name: "eq",
    args: ["id", "actual-actor"],
  });
});
