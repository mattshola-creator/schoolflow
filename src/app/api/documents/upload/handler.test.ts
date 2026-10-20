import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const persist = vi.hoisted(() => vi.fn());
vi.mock("@/features/shared-services/service", () => ({
  persistDocumentUpload: persist,
}));
vi.mock("@/lib/authorization", () => ({
  AuthorizationError: class AuthorizationError extends Error {
    constructor(public reason: string) {
      super("Access denied");
    }
  },
}));
import { AuthorizationError } from "@/lib/authorization";
import { POST } from "./route";

function request() {
  const form = new FormData();
  form.set("title", "synthetic-private-title");
  return new NextRequest(
    "https://schoolflow-demo-qa.netlify.app/api/documents/upload",
    {
      method: "POST",
      headers: { origin: "https://schoolflow-demo-qa.netlify.app" },
      body: form,
    },
  );
}
afterEach(() => {
  vi.restoreAllMocks();
  persist.mockReset();
});
describe("document upload failure handling", () => {
  it("denies unauthorized uploads with 403", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    persist.mockRejectedValue(new AuthorizationError("permission_denied"));
    expect((await POST(request())).status).toBe(403);
  });
  it("logs only a fixed diagnostic category without private error contents", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    persist.mockRejectedValue(
      new TypeError("secret-token synthetic-private-title"),
    );
    expect((await POST(request())).status).toBe(303);
    expect(log).toHaveBeenCalledWith(
      JSON.stringify({
        event: "document_upload_failed",
        stage: "document_persistence",
        category: "type_error",
      }),
    );
  });
  it("distinguishes malformed multipart data before persistence", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const req = request();
    vi.spyOn(req, "formData").mockRejectedValue(
      new TypeError("private multipart body"),
    );
    expect((await POST(req)).status).toBe(303);
    expect(persist).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      JSON.stringify({
        event: "document_upload_failed",
        stage: "multipart_parse",
        category: "type_error",
      }),
    );
  });
});
