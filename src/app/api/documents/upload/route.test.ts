import { describe, expect, it } from "vitest";
import { hasValidUploadOrigin } from "./route";

describe("document upload origin validation", () => {
  it("accepts the application origin", () => {
    const request = new Request(
      "https://schoolflow-app.netlify.app/api/documents/upload",
      { headers: { origin: "https://schoolflow-app.netlify.app" } },
    );
    expect(hasValidUploadOrigin(request)).toBe(true);
  });

  it("rejects missing and cross-origin requests", () => {
    expect(
      hasValidUploadOrigin(
        new Request("https://schoolflow-app.netlify.app/api/documents/upload"),
      ),
    ).toBe(false);
    expect(
      hasValidUploadOrigin(
        new Request("https://schoolflow-app.netlify.app/api/documents/upload", {
          headers: { origin: "https://malicious.example" },
        }),
      ),
    ).toBe(false);
  });
});
