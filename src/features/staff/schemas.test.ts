import { describe, expect, it } from "vitest";
import {
  departmentSchema,
  endEmploymentSchema,
  positionSchema,
  staffSchema,
  transferAssignmentSchema,
} from "./schemas";

const ids = {
  positionId: "10000000-0000-4000-8000-000000000001",
  userId: "10000000-0000-4000-8000-000000000002",
  roleId: "10000000-0000-4000-8000-000000000003",
};

describe("staff validation", () => {
  it("normalizes optional setup fields", () => {
    expect(
      departmentSchema.parse({ name: " Administration ", code: "" }),
    ).toEqual({ name: "Administration", code: null });
    expect(
      positionSchema.parse({
        name: "Teacher",
        code: "TEACHER",
        departmentId: "",
        isTeaching: "on",
      }),
    ).toMatchObject({ departmentId: null, isTeaching: true });
  });

  it("accepts a complete unlinked staff record", () => {
    expect(
      staffSchema.parse({
        firstName: "Ada",
        lastName: "Okafor",
        staffNumber: "SF/STAFF/001",
        workEmail: "ada@example.com",
        phone: "08012345678",
        employmentType: "permanent",
        startedOn: "2026-09-14",
        departmentId: "",
        positionId: ids.positionId,
        linkedUserId: "",
        linkedRoleId: "",
      }),
    ).toMatchObject({ linkedUserId: null, linkedRoleId: null });
  });

  it("rejects a partial access link", () => {
    const result = staffSchema.safeParse({
      firstName: "Ada",
      lastName: "Okafor",
      staffNumber: "SF-001",
      workEmail: "",
      phone: "",
      employmentType: "contract",
      startedOn: "2026-09-14",
      departmentId: "",
      positionId: ids.positionId,
      linkedUserId: ids.userId,
      linkedRoleId: "",
    });
    expect(result.success).toBe(false);
  });

  it("requires a valid effective employment exit", () => {
    expect(
      endEmploymentSchema.safeParse({
        employmentId: ids.positionId,
        endedOn: "",
        reason: "x",
      }).success,
    ).toBe(false);
  });

  it("requires a scoped transfer destination", () => {
    expect(
      transferAssignmentSchema.safeParse({
        assignmentId: ids.positionId,
        schoolId: ids.userId,
        departmentId: "",
        positionId: ids.roleId,
        startedOn: "2026-09-15",
      }).success,
    ).toBe(true);
  });
});
