import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireStudentContext } from "@/features/students/service";
import { createImportPreview } from "./actions";

export default async function StudentImportPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string; error?: string }>;
}) {
  const { batch, error } = await searchParams;
  const context = await requireStudentContext(
    "students.import",
    "students.import_preview",
  ).catch(() => null);
  if (!context)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Import preview unavailable</h1>
      </main>
    );
  const preview = batch
    ? await context.supabase
        .from("import_batches")
        .select(
          "id, source_name, status, total_rows, valid_rows, warning_rows, invalid_rows, import_rows(row_number, normalized_data, validation_messages, status)",
        )
        .eq("id", batch)
        .eq("school_id", context.active.schoolId!)
        .maybeSingle()
    : null;
  return (
    <main className="py-10 sm:py-12">
      <Link href="/students" className="text-brand text-sm font-medium">
        ← Students
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="Controlled imports"
          title="Student and guardian preview"
          description="Validate up to 500 CSV rows before any student record is created. Similar records are flagged for human review and never auto-merged."
        />
      </div>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <form
        action={createImportPreview}
        className="border-border bg-surface mt-6 grid min-w-0 gap-4 rounded-xl border p-5 sm:p-6"
      >
        <label className="min-w-0 text-sm font-medium">
          Source name
          <input
            className={fieldClass}
            name="sourceName"
            placeholder="September intake.csv"
            required
          />
        </label>
        <label className="min-w-0 text-sm font-medium">
          CSV content
          <textarea
            className={`${fieldClass} min-h-44 font-mono text-xs`}
            name="csv"
            placeholder="first_name,last_name,date_of_birth,student_number,guardian_first_name,guardian_last_name,relationship"
            required
          />
        </label>
        <p className="text-xs text-slate-500">
          Required: first_name, last_name, date_of_birth, student_number.
          Guardian fields are optional but must be complete together.
        </p>
        <Button className="w-full sm:w-auto" type="submit">
          Validate and save preview
        </Button>
      </form>
      {preview?.data && (
        <section className="border-border bg-surface mt-6 min-w-0 rounded-xl border p-5 sm:p-6">
          <h2 className="text-lg font-semibold [overflow-wrap:anywhere]">
            {preview.data.source_name}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {preview.data.total_rows} rows · {preview.data.valid_rows} valid ·{" "}
            {preview.data.warning_rows} warnings · {preview.data.invalid_rows}{" "}
            invalid
          </p>
          <div className="mt-4 grid gap-3 sm:hidden">
            {preview.data.import_rows
              .sort((a, b) => a.row_number - b.row_number)
              .map((row) => {
                const data = row.normalized_data as Record<string, string>;
                const messages = row.validation_messages as string[];
                return (
                  <article
                    className="bg-surface-subtle min-w-0 rounded-lg p-4 text-sm"
                    key={row.row_number}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <p className="min-w-0 font-semibold break-words">
                        {data.first_name} {data.last_name}
                      </p>
                      <span className="shrink-0 capitalize">{row.status}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 [overflow-wrap:anywhere]">
                      Row {row.row_number} · {data.student_number}
                    </p>
                    {messages.length > 0 && (
                      <p className="text-muted-foreground mt-2 text-xs break-words">
                        {messages.join(" ")}
                      </p>
                    )}
                  </article>
                );
              })}
          </div>
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Row</th>
                  <th className="p-2">Student</th>
                  <th className="p-2">Number</th>
                  <th className="p-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {preview.data.import_rows
                  .sort((a, b) => a.row_number - b.row_number)
                  .map((row) => {
                    const data = row.normalized_data as Record<string, string>;
                    const messages = row.validation_messages as string[];
                    return (
                      <tr
                        className="border-b last:border-0"
                        key={row.row_number}
                      >
                        <td className="p-2">{row.row_number}</td>
                        <td className="p-2">
                          {data.first_name} {data.last_name}
                        </td>
                        <td className="p-2">{data.student_number}</td>
                        <td className="p-2">
                          <span className="capitalize">{row.status}</span>
                          {messages.length > 0 && (
                            <span className="block text-xs text-slate-500">
                              {messages.join(" ")}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Preview only. Import execution will require an explicit confirmed
            batch workflow; no records were created.
          </p>
        </section>
      )}
    </main>
  );
}
