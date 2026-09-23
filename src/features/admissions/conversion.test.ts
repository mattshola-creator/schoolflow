import { beforeEach, describe, expect, it, vi } from "vitest";

const organizationId = "11111111-1111-4111-8111-111111111111";
const schoolId = "22222222-2222-4222-8222-222222222222";
const applicationId = "33333333-3333-4333-8333-333333333333";
const studentId = "44444444-4444-4444-8444-444444444444";

const mocks = vi.hoisted(() => ({
  requireCapability: vi.fn(),
  requireUser: vi.fn(),
  loadTenantContext: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/authorization", () => ({
  requireCapability: mocks.requireCapability,
}));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/tenant-context", () => ({
  loadTenantContext: mocks.loadTenantContext,
}));

import { convertAdmissionToStudent } from "./service";

describe("convertAdmissionToStudent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCapability.mockResolvedValue({ organizationId, schoolId });
    mocks.loadTenantContext.mockResolvedValue({
      active: { organizationId, schoolId },
    });
    mocks.rpc.mockResolvedValue({ data: studentId, error: null });
    mocks.requireUser.mockResolvedValue({ supabase: { rpc: mocks.rpc } });
  });

  it("preserves the caller-bound atomic conversion RPC", async () => {
    const result = await convertAdmissionToStudent({
      applicationId,
      studentNumber: "QA-STUDENT-001",
      enrolledOn: "2026-09-23",
    });
    expect(result).toBe(studentId);
    expect(mocks.requireCapability).toHaveBeenCalledWith({
      permission: "admissions.enroll",
      module: "admissions",
      feature: "admissions.application_workflow",
    });
    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("convert_admission_to_student", {
      target_application_id: applicationId,
      target_student_number: "QA-STUDENT-001",
      enrollment_date: "2026-09-23",
    });
  });

  it("propagates authorization, readiness, and duplicate denial safely", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: new Error("denied") });
    await expect(
      convertAdmissionToStudent({
        applicationId,
        studentNumber: "QA-STUDENT-001",
        enrolledOn: "2026-09-23",
      }),
    ).rejects.toThrow("Application is unavailable for enrollment");
  });
});
