import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError } from "@/lib/authorization";
import { createAndPublishNotice } from "@/features/communication/service";
import { publishNotice } from "./actions";

vi.mock("@/features/communication/service", () => ({
  createAndPublishNotice: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));

function form() {
  const data = new FormData();
  Object.entries({
    title: "Synthetic test",
    body: "Synthetic notice body",
    priority: "normal",
    audienceKind: "school",
  }).forEach(([k, v]) => data.set(k, v));
  return data;
}

beforeEach(() => vi.clearAllMocks());

describe("Communication action denial", () => {
  it("redirects an authorization failure to an access-unavailable response", async () => {
    vi.mocked(createAndPublishNotice).mockRejectedValue(
      new AuthorizationError("permission_denied"),
    );
    await expect(publishNotice(form())).rejects.toThrow(
      "REDIRECT:/communication?message=unavailable",
    );
  });
  it("preserves genuine service errors", async () => {
    const error = new Error("storage unavailable");
    vi.mocked(createAndPublishNotice).mockRejectedValue(error);
    await expect(publishNotice(form())).rejects.toBe(error);
  });
  it("keeps successful publication on the existing success path", async () => {
    vi.mocked(createAndPublishNotice).mockResolvedValue(undefined);
    await expect(publishNotice(form())).rejects.toThrow(
      "REDIRECT:/communication?message=published",
    );
  });
});
