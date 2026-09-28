import { downloadDocument } from "../shared-services/actions";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusNotice } from "@/components/ui/status-notice";
import { loadDocuments } from "@/features/shared-services/service";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const [{ message, error }, data] = await Promise.all([
    searchParams,
    loadDocuments(),
  ]);
  return (
    <main className="space-y-8 py-8">
      <PageHeader
        eyebrow="Shared services"
        title="Documents"
        description="Private, permission-scoped files for the active school."
      />
      {message && <StatusNotice tone="success">{message}</StatusNotice>}
      {error && <StatusNotice tone="error">{error}</StatusNotice>}
      <section className="min-w-0 rounded-xl border bg-white p-5 sm:p-6">
        <h2 className="font-semibold">Upload document</h2>
        <form
          action="/api/documents/upload"
          method="post"
          encType="multipart/form-data"
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <input
            name="title"
            required
            aria-label="Document title"
            placeholder="Document title"
            className={fieldClass}
          />
          <input
            name="file"
            required
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.csv"
            aria-label="Choose document file"
            className={`${fieldClass} min-w-0 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium`}
          />
          <input
            name="entityType"
            aria-label="Linked record type"
            placeholder="Linked record type (optional)"
            className={fieldClass}
          />
          <input
            name="entityId"
            aria-label="Linked record identifier"
            placeholder="Linked record UUID (optional)"
            className={fieldClass}
          />
          <Button className="w-full sm:col-span-2" type="submit">
            Upload securely
          </Button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          PDF, JPEG, PNG or CSV · maximum 10 MiB.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">School documents</h2>
        <div className="mt-3 overflow-hidden rounded-xl border bg-white">
          {data.documents.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              No documents uploaded yet.
            </p>
          ) : (
            data.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex min-w-0 flex-col items-stretch gap-4 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium break-words">{doc.title}</p>
                  <p className="text-sm break-all text-slate-500">
                    {doc.original_filename} ·{" "}
                    {(doc.size_bytes / 1024).toFixed(1)} KiB · {doc.status}
                  </p>
                </div>
                {doc.status === "available" && (
                  <form action={downloadDocument} className="shrink-0">
                    <input type="hidden" name="documentId" value={doc.id} />
                    <Button
                      className="w-full sm:w-auto"
                      type="submit"
                      variant="secondary"
                    >
                      Download
                    </Button>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
