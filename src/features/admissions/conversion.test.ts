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

import { AdmissionConversionError, convertAdmissionToStudent } from "./service";

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

  it("classifies context rejection without invoking the RPC", async () => {
    mocks.requireCapability.mockRejectedValueOnce(new Error("denied"));
    await expect(
      convertAdmissionToStudent({
        applicationId,
        studentNumber: "QA-STUDENT-001",
        enrolledOn: "2026-09-23",
      }),
    ).rejects.toMatchObject({
      diagnostic: {
        stage: "context_resolution",
        category: "authentication_authorization_or_context_rejected",
        rpcInvoked: false,
        rpcReturnedError: false,
      },
    } satisfies Partial<AdmissionConversionError>);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["42501", "rpc_business_rule_rejected"],
    ["22023", "rpc_business_rule_rejected"],
    ["23505", "rpc_constraint_rejected"],
    ["40001", "rpc_transaction_failed"],
    ["PGRST116", "rpc_transport_failed"],
  ])("classifies safe RPC code %s as %s", async (code, category) => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { code, message: "sensitive database message" },
    });
    await expect(
      convertAdmissionToStudent({
        applicationId,
        studentNumber: "QA-STUDENT-001",
        enrolledOn: "2026-09-23",
      }),
    ).rejects.toMatchObject({
      diagnostic: {
        stage: "rpc_response",
        category,
        rpcInvoked: true,
        rpcReturnedError: true,
        rpcCode: code,
      },
    });
    expect(mocks.rpc).toHaveBeenCalledOnce();
  });

  it("does not invent or copy an unsafe RPC code", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { code: "secret-value", message: "sensitive database message" },
    });
    let failure: unknown;
    try {
      await convertAdmissionToStudent({
        applicationId,
        studentNumber: "QA-STUDENT-001",
        enrolledOn: "2026-09-23",
      });
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(AdmissionConversionError);
    expect((failure as AdmissionConversionError).diagnostic).toEqual({
      stage: "rpc_response",
      category: "rpc_returned_error",
      rpcInvoked: true,
      rpcReturnedError: true,
    });
    expect(mocks.rpc).toHaveBeenCalledOnce();
  });

  it("classifies a thrown RPC invocation without retrying", async () => {
    mocks.rpc.mockRejectedValueOnce(new Error("network secret"));
    await expect(
      convertAdmissionToStudent({
        applicationId,
        studentNumber: "QA-STUDENT-001",
        enrolledOn: "2026-09-23",
      }),
    ).rejects.toMatchObject({
      diagnostic: {
        stage: "rpc_invocation",
        category: "rpc_invocation_failed",
        rpcInvoked: true,
        rpcReturnedError: false,
      },
    });
    expect(mocks.rpc).toHaveBeenCalledOnce();
  });
});
