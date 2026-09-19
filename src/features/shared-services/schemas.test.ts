import { describe, expect, it } from "vitest";
import {
  approvalPolicySchema,
  documentMetadataSchema,
  maxDocumentBytes,
  taskSchema,
} from "./schemas";

describe("shared-service validation", () => {
  it("accepts a scoped action task", () => {
    expect(
      taskSchema.safeParse({
        title: "Review applicant documents",
        description: "Complete before the deadline",
        priority: "high",
        ownerUserId: "",
        dueAt: "",
      }).success,
    ).toBe(true);
  });

  it("rejects ambiguous document entity references", () => {
    expect(
      documentMetadataSchema.safeParse({
        title: "Transfer letter",
        entityType: "student_profile",
        entityId: "not-a-uuid",
      }).success,
    ).toBe(false);
  });

  it("enforces stable approval keys and roles", () => {
    expect(
      approvalPolicySchema.safeParse({
        key: "finance.expense",
        name: "Expense approval",
        description: "",
        approverRoleId: "00000000-0000-4000-8000-000000000001",
      }).success,
    ).toBe(true);
    expect(
      approvalPolicySchema.safeParse({
        key: "Premium Plan",
        name: "Bad key",
        approverRoleId: "00000000-0000-4000-8000-000000000001",
      }).success,
    ).toBe(false);
  });

  it("keeps the upload limit at ten MiB", () => {
    expect(maxDocumentBytes).toBe(10_485_760);
  });
});
