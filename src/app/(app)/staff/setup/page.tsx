import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadStaffSetup } from "@/features/staff/service";
import { createDepartment, createPosition } from "../actions";

const panel = "border-border bg-surface min-w-0 rounded-xl border p-5 sm:p-6";

export default async function StaffSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const setup = await loadStaffSetup().catch(() => null);
  if (!setup)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Staff setup unavailable</h1>
      </main>
    );
  const canDepartments = setup.authorization.permissions.includes(
    "staff.departments.manage",
  );
  const canPositions = setup.authorization.permissions.includes(
    "staff.positions.manage",
  );
  return (
    <main className="py-10 sm:py-12">
      <Link href="/staff" className="text-sm font-medium text-emerald-800">
        ← Staff
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="Staff setup"
          title="Departments and positions"
          description="Configure the structure used by dated school assignments."
        />
      </div>
      {params.message && (
        <p
          role="status"
          className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {params.message}
        </p>
      )}
      {params.error && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {params.error}
        </p>
      )}
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className={panel}>
          <h2 className="text-lg font-semibold">Departments</h2>
          {canDepartments && (
            <form action={createDepartment} className="mt-4 grid min-w-0 gap-3">
              <label className="min-w-0 text-sm font-medium">
                Name
                <input className={fieldClass} name="name" required />
              </label>
              <label className="min-w-0 text-sm font-medium">
                Code (optional)
                <input className={fieldClass} name="code" placeholder="ADMIN" />
              </label>
              <Button className="w-full sm:w-auto" type="submit">
                Add department
              </Button>
            </form>
          )}
          <ul className="mt-5 divide-y">
            {setup.departments.map((item) => (
              <li
                key={item.id}
                className="grid min-w-0 gap-1 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <span className="min-w-0 font-medium break-words">
                  {item.name}
                </span>
                <span className="text-muted-foreground min-w-0 font-medium break-words sm:text-right">
                  {item.code ?? item.status}
                </span>
              </li>
            ))}
          </ul>
          {!setup.departments.length && (
            <p className="mt-4 text-sm text-slate-500">
              No departments configured.
            </p>
          )}
        </section>
        <section className={panel}>
          <h2 className="text-lg font-semibold">Positions</h2>
          {canPositions && (
            <form action={createPosition} className="mt-4 grid min-w-0 gap-3">
              <label className="min-w-0 text-sm font-medium">
                Name
                <input className={fieldClass} name="name" required />
              </label>
              <label className="min-w-0 text-sm font-medium">
                Code (optional)
                <input
                  className={fieldClass}
                  name="code"
                  placeholder="TEACHER"
                />
              </label>
              <label className="min-w-0 text-sm font-medium">
                Department
                <select className={fieldClass} name="departmentId">
                  <option value="">No department</option>
                  {setup.departments
                    .filter((item) => item.status === "active")
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg py-2 text-sm font-medium">
                <input
                  className="size-5 shrink-0 accent-emerald-800"
                  type="checkbox"
                  name="isTeaching"
                />
                <span>Teaching position</span>
              </label>
              <Button className="w-full sm:w-auto" type="submit">
                Add position
              </Button>
            </form>
          )}
          <ul className="mt-5 divide-y">
            {setup.positions.map((item) => (
              <li key={item.id} className="min-w-0 py-3 text-sm">
                <span className="block font-medium break-words">
                  {item.name}
                </span>
                <span className="text-muted-foreground block font-medium break-words">
                  {item.departments?.name ?? "School-wide"}
                  {item.is_teaching ? " · Teaching" : ""}
                </span>
              </li>
            ))}
          </ul>
          {!setup.positions.length && (
            <p className="mt-4 text-sm text-slate-500">
              No positions configured.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
