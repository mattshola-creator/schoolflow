import { describe, expect, it } from "vitest";
import { teacherWorkAreas, scoreSheetSummary } from "./model";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
const teacher: AuthorizationSnapshot = {
  organizationId: "org",
  schoolId: "school",
  permissions: [
    "academics.view",
    "academics.scores.view",
    "academics.scores.enter",
    "academics.scores.submit",
    "students.view",
  ],
  modules: [{ key: "academics", enabled: true, entitled: true }],
  features: [
    { key: "academics.score_entry", module: "academics", enabled: true },
  ],
};
describe("Teacher presentation boundary", () => {
  it("offers only Assessment to the existing restricted Teacher", () => {
    expect(teacherWorkAreas(teacher).map((a) => a.href)).toEqual([
      "/assessments",
    ]);
  });
  it("never derives entitlement or permissions from a visual workspace", () => {
    expect(teacherWorkAreas({ ...teacher, permissions: [] })).toEqual([]);
    expect(teacherWorkAreas({ ...teacher, modules: [] })).toEqual([]);
    expect(teacherWorkAreas({ ...teacher, features: [] })).toEqual([]);
  });
  it("counts only the supplied permission-filtered list and preserves version semantics", () => {
    expect(
      scoreSheetSummary([
        {
          status: "submitted",
          class_level_id: "class",
          class_arm_id: "arm",
          subject_id: "subject",
        },
        {
          status: "reopened",
          class_level_id: "class",
          class_arm_id: "arm",
          subject_id: "subject",
        },
        {
          status: "draft",
          class_level_id: "class",
          class_arm_id: "other",
          subject_id: "other",
        },
      ]),
    ).toEqual({ classes: 2, subjects: 2, drafts: 2, submitted: 1 });
  });
  it("does not infer work from an empty list", () => {
    expect(scoreSheetSummary([])).toEqual({
      classes: 0,
      subjects: 0,
      drafts: 0,
      submitted: 0,
    });
  });
});
