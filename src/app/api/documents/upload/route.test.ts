import { describe, expect, it } from "vitest";
import { hasSameRequestOrigin } from "@/lib/http/request-origin";

describe("document upload origin validation", () => {
  it("accepts the application origin", () => {
    const request = new Request(
      "https://schoolflow-app.netlify.app/api/documents/upload",
      { headers: { origin: "https://schoolflow-app.netlify.app" } },
    );
    expect(hasSameRequestOrigin(request)).toBe(true);
  });

  it("rejects missing and cross-origin requests", () => {
    expect(
      hasSameRequestOrigin(
        new Request("https://schoolflow-app.netlify.app/api/documents/upload"),
      ),
    ).toBe(false);
    expect(
      hasSameRequestOrigin(
        new Request("https://schoolflow-app.netlify.app/api/documents/upload", {
          headers: { origin: "https://malicious.example" },
        }),
      ),
    ).toBe(false);
  });
});
