import { describe, expect, it } from "vitest";
import { buildScoreSheetRoster } from "./score-sheet-roster";

describe("buildScoreSheetRoster", () => {
  it("maps visible profiles to class members in membership order", () => {
    const roster = buildScoreSheetRoster(
      [{ student_id: "student-b" }, { student_id: "student-a" }],
      [
        {
          id: "student-a",
          student_number: "CB-002",
          people: { first_name: "Ari", last_name: "Ade" },
        },
        {
          id: "student-b",
          student_number: "CB-001",
          people: { first_name: "Bola", last_name: "Bello" },
        },
      ],
    );

    expect(roster).toEqual([
      {
        student_id: "student-b",
        student_profiles: [
          {
            student_number: "CB-001",
            people: { first_name: "Bola", last_name: "Bello" },
          },
        ],
      },
      {
        student_id: "student-a",
        student_profiles: [
          {
            student_number: "CB-002",
            people: { first_name: "Ari", last_name: "Ade" },
          },
        ],
      },
    ]);
  });

  it("omits class members whose profile is not visible", () => {
    expect(
      buildScoreSheetRoster(
        [{ student_id: "visible" }, { student_id: "hidden" }],
        [
          {
            id: "visible",
            student_number: "CB-003",
            people: { first_name: "Chidi", last_name: "Coker" },
          },
        ],
      ),
    ).toEqual([
      {
        student_id: "visible",
        student_profiles: [
          {
            student_number: "CB-003",
            people: { first_name: "Chidi", last_name: "Coker" },
          },
        ],
      },
    ]);
  });
});
