import Link from "next/link";
import { UserPlus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DirectorySearch } from "@/components/ui/directory-search";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        eyebrow="Student records"
        title={
          <span className="break-words">
            Students at {result.active.schoolName}
          </span>
        }
        description={
          <>
            Organization identity with school enrollment and dated placement
            history.
          </>
        }
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
      <DirectorySearch
        id="student-search"
        defaultValue={parsed.query}
        label="Search by student number"
        placeholder="Search student number"
      />
      <div className="border-border bg-surface mt-6 overflow-hidden rounded-xl border">
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
                    <span className="min-w-0">
                      <span className="block font-semibold break-words">
                        {person.first_name} {person.last_name}
                      </span>
                      <span className="text-muted-foreground mt-1 block text-sm font-medium [overflow-wrap:anywhere]">
                        {student.student_number} ·{" "}
                        {enrollment.academic_sessions.name}
                      </span>
                    </span>
                    <span className="text-muted-foreground min-w-0 text-sm font-medium break-words sm:text-right">
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
          className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
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
