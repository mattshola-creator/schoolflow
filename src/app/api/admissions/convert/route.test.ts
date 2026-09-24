import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  convert: vi.fn(),
  consoleError: vi.fn(),
}));
vi.mock("@/features/admissions/service", () => ({
  AdmissionConversionError: class AdmissionConversionError extends Error {
    constructor(public readonly diagnostic: Record<string, unknown>) {
      super("Application is unavailable for enrollment");
    }
  },
  convertAdmissionToStudent: mocks.convert,
}));

import { hasValidConversionOrigin, POST } from "./route";

const endpoint = "https://schoolflow-app.netlify.app/api/admissions/convert";
const applicationId = "33333333-3333-4333-8333-333333333333";
const studentId = "44444444-4444-4444-8444-444444444444";

function request(
  values: Record<string, string> = {
    applicationId,
    studentNumber: "QA-STUDENT-001",
    enrolledOn: "2026-09-23",
  },
  origin = "https://schoolflow-app.netlify.app",
) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return new Request(endpoint, {
    method: "POST",
    headers: { origin },
    body: formData,
  });
}

describe("POST /api/admissions/convert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convert.mockResolvedValue(studentId);
    vi.spyOn(console, "error").mockImplementation(mocks.consoleError);
  });

  it("accepts same-origin requests and rejects missing or foreign origins", async () => {
    expect(hasValidConversionOrigin(request())).toBe(true);
    expect(
      hasValidConversionOrigin(new Request(endpoint, { method: "POST" })),
    ).toBe(false);
    const result = await POST(
      request(undefined, "https://evil.example") as never,
    );
    expect(result.status).toBe(403);
    expect(mocks.convert).not.toHaveBeenCalled();
    expect(mocks.consoleError).toHaveBeenCalledWith(
      expect.stringContaining('"category":"origin_rejected"'),
    );
  });

  it("accepts the forwarded public origin used by Netlify", () => {
    const request = new Request("https://internal.netlify/convert", {
      headers: {
        origin: "https://schoolflow-app.netlify.app",
        "x-forwarded-host": "schoolflow-app.netlify.app",
        "x-forwarded-proto": "https",
      },
    });

    expect(hasValidConversionOrigin(request)).toBe(true);
  });

  it("uses the atomic conversion service and redirects to Student 360 with HTTP 303", async () => {
    const result = await POST(request() as never);
    expect(mocks.convert).toHaveBeenCalledWith({
      applicationId,
      studentNumber: "QA-STUDENT-001",
      enrolledOn: "2026-09-23",
    });
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe(
      `https://schoolflow-app.netlify.app/students/${studentId}?message=Applicant+enrolled`,
    );
  });

  it("rejects invalid inputs before conversion", async () => {
    const result = await POST(
      request({
        applicationId,
        studentNumber: "?",
        enrolledOn: "bad",
      }) as never,
    );
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe(
      `https://schoolflow-app.netlify.app/admissions/${applicationId}?error=Check+the+enrollment+details`,
    );
    expect(mocks.convert).not.toHaveBeenCalled();
    expect(mocks.consoleError).toHaveBeenCalledWith(
      expect.stringContaining('"category":"input_validation_failed"'),
    );
  });

  it("logs a sanitized typed service failure and preserves the safe redirect", async () => {
    const { AdmissionConversionError } =
      await import("@/features/admissions/service");
    mocks.convert.mockRejectedValueOnce(
      new AdmissionConversionError({
        stage: "rpc_response",
        category: "rpc_business_rule_rejected",
        rpcInvoked: true,
        rpcReturnedError: true,
        rpcCode: "22023",
      }),
    );
    const result = await POST(request() as never);
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe(
      `https://schoolflow-app.netlify.app/admissions/${applicationId}?error=Enrollment+requirements+are+incomplete+or+invalid`,
    );
    expect(mocks.convert).toHaveBeenCalledOnce();
    const serialized = String(mocks.consoleError.mock.calls[0]?.[0]);
    expect(JSON.parse(serialized)).toMatchObject({
      event: "admission_conversion_failed",
      operation: "admissions_conversion",
      correlationId: expect.any(String),
      occurredAt: expect.any(String),
      stage: "rpc_response",
      category: "rpc_business_rule_rejected",
      rpcInvoked: true,
      rpcReturnedError: true,
      rpcCode: "22023",
    });
    expect(serialized).not.toContain(applicationId);
    expect(serialized).not.toContain("QA-STUDENT-001");
    expect(serialized).not.toContain("2026-09-23");
  });

  it("does not invent an RPC code for an unexpected service failure", async () => {
    mocks.convert.mockRejectedValueOnce(new Error("raw database secret"));
    await POST(request() as never);
    const log = JSON.parse(String(mocks.consoleError.mock.calls[0]?.[0]));
    expect(log).toMatchObject({
      stage: "service",
      category: "unexpected_service_failure",
      rpcInvoked: false,
      rpcReturnedError: false,
    });
    expect(log).not.toHaveProperty("rpcCode");
    expect(JSON.stringify(log)).not.toContain("raw database secret");
  });

  it("does not retry conversion when protected logging fails", async () => {
    mocks.convert.mockRejectedValueOnce(new Error("unavailable"));
    mocks.consoleError.mockImplementationOnce(() => {
      throw new Error("logging unavailable");
    });
    const result = await POST(request() as never);
    expect(result.status).toBe(303);
    expect(mocks.convert).toHaveBeenCalledOnce();
  });
});
