import Link from "next/link";
import { Filter, UserPlus, Users } from "lucide-react";
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
import { studentSearchSchema } from "@/features/students/schemas";
import { loadStudents } from "@/features/students/service";

function directoryHref(
  values: Record<string, string | number | null | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "")
      params.set(key, String(value));
  });
  return `/students?${params.toString()}`;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    status?: string;
    classLevelId?: string;
    sort?: string;
  }>;
}) {
  const raw = await searchParams;
  const filters = studentSearchSchema.parse({
    query: raw.q,
    page: raw.page,
    status: raw.status,
    classLevelId: raw.classLevelId,
    sort: raw.sort,
  });
  const result = await loadStudents(filters);
  const canManage =
    result.authorization.permissions.includes("students.manage");
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));
  const pageStart = result.count ? (result.page - 1) * result.pageSize + 1 : 0;
  const pageEnd = Math.min(result.page * result.pageSize, result.count);

  return (
    <main className="space-y-7 py-3 sm:py-5">
      <PageHeader
        eyebrow="Student operations"
        title={`Students at ${result.active.schoolName}`}
        description="Search the authorized school register, understand each learner's current placement, and open a complete Student 360 record."
        actions={
          canManage ? (
            <>
              <ButtonLink href="/students/import" variant="secondary">
                Import preview
              </ButtonLink>
              <ButtonLink href="/students/new">
                <UserPlus aria-hidden="true" className="size-4" /> Add student
              </ButtonLink>
            </>
          ) : null
        }
      />

      <SurfaceCard title="Find learners" eyebrow="Authorized register">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(15rem,2fr)_1fr_1fr_1fr_auto] xl:items-end">
          <label className="text-sm font-medium">
            Name or student number
            <input
              className={fieldClass}
              name="q"
              defaultValue={filters.query}
              placeholder="e.g. Ada or SF/2026/014"
            />
          </label>
          <label className="text-sm font-medium">
            Enrollment status
            <select
              className={fieldClass}
              name="status"
              defaultValue={filters.status}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="transferred">Transferred</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Class level
            <select
              className={fieldClass}
              name="classLevelId"
              defaultValue={filters.classLevelId ?? ""}
            >
              <option value="">All class levels</option>
              {result.classLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Sort
            <select
              className={fieldClass}
              name="sort"
              defaultValue={filters.sort}
            >
              <option value="newest">Newest enrollment</option>
              <option value="oldest">Oldest enrollment</option>
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
            {result.count.toLocaleString()} authorized learner
            {result.count === 1 ? "" : "s"}
          </p>
          {(filters.query ||
            filters.classLevelId ||
            filters.status !== "active" ||
            filters.sort !== "newest") && (
            <Link
              href="/students"
              className="text-brand min-h-11 py-3 font-semibold"
            >
              Clear filters
            </Link>
          )}
        </div>
      </SurfaceCard>

      {result.students.length ? (
        <section aria-labelledby="student-register-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="student-register-title"
                className="text-xl font-semibold text-slate-950"
              >
                Student register
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Showing {pageStart}–{pageEnd} of {result.count.toLocaleString()}
              </p>
            </div>
            <StatusBadge tone="success">School-scoped</StatusBadge>
          </div>
          <div className="grid gap-3 md:hidden">
            {result.students.map((enrollment) => {
              const student = enrollment.student_profiles;
              const placement = enrollment.class_memberships.find(
                (item) => item.status === "active",
              );
              return (
                <Link
                  key={enrollment.id}
                  href={`/students/${student.id}`}
                  className="border-border bg-surface focus-visible:outline-focus-ring rounded-2xl border p-4 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold break-words text-slate-950">
                        {student.people.first_name} {student.people.last_name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm [overflow-wrap:anywhere]">
                        {student.student_number}
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        enrollment.status === "active" ? "success" : "neutral"
                      }
                      className="capitalize"
                    >
                      {enrollment.status}
                    </StatusBadge>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Class</dt>
                      <dd className="font-semibold">
                        {placement?.class_levels.name ?? "Unplaced"}
                        {placement?.class_arms
                          ? ` · ${placement.class_arms.name}`
                          : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Session</dt>
                      <dd className="font-semibold">
                        {enrollment.academic_sessions.name}
                      </dd>
                    </div>
                  </dl>
                </Link>
              );
            })}
          </div>
          <div className="hidden md:block">
            <DataTable caption="Authorized student register">
              <TableHead>
                <tr>
                  <TableHeader>Learner</TableHeader>
                  <TableHeader>Student number</TableHeader>
                  <TableHeader>Class</TableHeader>
                  <TableHeader>Session</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </TableHead>
              <tbody>
                {result.students.map((enrollment) => {
                  const student = enrollment.student_profiles;
                  const placement = enrollment.class_memberships.find(
                    (item) => item.status === "active",
                  );
                  return (
                    <tr key={enrollment.id}>
                      <TableCell>
                        <Link
                          className="text-brand font-semibold hover:underline"
                          href={`/students/${student.id}`}
                        >
                          {student.people.first_name} {student.people.last_name}
                        </Link>
                      </TableCell>
                      <TableCell>{student.student_number}</TableCell>
                      <TableCell>
                        {placement?.class_levels.name ?? "Unplaced"}
                        {placement?.class_arms
                          ? ` · ${placement.class_arms.name}`
                          : ""}
                      </TableCell>
                      <TableCell>{enrollment.academic_sessions.name}</TableCell>
                      <TableCell>
                        <StatusBadge
                          tone={
                            enrollment.status === "active"
                              ? "success"
                              : "neutral"
                          }
                          className="capitalize"
                        >
                          {enrollment.status}
                        </StatusBadge>
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          </div>
        </section>
      ) : (
        <StatePanel
          kind="empty"
          title="No learners match this register view"
          description="Clear one or more filters, or add a learner if your role permits student management."
          action={
            <ButtonLink href="/students" variant="secondary">
              Clear filters
            </ButtonLink>
          }
        />
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Student register pages"
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
                  classLevelId: filters.classLevelId,
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
                  classLevelId: filters.classLevelId,
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
          <Users aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>
            Counts, filters and profiles are calculated from real records
            authorized for the active organization and school. Changing context
            never broadens access.
          </p>
        </div>
      </aside>
    </main>
  );
}
