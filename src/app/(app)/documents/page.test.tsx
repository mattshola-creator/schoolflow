import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { loadDocuments } from "@/features/shared-services/service";
import DocumentsPage from "./page";

vi.mock("@/features/shared-services/service", () => ({
  loadDocuments: vi.fn(),
}));
vi.mock("../shared-services/actions", () => ({ downloadDocument: vi.fn() }));

afterEach(() => vi.clearAllMocks());

async function renderFor(permissions: string[]) {
  vi.mocked(loadDocuments).mockResolvedValue({
    authorization: { permissions },
    documents: [],
  } as unknown as Awaited<ReturnType<typeof loadDocuments>>);
  return renderToStaticMarkup(
    await DocumentsPage({ searchParams: Promise.resolve({}) }),
  );
}

describe("Documents upload permission boundary", () => {
  it("keeps the document register available without upload controls for readers", async () => {
    const html = await renderFor(["shared.documents.view"]);
    expect(html).toContain("School documents");
    expect(html).not.toContain("Upload securely");
    expect(html).not.toContain("/api/documents/upload");
    expect(html).not.toContain('type="file"');
  });
  it("offers the existing protected upload flow to document managers", async () => {
    const html = await renderFor([
      "shared.documents.view",
      "shared.documents.manage",
    ]);
    expect(html).toContain("Upload securely");
    expect(html).toContain('action="/api/documents/upload"');
    expect(html).toContain('method="post"');
  });
});
