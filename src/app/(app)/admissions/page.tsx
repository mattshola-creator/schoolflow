import Link from "next/link";
import { Filter, ShieldCheck, UserPlus } from "lucide-react";
import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  admissionSearchSchema,
  applicationStatuses,
} from "@/features/admissions/schemas";
import { loadAdmissions } from "@/features/admissions/service";

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function directoryHref(
  values: Record<string, string | number | null | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "")
      params.set(key, String(value));
  });
  return `/admissions?${params.toString()}`;
}

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    source?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const raw = await searchParams;
  const filters = admissionSearchSchema.parse({
    query: raw.q,
    status: raw.status,
    source: raw.source,
    sort: raw.sort,
    page: raw.page,
  });
  const result = await loadAdmissions(filters);
  const permissions = new Set(result.authorization.permissions);
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));
  const pageStart = result.count ? (result.page - 1) * result.pageSize + 1 : 0;
  const pageEnd = Math.min(result.page * result.pageSize, result.count);
  const hasFilters =
    filters.query ||
    filters.status ||
    filters.source !== "all" ||
    filters.sort !== "newest";

  return (
    <main className="space-y-7 py-3 sm:py-5">
      <PageHeader
        eyebrow="Admissions operations"
        title={`Admissions at ${result.active.schoolName}`}
        description="Move authorized applicants from first enquiry through assessment, offer and enrollment without duplicating learner identities."
        actions={
          <>
            {permissions.has("admissions.documents.configure") && (
              <ButtonLink
                href="/admissions/document-policy"
                variant="secondary"
              >
                Document policy
              </ButtonLink>
            )}
            {permissions.has("admissions.manage") && (
              <ButtonLink href="/admissions/new">
                <UserPlus aria-hidden="true" className="size-4" /> New
                application
              </ButtonLink>
            )}
          </>
        }
      />

      <SurfaceCard title="Find applicants" eyebrow="Authorized pipeline">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(15rem,2fr)_1fr_1fr_1fr_auto] xl:items-end">
          <label className="text-sm font-medium">
            Name or application number
            <input
              className={fieldClass}
              name="q"
              defaultValue={filters.query}
              placeholder="e.g. Amara or APP-2026-014"
            />
          </label>
          <label className="text-sm font-medium">
            Stage
            <select
              className={fieldClass}
              name="status"
              defaultValue={filters.status ?? ""}
            >
              <option value="">All stages</option>
              {applicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {label(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Source
            <select
              className={fieldClass}
              name="source"
              defaultValue={filters.source}
            >
              <option value="all">All sources</option>
              <option value="enquiry">Enquiry</option>
              <option value="staff">Staff entry</option>
              <option value="parent_online">Parent online</option>
              <option value="import">Import</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Sort
            <select
              className={fieldClass}
              name="sort"
              defaultValue={filters.sort}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <Button
            className="w-full md:w-auto"
            type="submit"
            variant="secondary"
          >
            <Filter aria-hidden="true" className="size-4" /> Apply
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-muted-foreground" aria-live="polite">
            {result.count.toLocaleString()} authorized application
            {result.count === 1 ? "" : "s"}
          </p>
          {hasFilters && (
            <Link
              href="/admissions"
              className="text-brand min-h-11 py-3 font-semibold"
            >
              Clear filters
            </Link>
          )}
        </div>
      </SurfaceCard>

      {result.applications.length ? (
        <section aria-labelledby="admissions-register-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="admissions-register-title"
                className="text-xl font-semibold text-slate-950"
              >
                Application pipeline
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Showing {pageStart}–{pageEnd} of {result.count.toLocaleString()}
              </p>
            </div>
            <StatusBadge tone="success">School-scoped</StatusBadge>
          </div>
          <div className="grid gap-3 md:hidden">
            {result.applications.map((application) => (
              <Link
                key={application.id}
                href={`/admissions/${application.id}`}
                className="border-border bg-surface focus-visible:outline-focus-ring rounded-2xl border p-4 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold break-words text-slate-950">
                      {application.applicant.first_name}{" "}
                      {application.applicant.last_name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm [overflow-wrap:anywhere]">
                      {application.application_number}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      application.status === "enrolled" ? "success" : "neutral"
                    }
                  >
                    {label(application.status)}
                  </StatusBadge>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Applying for</dt>
                    <dd className="font-semibold">
                      {application.class_levels.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Session</dt>
                    <dd className="font-semibold">
                      {application.academic_sessions.name}
                    </dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable caption="Authorized admissions pipeline">
              <TableHead>
                <tr>
                  <TableHeader>Applicant</TableHeader>
                  <TableHeader>Application</TableHeader>
                  <TableHeader>Class</TableHeader>
                  <TableHeader>Session</TableHeader>
                  <TableHeader>Stage</TableHeader>
                </tr>
              </TableHead>
              <tbody>
                {result.applications.map((application) => (
                  <tr key={application.id}>
                    <TableCell>
                      <Link
                        className="text-brand font-semibold hover:underline"
                        href={`/admissions/${application.id}`}
                      >
                        {application.applicant.first_name}{" "}
                        {application.applicant.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>{application.application_number}</TableCell>
                    <TableCell>{application.class_levels.name}</TableCell>
                    <TableCell>{application.academic_sessions.name}</TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={
                          application.status === "enrolled"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {label(application.status)}
                      </StatusBadge>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
        </section>
      ) : (
        <StatePanel
          kind="empty"
          title="No applicants match this pipeline view"
          description="Clear one or more filters, or create an application if your role permits admissions management."
          action={
            <ButtonLink href="/admissions" variant="secondary">
              Clear filters
            </ButtonLink>
          }
        />
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Admissions register pages"
          className="flex items-center justify-between gap-3"
        >
          <span className="text-muted-foreground text-sm">
            Page {result.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {result.page > 1 && (
              <ButtonLink
                variant="secondary"
                href={directoryHref({
                  q: filters.query,
                  status: filters.status,
                  source: filters.source,
                  sort: filters.sort,
                  page: result.page - 1,
                })}
              >
                Previous
              </ButtonLink>
            )}
            {result.page < totalPages && (
              <ButtonLink
                variant="secondary"
                href={directoryHref({
                  q: filters.query,
                  status: filters.status,
                  source: filters.source,
                  sort: filters.sort,
                  page: result.page + 1,
                })}
              >
                Next
              </ButtonLink>
            )}
          </div>
        </nav>
      )}

      <aside className="border-brand-border bg-brand-soft text-brand-strong rounded-xl border p-4 text-sm">
        <div className="flex gap-3">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>
            Counts, filters and applicant records use real data authorized for
            the active organization and school. Lifecycle changes continue
            through the existing audited Admissions contracts.
          </p>
        </div>
      </aside>
    </main>
  );
}
