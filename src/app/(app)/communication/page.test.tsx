import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { loadCommunicationWorkspace } from "@/features/communication/service";
import CommunicationPage from "./page";

vi.mock("@/features/communication/service", () => ({
  loadCommunicationWorkspace: vi.fn(),
}));
vi.mock("./actions", () => ({ publishNotice: vi.fn() }));

afterEach(() => vi.clearAllMocks());

async function renderFor(permissions: string[], message?: string) {
  vi.mocked(loadCommunicationWorkspace).mockResolvedValue({
    authorization: { permissions },
    notices: [],
  } as unknown as Awaited<ReturnType<typeof loadCommunicationWorkspace>>);
  return renderToStaticMarkup(
    await CommunicationPage({ searchParams: Promise.resolve({ message }) }),
  );
}

describe("Communication publication access", () => {
  it("retains the notice list without publishing controls for readers", async () => {
    const html = await renderFor(["communication.view"]);
    expect(html).toContain("Recent notices");
    expect(html).not.toContain("Publish a notice");
    expect(html).not.toContain('name="body"');
  });
  it("retains the publishing flow for managers", async () => {
    const html = await renderFor([
      "communication.view",
      "communication.notices.manage",
    ]);
    expect(html).toContain("Publish a notice");
    expect(html).toContain('name="body"');
  });
  it("shows a record-free denial for a stale unauthorized form", async () => {
    const html = await renderFor(["communication.view"], "unavailable");
    expect(html).toContain(
      "Notice publication is unavailable in this workspace.",
    );
    expect(html).not.toContain("Notice published successfully");
  });
});
