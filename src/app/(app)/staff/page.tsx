import Link from "next/link";
import {
  CalendarDays,
  Filter,
  Settings2,
  UserPlus,
  UsersRound,
} from "lucide-react";
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
import { staffSearchSchema } from "@/features/staff/schemas";
import { loadStaff } from "@/features/staff/service";

function directoryHref(
  values: Record<string, string | number | null | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "")
      params.set(key, String(value));
  });
  return `/staff?${params.toString()}`;
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    message?: string;
    status?: string;
    departmentId?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const filters = staffSearchSchema.parse({
    query: params.q,
    page: params.page,
    status: params.status,
    departmentId: params.departmentId,
    sort: params.sort,
  });
  const result = await loadStaff(filters);
  const canManage = result.authorization.permissions.includes("staff.manage");
  const canSetup = result.authorization.permissions.some((permission) =>
    ["staff.departments.manage", "staff.positions.manage"].includes(permission),
  );
  const canTimeOff = result.authorization.permissions.includes(
    "staff.time_off.request",
  );
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));
  const pageStart = result.count ? (result.page - 1) * result.pageSize + 1 : 0;
  const pageEnd = Math.min(result.page * result.pageSize, result.count);

  return (
    <main className="space-y-7 py-3 sm:py-5">
      <PageHeader
        eyebrow="Staff operations"
        title={`Staff at ${result.active.schoolName}`}
        description="Find authorized staff records, review current responsibilities, and open each person's employment and assignment history."
        actions={
          canSetup || canManage || canTimeOff ? (
            <>
              {canTimeOff && (
                <ButtonLink href="/staff/time-off" variant="secondary">
                  <CalendarDays aria-hidden="true" className="size-4" /> Time
                  off
                </ButtonLink>
              )}
              {canSetup && (
                <ButtonLink href="/staff/setup" variant="secondary">
                  <Settings2 aria-hidden="true" className="size-4" /> Setup
                </ButtonLink>
              )}
              {canManage && (
                <ButtonLink href="/staff/new">
                  <UserPlus aria-hidden="true" className="size-4" /> Add staff
                </ButtonLink>
              )}
            </>
          ) : null
        }
      />
      {params.message && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {params.message}
        </p>
      )}

      <SurfaceCard title="Find staff" eyebrow="Authorized register">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(15rem,2fr)_1fr_1fr_1fr_auto] xl:items-end">
          <label className="text-sm font-medium">
            Name or staff number
            <input
              className={fieldClass}
              name="q"
              defaultValue={filters.query}
              placeholder="e.g. Chidi or SF/STAFF/018"
            />
          </label>
          <label className="text-sm font-medium">
            Assignment status
            <select
              className={fieldClass}
              name="status"
              defaultValue={filters.status}
            >
              <option value="all">Active and planned</option>
              <option value="active">Active</option>
              <option value="planned">Planned</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Department
            <select
              className={fieldClass}
              name="departmentId"
              defaultValue={filters.departmentId ?? ""}
            >
              <option value="">All departments</option>
              {result.departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
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
              <option value="newest">Newest assignment</option>
              <option value="oldest">Oldest assignment</option>
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
            {result.count.toLocaleString()} authorized staff member
            {result.count === 1 ? "" : "s"}
          </p>
          {(filters.query ||
            filters.departmentId ||
            filters.status !== "active" ||
            filters.sort !== "newest") && (
            <Link
              href="/staff"
              className="text-brand min-h-11 py-3 font-semibold"
            >
              Clear filters
            </Link>
          )}
        </div>
      </SurfaceCard>

      {result.staff.length ? (
        <section aria-labelledby="staff-register-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="staff-register-title"
                className="text-xl font-semibold text-slate-950"
              >
                Staff register
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Showing {pageStart}–{pageEnd} of {result.count.toLocaleString()}
              </p>
            </div>
            <StatusBadge tone="success">School-scoped</StatusBadge>
          </div>
          <div className="grid gap-3 md:hidden">
            {result.staff.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/staff/${assignment.staff_profiles.id}`}
                className="border-border bg-surface focus-visible:outline-focus-ring rounded-2xl border p-4 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold break-words text-slate-950">
                      {assignment.staff_profiles.people.first_name}{" "}
                      {assignment.staff_profiles.people.last_name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm [overflow-wrap:anywhere]">
                      {assignment.staff_profiles.staff_number}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      assignment.status === "active" ? "success" : "neutral"
                    }
                    className="capitalize"
                  >
                    {assignment.status}
                  </StatusBadge>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Position</dt>
                    <dd className="font-semibold">
                      {assignment.positions.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Department</dt>
                    <dd className="font-semibold">
                      {assignment.departments?.name ?? "School-wide"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Employment</dt>
                    <dd className="font-semibold capitalize">
                      {assignment.employments.employment_type.replace("_", " ")}
                    </dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable caption="Authorized staff register">
              <TableHead>
                <tr>
                  <TableHeader>Staff member</TableHeader>
                  <TableHeader>Staff number</TableHeader>
                  <TableHeader>Position</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </TableHead>
              <tbody>
                {result.staff.map((assignment) => (
                  <tr key={assignment.id}>
                    <TableCell>
                      <Link
                        className="text-brand font-semibold hover:underline"
                        href={`/staff/${assignment.staff_profiles.id}`}
                      >
                        {assignment.staff_profiles.people.first_name}{" "}
                        {assignment.staff_profiles.people.last_name}
                      </Link>
                      <span className="text-muted-foreground mt-1 block text-xs capitalize">
                        {assignment.employments.employment_type.replace(
                          "_",
                          " ",
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {assignment.staff_profiles.staff_number}
                    </TableCell>
                    <TableCell>{assignment.positions.name}</TableCell>
                    <TableCell>
                      {assignment.departments?.name ?? "School-wide"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={
                          assignment.status === "active" ? "success" : "neutral"
                        }
                        className="capitalize"
                      >
                        {assignment.status}
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
          title="No staff match this register view"
          description="Clear one or more filters, or add a staff member if your role permits staff management."
          action={
            <ButtonLink href="/staff" variant="secondary">
              Clear filters
            </ButtonLink>
          }
        />
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Staff register pages"
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
                  departmentId: filters.departmentId,
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
                  departmentId: filters.departmentId,
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
          <UsersRound aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>
            Primary staff assignments authorized for the active school are
            counted once and displayed. Profile access follows the same school
            gate and existing RLS policies.
          </p>
        </div>
      </aside>
    </main>
  );
}
