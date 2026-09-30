import { describe, expect, it } from "vitest";
import {
  homeworkAssignmentSchema,
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

  it("accepts standalone homework without a lesson link", () => {
    const result = homeworkAssignmentSchema.parse({
      sessionId: id,
      teachingAssignmentId: id,
      lessonDeliveryId: "",
      title: "Fractions practice",
      instructions: "Complete questions one to five.",
      assignedOn: "2026-09-29",
      dueOn: "2026-09-30",
    });
    expect(result.lessonDeliveryId).toBeUndefined();
  });

  it("rejects homework due before it is assigned", () => {
    expect(() =>
      homeworkAssignmentSchema.parse({
        sessionId: id,
        teachingAssignmentId: id,
        title: "Fractions practice",
        instructions: "Complete questions one to five.",
        assignedOn: "2026-09-30",
        dueOn: "2026-09-29",
      }),
    ).toThrow("due date");
  });
});
