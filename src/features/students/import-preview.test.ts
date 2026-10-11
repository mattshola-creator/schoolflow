import { describe, expect, it } from "vitest";
import { parseCsv, previewStudentImport } from "./import-preview";
import { studentSchema } from "./schemas";

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

  it("keeps guardian-free rows preview-only while operational creation requires a primary guardian", () => {
    const [row] = previewStudentImport(
      "first_name,last_name,date_of_birth,student_number\nAda,Okafor,2014-02-03,SF-001",
    );

    expect(row).toMatchObject({ status: "valid" });
    expect(
      studentSchema.safeParse({
        firstName: "Ada",
        lastName: "Okafor",
        studentNumber: "SF-001",
        dateOfBirth: "2014-02-03",
        gender: "Female",
        sessionId: "11111111-1111-4111-8111-111111111111",
        levelId: "22222222-2222-4222-8222-222222222222",
        armId: "",
        enrollmentDate: "2026-09-01",
        guardianFirstName: "",
        guardianLastName: "",
        guardianRelationship: "",
      }).success,
    ).toBe(false);
  });
});
