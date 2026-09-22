import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  configure: vi.fn(),
  initialize: vi.fn(),
  submit: vi.fn(),
  review: vi.fn(),
}));
vi.mock("@/features/admissions/service", () => ({
  configureAdmissionDocumentPolicy: mocks.configure,
  initializeAdmissionDocumentRequirements: mocks.initialize,
  submitAdmissionDocument: mocks.submit,
  reviewAdmissionDocument: mocks.review,
}));

import { hasValidAdmissionDocumentOrigin, POST } from "./route";

const endpoint = "https://schoolflow-app.netlify.app/api/admissions/documents";
const applicationId = "33333333-3333-4333-8333-333333333333";
const requirementId = "44444444-4444-4444-8444-444444444444";
const documentId = "55555555-5555-4555-8555-555555555555";

function request(
  entries: Record<string, string>,
  origin = "https://schoolflow-app.netlify.app",
) {
  const formData = new FormData();
  Object.entries(entries).forEach(([key, value]) => formData.set(key, value));
  return new Request(endpoint, {
    method: "POST",
    headers: { origin },
    body: formData,
  });
}

describe("POST /api/admissions/documents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects missing and foreign origins", async () => {
    expect(
      hasValidAdmissionDocumentOrigin(request({ operation: "initialize" })),
    ).toBe(true);
    expect(
      hasValidAdmissionDocumentOrigin(
        new Request(endpoint, { method: "POST" }),
      ),
    ).toBe(false);
    const result = await POST(
      request({ operation: "initialize" }, "https://evil.example") as never,
    );
    expect(result.status).toBe(403);
  });

  it.each([
    [
      "initialize",
      { operation: "initialize", applicationId },
      mocks.initialize,
    ],
    [
      "submit",
      { operation: "submit", applicationId, requirementId, documentId },
      mocks.submit,
    ],
    [
      "review",
      {
        operation: "review",
        applicationId,
        requirementId,
        status: "verified",
        comment: "Evidence checked",
      },
      mocks.review,
    ],
  ] as const)("handles %s with HTTP 303", async (_name, values, handler) => {
    const result = await POST(request(values) as never);
    expect(handler).toHaveBeenCalledOnce();
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toContain(
      `/admissions/${applicationId}?message=`,
    );
  });

  it("configures the school policy", async () => {
    const result = await POST(
      request({
        operation: "configure",
        categoryKey: "applicant_passport_photograph",
        label: "Applicant passport photograph",
        required: "on",
        enabled: "on",
      }) as never,
    );
    expect(mocks.configure).toHaveBeenCalledWith({
      categoryKey: "applicant_passport_photograph",
      label: "Applicant passport photograph",
      required: true,
      enabled: true,
    });
    expect(result.status).toBe(303);
  });

  it("fails safely without exposing identifiers", async () => {
    mocks.review.mockRejectedValueOnce(new Error("cross-tenant"));
    const result = await POST(
      request({
        operation: "review",
        applicationId,
        requirementId,
        status: "verified",
      }) as never,
    );
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toContain(
      "error=The+document+request+could+not+be+completed",
    );
  });
});
