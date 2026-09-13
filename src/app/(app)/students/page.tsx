import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { fieldClass } from "@/components/auth-card";
import { studentSearchSchema } from "@/features/students/schemas";
import { loadStudents } from "@/features/students/service";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const parsed = studentSearchSchema.parse(await searchParams);
  const result = await loadStudents(parsed.query, parsed.page).catch(
    () => null,
  );
  if (!result)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Students unavailable</h1>
        <p className="mt-3 text-slate-600">
          Select an authorized, entitled school workspace.
        </p>
      </main>
    );
  const canManage =
    result.authorization.permissions.includes("students.manage");
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));
  return (
    <main className="py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Student records
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Students at {result.active.schoolName}
          </h1>
          <p className="mt-2 text-slate-600">
            Organization identity with school enrollment and dated placement
            history.
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link
              href="/students/import"
              className="rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Import preview
            </Link>
            <Link
              href="/students/new"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <UserPlus className="size-4" /> Add student
            </Link>
          </div>
        )}
      </div>
      <form className="mt-7 flex max-w-xl gap-2" role="search">
        <label className="sr-only" htmlFor="student-search">
          Search by student number
        </label>
        <input
          id="student-search"
          className={fieldClass}
          name="q"
          defaultValue={parsed.query}
          placeholder="Search student number"
        />
        <button className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 text-sm font-medium">
          <Search className="size-4" /> Search
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        {result.students.length ? (
          <ul className="divide-y">
            {result.students.map((enrollment) => {
              const student = enrollment.student_profiles;
              const person = student.people;
              const placement = enrollment.class_memberships.find(
                (item) => item.status === "active",
              );
              return (
                <li key={enrollment.id}>
                  <Link
                    href={`/students/${student.id}`}
                    className="grid gap-1 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <span>
                      <span className="font-semibold">
                        {person.first_name} {person.last_name}
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {student.student_number} ·{" "}
                        {enrollment.academic_sessions.name}
                      </span>
                    </span>
                    <span className="text-sm text-slate-600">
                      {placement?.class_levels.name ?? "Unplaced"}
                      {placement?.class_arms
                        ? ` · ${placement.class_arms.name}`
                        : ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No students yet</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a student or validate an import to begin.
            </p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <nav
          aria-label="Student pages"
          className="mt-4 flex justify-between text-sm"
        >
          <span>
            Page {result.page} of {totalPages}
          </span>
          <div className="flex gap-3">
            {result.page > 1 && (
              <Link
                href={`/students?q=${encodeURIComponent(parsed.query)}&page=${result.page - 1}`}
              >
                Previous
              </Link>
            )}
            {result.page < totalPages && (
              <Link
                href={`/students?q=${encodeURIComponent(parsed.query)}&page=${result.page + 1}`}
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
