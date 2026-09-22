import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recordAdmissionOfferResponse: vi.fn(),
}));

vi.mock("@/features/admissions/service", () => ({
  recordAdmissionOfferResponse: mocks.recordAdmissionOfferResponse,
}));

import { hasValidOfferResponseOrigin, POST } from "./route";

const endpoint =
  "https://schoolflow-app.netlify.app/api/admissions/offers/respond";
const applicationId = "33333333-3333-4333-8333-333333333333";

function request(
  response: string,
  origin = "https://schoolflow-app.netlify.app",
) {
  const formData = new FormData();
  formData.set("applicationId", applicationId);
  formData.set("response", response);
  return new Request(endpoint, {
    method: "POST",
    headers: { origin },
    body: formData,
  });
}

describe("POST /api/admissions/offers/respond", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts same-origin requests and rejects missing or foreign origins", () => {
    expect(hasValidOfferResponseOrigin(request("accept"))).toBe(true);
    expect(
      hasValidOfferResponseOrigin(new Request(endpoint, { method: "POST" })),
    ).toBe(false);
    expect(
      hasValidOfferResponseOrigin(request("accept", "https://evil.example")),
    ).toBe(false);
  });

  it.each([
    ["accept", "Offer+acceptance+recorded"],
    ["decline", "Offer+decline+recorded"],
  ])("records %s and redirects with HTTP 303", async (response, message) => {
    const result = await POST(request(response) as never);
    expect(mocks.recordAdmissionOfferResponse).toHaveBeenCalledWith({
      applicationId,
      response,
    });
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe(
      `https://schoolflow-app.netlify.app/admissions/${applicationId}?message=${message}`,
    );
  });

  it("rejects cross-origin submissions before business logic", async () => {
    const result = await POST(
      request("accept", "https://evil.example") as never,
    );
    expect(result.status).toBe(403);
    expect(mocks.recordAdmissionOfferResponse).not.toHaveBeenCalled();
  });

  it("rejects invalid responses without exposing identifiers", async () => {
    const result = await POST(request("accepted") as never);
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe(
      "https://schoolflow-app.netlify.app/admissions?error=Invalid+offer+response",
    );
    expect(mocks.recordAdmissionOfferResponse).not.toHaveBeenCalled();
  });

  it.each(["unauthorized", "cross-tenant", "duplicate", "expired"])(
    "fails safely for %s responses",
    async () => {
      mocks.recordAdmissionOfferResponse.mockRejectedValueOnce(
        new Error("Offer is unavailable"),
      );
      const result = await POST(request("accept") as never);
      expect(result.status).toBe(303);
      expect(result.headers.get("location")).toBe(
        `https://schoolflow-app.netlify.app/admissions/${applicationId}?error=The+offer+response+could+not+be+recorded`,
      );
    },
  );
});
