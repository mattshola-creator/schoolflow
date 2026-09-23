import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ convert: vi.fn() }));
vi.mock("@/features/admissions/service", () => ({
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
  });

  it.each([
    "unauthenticated",
    "unauthorized",
    "cross-tenant",
    "already converted",
    "duplicate",
  ])("fails safely for %s submissions", async () => {
    mocks.convert.mockRejectedValueOnce(new Error("unavailable"));
    const result = await POST(request() as never);
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe(
      `https://schoolflow-app.netlify.app/admissions/${applicationId}?error=Enrollment+requirements+are+incomplete+or+invalid`,
    );
  });
});
