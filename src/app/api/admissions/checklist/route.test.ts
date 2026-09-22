import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ updateAdmissionChecklistItem: vi.fn() }));
vi.mock("@/features/admissions/service", () => ({
  updateAdmissionChecklistItem: mocks.updateAdmissionChecklistItem,
}));

import { hasValidChecklistOrigin, POST } from "./route";

const endpoint = "https://schoolflow-app.netlify.app/api/admissions/checklist";
const applicationId = "33333333-3333-4333-8333-333333333333";
const itemId = "44444444-4444-4444-8444-444444444444";

function request(
  status = "complete",
  origin = "https://schoolflow-app.netlify.app",
) {
  const formData = new FormData();
  formData.set("applicationId", applicationId);
  formData.set("itemId", itemId);
  formData.set("status", status);
  return new Request(endpoint, {
    method: "POST",
    headers: { origin },
    body: formData,
  });
}

describe("POST /api/admissions/checklist", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts same-origin requests and rejects missing or foreign origins", () => {
    expect(hasValidChecklistOrigin(request())).toBe(true);
    expect(
      hasValidChecklistOrigin(new Request(endpoint, { method: "POST" })),
    ).toBe(false);
    expect(
      hasValidChecklistOrigin(request("complete", "https://evil.example")),
    ).toBe(false);
  });

  it.each(["pending", "complete", "waived"])(
    "records %s and redirects with HTTP 303",
    async (status) => {
      const result = await POST(request(status) as never);
      expect(mocks.updateAdmissionChecklistItem).toHaveBeenCalledWith({
        applicationId,
        itemId,
        status,
      });
      expect(result.status).toBe(303);
      expect(result.headers.get("location")).toBe(
        `https://schoolflow-app.netlify.app/admissions/${applicationId}?message=Checklist+updated`,
      );
    },
  );

  it("rejects cross-origin submissions before business logic", async () => {
    const result = await POST(
      request("complete", "https://evil.example") as never,
    );
    expect(result.status).toBe(403);
    expect(mocks.updateAdmissionChecklistItem).not.toHaveBeenCalled();
  });

  it("rejects invalid updates without exposing identifiers", async () => {
    const result = await POST(request("verified") as never);
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe(
      "https://schoolflow-app.netlify.app/admissions?error=Invalid+checklist+update",
    );
  });

  it("fails safely for unauthorized and cross-tenant updates", async () => {
    mocks.updateAdmissionChecklistItem.mockRejectedValueOnce(
      new Error("unavailable"),
    );
    const result = await POST(request() as never);
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe(
      `https://schoolflow-app.netlify.app/admissions/${applicationId}?error=The+checklist+could+not+be+updated`,
    );
  });
});
