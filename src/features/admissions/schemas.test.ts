import { describe, expect, it } from "vitest";
import {
  admissionApplicationSchema,
  allowedAdmissionTransitions,
  assessmentSchema,
} from "./schemas";

const validApplication = {
  applicationNumber: "APP-2026-001",
  firstName: "Ada",
  lastName: "Okafor",
  dateOfBirth: "2018-04-10",
  gender: "Female",
  source: "staff",
  sessionId: "11111111-1111-4111-8111-111111111111",
  levelId: "22222222-2222-4222-8222-222222222222",
};

describe("admissions schemas", () => {
  it("accepts a valid staff application", () => {
    expect(admissionApplicationSchema.safeParse(validApplication).success).toBe(
      true,
    );
  });

  it("requires complete guardian identity when partially supplied", () => {
    const result = admissionApplicationSchema.safeParse({
      ...validApplication,
      guardianFirstName: "Ngozi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects impossible assessment scores", () => {
    const result = assessmentSchema.safeParse({
      applicationId: "33333333-3333-4333-8333-333333333333",
      scheduledAt: "2026-09-22T10:00",
      score: "81",
      maximumScore: "80",
    });
    expect(result.success).toBe(false);
  });

  it("keeps approved separate from offer and enrollment", () => {
    expect(allowedAdmissionTransitions("approved")).toEqual([
      "admission_offered",
    ]);
    expect(allowedAdmissionTransitions("accepted")).toEqual([
      "enrollment_pending",
    ]);
    expect(allowedAdmissionTransitions("enrolled")).toEqual([]);
  });
});
