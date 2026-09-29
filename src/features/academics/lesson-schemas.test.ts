import { describe, expect, it } from "vitest";
import {
  lessonDeliverySchema,
  lessonPlanReviewSchema,
  lessonPlanSchema,
} from "./lesson-schemas";

const id = "11111111-1111-4111-8111-111111111111";

describe("lesson schemas", () => {
  it("accepts a scoped lesson plan without requiring a curriculum link", () => {
    expect(
      lessonPlanSchema.parse({
        sessionId: id,
        teachingAssignmentId: id,
        curriculumItemId: "",
        lessonDate: "2026-09-29",
        topic: "Fractions",
        objectives: "Compare simple fractions.",
        contentOutline: "Introduce equal parts and compare worked examples.",
      }).curriculumItemId,
    ).toBeUndefined();
  });

  it("requires a reason when a lesson plan is rejected", () => {
    expect(() =>
      lessonPlanReviewSchema.parse({ lessonPlanId: id, status: "rejected" }),
    ).toThrow("requires a review comment");
  });

  it("keeps delivery independent from an optional lesson plan", () => {
    const result = lessonDeliverySchema.parse({
      sessionId: id,
      teachingAssignmentId: id,
      lessonPlanId: "",
      curriculumItemId: "",
      deliveredOn: "2026-09-29",
      topic: "Fractions",
      coverageNotes: "Covered comparison of halves and quarters.",
      status: "delivered",
    });
    expect(result.lessonPlanId).toBeUndefined();
    expect(result.curriculumItemId).toBeUndefined();
  });

  it("rejects invalid delivery status", () => {
    expect(() =>
      lessonDeliverySchema.parse({
        sessionId: id,
        teachingAssignmentId: id,
        deliveredOn: "2026-09-29",
        topic: "Fractions",
        coverageNotes: "Covered comparison of halves and quarters.",
        status: "complete",
      }),
    ).toThrow();
  });
});
