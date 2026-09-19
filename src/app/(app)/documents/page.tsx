import { downloadDocument, uploadDocument } from "../shared-services/actions";
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
      <div>
        <p className="text-sm font-semibold text-emerald-800">
          Shared services
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
        <p className="mt-2 text-slate-600">
          Private, permission-scoped files for the active school.
        </p>
      </div>
      {message && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>
      )}
      <section className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Upload document</h2>
        <form
          action={uploadDocument}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <input
            name="title"
            required
            placeholder="Document title"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="file"
            required
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.csv"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="entityType"
            placeholder="Linked record type (optional)"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="entityId"
            placeholder="Linked record UUID (optional)"
            className="rounded-lg border px-3 py-2"
          />
          <button className="rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white sm:col-span-2">
            Upload securely
          </button>
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
                className="flex flex-wrap items-center justify-between gap-4 border-b p-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm text-slate-500">
                    {doc.original_filename} ·{" "}
                    {(doc.size_bytes / 1024).toFixed(1)} KiB · {doc.status}
                  </p>
                </div>
                {doc.status === "available" && (
                  <form action={downloadDocument}>
                    <input type="hidden" name="documentId" value={doc.id} />
                    <button className="rounded-lg border px-3 py-1 text-sm">
                      Download
                    </button>
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
