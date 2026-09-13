import { describe, expect, it } from "vitest";
import { studentSchema } from "./schemas";

const valid = {
  firstName: "Ada",
  lastName: "Okafor",
  studentNumber: "SF-001",
  dateOfBirth: "2014-02-03",
  gender: "Female",
  sessionId: "11111111-1111-4111-8111-111111111111",
  levelId: "22222222-2222-4222-8222-222222222222",
  armId: "",
  enrolledOn: "2026-09-01",
  guardianFirstName: "",
  guardianLastName: "",
  guardianRelationship: "",
  guardianPrimary: "on",
  guardianFinancial: "on",
};

describe("student schema", () => {
  it("normalizes optional fields", () => {
    expect(studentSchema.parse(valid)).toMatchObject({
      armId: null,
      gender: "Female",
    });
  });

  it("rejects malformed student numbers and future-independent invalid dates", () => {
    expect(
      studentSchema.safeParse({ ...valid, studentNumber: "bad number" })
        .success,
    ).toBe(false);
    expect(
      studentSchema.safeParse({ ...valid, dateOfBirth: "not-a-date" }).success,
    ).toBe(false);
  });
});
