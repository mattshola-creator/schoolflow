import { describe, expect, it } from "vitest";
import { readQaMagicLinkTokenHash } from "./qa-magic-link";

describe("QA PKCE-compatible synthetic sign-in links", () => {
  it("reads a magic-link OTP from the fragment", () => {
    expect(
      readQaMagicLinkTokenHash("#token_hash=synthetic-otp&type=magiclink"),
    ).toBe("synthetic-otp");
  });

  it("rejects missing or non-magiclink OTP values", () => {
    expect(readQaMagicLinkTokenHash("")).toBeNull();
    expect(readQaMagicLinkTokenHash("#token_hash=one-time")).toBeNull();
    expect(
      readQaMagicLinkTokenHash(
        "#token_hash=synthetic-otp&type=recovery",
      ),
    ).toBeNull();
  });

  it("rejects oversized fragments", () => {
    expect(
      readQaMagicLinkTokenHash(
        "#token_hash=" + "x".repeat(2049) + "&type=magiclink",
      ),
    ).toBeNull();
  });
});
