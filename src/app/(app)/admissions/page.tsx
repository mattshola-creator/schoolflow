import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { fieldClass } from "@/components/auth-card";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  admissionSearchSchema,
  applicationStatuses,
} from "@/features/admissions/schemas";
import { loadAdmissions } from "@/features/admissions/service";

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const raw = await searchParams;
  const parsed = admissionSearchSchema.parse({
    query: raw.q,
    status: raw.status,
    page: raw.page,
  });
  const result = await loadAdmissions(
    parsed.query,
    parsed.status,
    parsed.page,
  ).catch(() => null);
  if (!result)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Admissions unavailable</h1>
        <p className="text-muted-foreground mt-3 font-medium">
          Select an authorized school with the Admissions entitlement enabled.
        </p>
      </main>
    );
  const canManage =
    result.authorization.permissions.includes("admissions.manage");
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Admissions"
        title={`Applicants at ${result.active.schoolName}`}
        description="Manage application, assessment, decision, offer and enrollment stages without duplicating student records."
        actions={
          <>
            {result.authorization.permissions.includes(
              "admissions.documents.configure",
            ) && (
              <ButtonLink
                href="/admissions/document-policy"
                variant="secondary"
              >
                Document policy
              </ButtonLink>
            )}
            {canManage && (
              <ButtonLink href="/admissions/new">
                <UserPlus className="size-4" />
                New application
              </ButtonLink>
            )}
          </>
        }
      />
      <form
        className="mt-7 grid gap-2 sm:max-w-3xl sm:grid-cols-[1fr_14rem_auto]"
        role="search"
      >
        <label className="sr-only" htmlFor="admission-search">
          Search application number
        </label>
        <input
          id="admission-search"
          className={fieldClass}
          name="q"
          defaultValue={parsed.query}
          placeholder="Search application number"
        />
        <select
          className={fieldClass}
          name="status"
          defaultValue={parsed.status ?? ""}
          aria-label="Application status"
        >
          <option value="">All statuses</option>
          {applicationStatuses.map((status) => (
            <option key={status} value={status}>
              {label(status)}
            </option>
          ))}
        </select>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 text-sm font-medium">
          <Search className="size-4" />
          Filter
        </button>
      </form>
      <div className="border-border bg-surface mt-6 overflow-hidden rounded-xl border">
        {result.applications.length ? (
          <ul className="divide-y">
            {result.applications.map((application) => (
              <li key={application.id}>
                <Link
                  href={`/admissions/${application.id}`}
                  className="grid gap-1 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span>
                    <span className="font-semibold">
                      {application.applicant.first_name}{" "}
                      {application.applicant.last_name}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-sm font-medium">
                      {application.application_number} ·{" "}
                      {application.class_levels.name} ·{" "}
                      {application.academic_sessions.name}
                    </span>
                  </span>
                  <StatusBadge
                    tone={
                      application.status === "enrolled" ? "success" : "neutral"
                    }
                  >
                    {label(application.status)}
                  </StatusBadge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No applications found</h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Create an application or adjust the filters.
            </p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <nav
          aria-label="Admissions pages"
          className="mt-4 flex justify-between text-sm"
        >
          <span>
            Page {result.page} of {totalPages}
          </span>
          <div className="flex gap-3">
            {result.page > 1 && (
              <Link
                href={`/admissions?q=${encodeURIComponent(parsed.query)}&status=${parsed.status ?? ""}&page=${result.page - 1}`}
              >
                Previous
              </Link>
            )}
            {result.page < totalPages && (
              <Link
                href={`/admissions?q=${encodeURIComponent(parsed.query)}&status=${parsed.status ?? ""}&page=${result.page + 1}`}
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </main>
  );
}
