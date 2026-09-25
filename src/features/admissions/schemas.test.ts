import { describe, expect, it } from "vitest";
import {
  admissionApplicationSchema,
  allowedAdmissionTransitions,
  assessmentSchema,
  offerResponseSchema,
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
  guardianFirstName: "Ngozi",
  guardianLastName: "Okafor",
  guardianRelationship: "Mother",
};

describe("admissions schemas", () => {
  it("accepts a valid staff application", () => {
    expect(admissionApplicationSchema.safeParse(validApplication).success).toBe(
      true,
    );
  });

  it("requires a supported gender and a complete primary guardian", () => {
    expect(
      admissionApplicationSchema.safeParse({
        ...validApplication,
        gender: "",
      }).success,
    ).toBe(false);
    expect(
      admissionApplicationSchema.safeParse({
        ...validApplication,
        gender: "Not specified",
      }).success,
    ).toBe(false);
    expect(
      admissionApplicationSchema.safeParse({
        ...validApplication,
        guardianFirstName: "",
      }).success,
    ).toBe(false);
    expect(
      admissionApplicationSchema.safeParse({
        ...validApplication,
        guardianLastName: "",
      }).success,
    ).toBe(false);
    expect(
      admissionApplicationSchema.safeParse({
        ...validApplication,
        guardianRelationship: "",
      }).success,
    ).toBe(false);
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

  it("requires an explicit supported offer response", () => {
    const applicationId = "33333333-3333-4333-8333-333333333333";

    expect(
      offerResponseSchema.safeParse({ applicationId, response: "accept" })
        .success,
    ).toBe(true);
    expect(
      offerResponseSchema.safeParse({ applicationId, response: "decline" })
        .success,
    ).toBe(true);
    expect(offerResponseSchema.safeParse({ applicationId }).success).toBe(
      false,
    );
    expect(
      offerResponseSchema.safeParse({ applicationId, response: "accepted" })
        .success,
    ).toBe(false);
  });
});
