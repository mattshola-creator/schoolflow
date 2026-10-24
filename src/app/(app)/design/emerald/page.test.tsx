import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmeraldDesignPage from "./page";

const guard = vi.hoisted(() => vi.fn());
vi.mock("@/lib/authorization", () => ({ requireCapability: guard }));

describe("design preview route boundary", () => {
  beforeEach(() => {
    guard.mockReset();
  });
  it("does not render the preview if the existing capability guard denies", async () => {
    guard.mockRejectedValue(new Error("access denied"));
    await expect(EmeraldDesignPage()).rejects.toThrow("access denied");
  });
  it("requires the existing administration inspection capability", async () => {
    guard.mockResolvedValue({});
    render(await EmeraldDesignPage());
    expect(guard).toHaveBeenCalledWith({
      permission: "organization.view",
      module: "foundation",
      feature: "foundation.authorization_inspection",
    });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "design review",
    );
  });
});
