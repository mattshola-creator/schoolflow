import Link from "next/link";
import { Search, Settings2, UserPlus } from "lucide-react";
import { fieldClass } from "@/components/auth-card";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Staff records
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Staff at {result.active.schoolName}
          </h1>
          <p className="mt-2 text-slate-600">
            Employment, school assignments, positions, and access linkage.
          </p>
        </div>
        <div className="flex gap-2">
          {canSetup && (
            <Link
              href="/staff/setup"
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold"
            >
              <Settings2 className="size-4" /> Setup
            </Link>
          )}
          {canManage && (
            <Link
              href="/staff/new"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <UserPlus className="size-4" /> Add staff
            </Link>
          )}
        </div>
      </div>
      {params.message && (
        <p
          role="status"
          className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {params.message}
        </p>
      )}
      <form className="mt-7 flex max-w-xl gap-2" role="search">
        <label className="sr-only" htmlFor="staff-search">
          Search by staff number
        </label>
        <input
          id="staff-search"
          className={fieldClass}
          name="q"
          defaultValue={parsed.query}
          placeholder="Search staff number"
        />
        <button className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 text-sm font-medium">
          <Search className="size-4" /> Search
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        {result.staff.length ? (
          <ul className="divide-y">
            {result.staff.map((assignment) => (
              <li key={assignment.id}>
                <Link
                  href={`/staff/${assignment.staff_profiles.id}`}
                  className="grid gap-1 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span>
                    <span className="font-semibold">
                      {assignment.staff_profiles.people.first_name}{" "}
                      {assignment.staff_profiles.people.last_name}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {assignment.staff_profiles.staff_number} ·{" "}
                      {assignment.employments.employment_type.replace("_", " ")}
                    </span>
                  </span>
                  <span className="text-sm text-slate-600">
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
          className="mt-4 flex justify-between text-sm"
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
