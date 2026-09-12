import { describe, expect, it } from "vitest";
import { loginSchema, onboardingSchema, passwordSchema } from "./schemas";
describe("identity validation", () => {
  it("normalizes a valid login email", () => {
    expect(
      loginSchema.parse({
        email: " Admin@Example.COM ",
        password: "password123",
      }).email,
    ).toBe("admin@example.com");
  });
  it("rejects mismatched passwords", () => {
    expect(
      passwordSchema.safeParse({
        password: "long-password",
        confirmPassword: "other-password",
      }).success,
    ).toBe(false);
  });
  it("normalizes tenant identifiers", () => {
    const result = onboardingSchema.parse({
      organizationName: " School Group ",
      organizationSlug: "school-group",
      locationName: " Lagos ",
      schoolName: " Primary A ",
      schoolCode: "pra_1",
    });
    expect(result.schoolCode).toBe("PRA_1");
    expect(result.organizationName).toBe("School Group");
  });
});
