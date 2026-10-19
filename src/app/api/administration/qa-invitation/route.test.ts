import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createQaInvitation: vi.fn() }));
vi.mock("@/app/(app)/administration/actions", () => ({
  createQaInvitation: mocks.createQaInvitation,
}));

import { hasValidQaInvitationOrigin, POST } from "./route";

const endpoint =
  "https://deploy-preview-119--schoolflow-demo-qa.netlify.app/api/administration/qa-invitation";

function request(origin = new URL(endpoint).origin) {
  const formData = new FormData();
  formData.set("schoolId", "11111111-1111-4111-8111-111111111111");
  formData.set("rolePreset", "payment_recorder");
  return new Request(endpoint, {
    method: "POST",
    headers: { origin },
    body: formData,
  });
}

describe("POST /api/administration/qa-invitation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts only same-origin requests from an approved QA host", () => {
    expect(hasValidQaInvitationOrigin(request())).toBe(true);
    expect(
      hasValidQaInvitationOrigin(new Request(endpoint, { method: "POST" })),
    ).toBe(false);
    expect(hasValidQaInvitationOrigin(request("https://evil.example"))).toBe(
      false,
    );
    const productionEndpoint =
      "https://schoolflow-app.netlify.app/api/administration/qa-invitation";
    expect(
      hasValidQaInvitationOrigin(
        new Request(productionEndpoint, {
          method: "POST",
          headers: { origin: "https://schoolflow-app.netlify.app" },
        }),
      ),
    ).toBe(false);
  });

  it("passes the authenticated form request to the existing authorization flow", async () => {
    mocks.createQaInvitation.mockResolvedValueOnce({
      message: "QA sign-in and role acceptance links are ready.",
      signInUrl: "https://qa.example/one-time",
      inviteUrl:
        "https://schoolflow-demo-qa.netlify.app/accept-invitation?token=synthetic",
    });

    const response = await POST(request() as never);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.createQaInvitation).toHaveBeenCalledOnce();
    const [, formData] = mocks.createQaInvitation.mock.calls[0];
    expect(formData.get("rolePreset")).toBe("payment_recorder");
    expect((await response.json()).message).toContain("links are ready");
  });

  it("rejects cross-origin submissions before the authorization flow", async () => {
    const response = await POST(request("https://evil.example") as never);
    expect(response.status).toBe(403);
    expect(mocks.createQaInvitation).not.toHaveBeenCalled();
  });
});
