import { describe, expect, it } from "vitest";
import { assembleScoreSheetStudents } from "./score-sheet-roster";

describe("score sheet roster mapping", () => {
  it("joins authorized membership IDs to profile rows without an invalid embedded join", () => {
    const students = assembleScoreSheetStudents(
      [{ student_id: "student-1" }, { student_id: "student-2" }],
      [
        { id: "student-2", student_number: "CB-002", people: { first_name: "Ari", last_name: "Mensah" } },
        { id: "student-1", student_number: "CB-001", people: { first_name: "Kofi", last_name: "Boateng" } },
      ],
    );
    expect(students).toEqual([
      { student_id: "student-1", student_profiles: [{ student_number: "CB-001", people: { first_name: "Kofi", last_name: "Boateng" } }] },
      { student_id: "student-2", student_profiles: [{ student_number: "CB-002", people: { first_name: "Ari", last_name: "Mensah" } }] },
    ]);
  });

  it("excludes active memberships without a visible profile, matching the old inner-join semantics", () => {
    expect(assembleScoreSheetStudents([{ student_id: "hidden-student" }], [])).toEqual([]);
  });
});
