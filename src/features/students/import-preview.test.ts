import { describe, expect, it } from "vitest";
import { parseCsv, previewStudentImport } from "./import-preview";

describe("student import preview", () => {
  it("parses quoted values and validates a complete row", () => {
    expect(parseCsv('name,note\nAda,"Parent, called"')).toEqual([
      ["name", "note"],
      ["Ada", "Parent, called"],
    ]);
    expect(
      previewStudentImport(
        "first_name,last_name,date_of_birth,student_number\nAda,Okafor,2014-02-03,SF-001",
      )[0]?.status,
    ).toBe("valid");
  });

  it("warns on an exact student-number duplicate without merging", () => {
    const rows = previewStudentImport(
      "first_name,last_name,date_of_birth,student_number\nAda,Okafor,2014-02-03,SF-001",
      new Set(["SF-001"]),
    );
    expect(rows[0]).toMatchObject({ status: "warning" });
    expect(rows[0]?.messages[0]).toContain("possible duplicate");
  });

  it("rejects incomplete guardian data and missing required headers", () => {
    expect(
      previewStudentImport(
        "first_name,last_name,date_of_birth,student_number,guardian_first_name\nAda,Okafor,2014-02-03,SF-001,Ifeoma",
      )[0]?.status,
    ).toBe("invalid");
    expect(() =>
      previewStudentImport("first_name,last_name\nAda,Okafor"),
    ).toThrow("Missing required headers");
  });
});
