import Link from "next/link";
import { Settings2, UserPlus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DirectorySearch } from "@/components/ui/directory-search";
import { PageHeader } from "@/components/ui/page-header";
import { staffSearchSchema } from "@/features/staff/schemas";
import { loadStaff } from "@/features/staff/service";

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; message?: string }>;
}) {
  const params = await searchParams;
  const parsed = staffSearchSchema.parse({
    query: params.q,
    page: params.page,
  });
  const result = await loadStaff(parsed.query, parsed.page).catch(() => null);
  if (!result)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Staff unavailable</h1>
        <p className="mt-3 text-slate-600">
          Select an authorized, entitled school workspace.
        </p>
      </main>
    );
  const canManage = result.authorization.permissions.includes("staff.manage");
  const canSetup = result.authorization.permissions.some((permission) =>
    ["staff.departments.manage", "staff.positions.manage"].includes(permission),
  );
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Staff records"
        title={
          <span className="break-words">
            Staff at {result.active.schoolName}
          </span>
        }
        description={
          <>Employment, school assignments, positions, and access linkage.</>
        }
        actions={
          canSetup || canManage ? (
            <>
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
          className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {params.message}
        </p>
      )}
      <DirectorySearch
        id="staff-search"
        defaultValue={parsed.query}
        label="Search by staff number"
        placeholder="Search staff number"
      />
      <div className="border-border bg-surface mt-6 overflow-hidden rounded-xl border">
        {result.staff.length ? (
          <ul className="divide-y">
            {result.staff.map((assignment) => (
              <li key={assignment.id}>
                <Link
                  href={`/staff/${assignment.staff_profiles.id}`}
                  className="grid gap-1 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold break-words">
                      {assignment.staff_profiles.people.first_name}{" "}
                      {assignment.staff_profiles.people.last_name}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-sm font-medium [overflow-wrap:anywhere]">
                      {assignment.staff_profiles.staff_number} ·{" "}
                      {assignment.employments.employment_type.replace("_", " ")}
                    </span>
                  </span>
                  <span className="text-muted-foreground min-w-0 text-sm font-medium break-words sm:text-right">
                    {assignment.positions.name}
                    {assignment.departments
                      ? ` · ${assignment.departments.name}`
                      : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No staff records yet</h2>
            <p className="mt-1 text-sm text-slate-500">
              Configure positions, then create the first staff record.
            </p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <nav
          aria-label="Staff pages"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
        >
          <span>
            Page {result.page} of {totalPages}
          </span>
          <div className="flex gap-3">
            {result.page > 1 && (
              <Link
                href={`/staff?q=${encodeURIComponent(parsed.query)}&page=${result.page - 1}`}
              >
                Previous
              </Link>
            )}
            {result.page < totalPages && (
              <Link
                href={`/staff?q=${encodeURIComponent(parsed.query)}&page=${result.page + 1}`}
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
