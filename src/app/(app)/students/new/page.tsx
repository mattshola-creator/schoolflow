import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadStudentFormOptions } from "@/features/students/service";
import { createStudent } from "../actions";

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const options = await loadStudentFormOptions().catch(() => null);
  if (!options)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Student creation unavailable</h1>
      </main>
    );
  return (
    <main className="py-10 sm:py-12">
      <Link href="/students" className="text-brand text-sm font-medium">
        ← Students
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="Student records"
          title="Add a student"
          description="Creates permanent identity, enrollment, placement, and a primary guardian atomically."
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
      {!options.sessions.length || !options.levels.length ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold">Academic setup required</h2>
          <p className="mt-1 text-sm">
            Create an academic session and class level before enrolling
            students.
          </p>
        </div>
      ) : (
        <form
          action={createStudent}
          className="border-border bg-surface mt-6 grid min-w-0 gap-6 rounded-xl border p-5 sm:p-6"
        >
          <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">Student identity</legend>
            <label className="min-w-0 text-sm font-medium">
              First name
              <input className={fieldClass} name="firstName" required />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Last name
              <input className={fieldClass} name="lastName" required />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Student number
              <input
                className={fieldClass}
                name="studentNumber"
                placeholder="SF-2026-001"
                required
              />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Date of birth
              <input
                className={fieldClass}
                name="dateOfBirth"
                type="date"
                required
              />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Gender
              <select className={fieldClass} name="gender" required>
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>
          </fieldset>
          <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">
              Enrollment and placement
            </legend>
            <label className="min-w-0 text-sm font-medium">
              Academic session
              <select className={fieldClass} name="sessionId" required>
                {options.sessions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 text-sm font-medium">
              Enrolled on
              <input
                className={fieldClass}
                name="enrolledOn"
                type="date"
                required
              />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Class level
              <select className={fieldClass} name="levelId" required>
                {options.levels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 text-sm font-medium">
              Class arm (optional)
              <select className={fieldClass} name="armId">
                <option value="">No arm</option>
                {options.arms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
          <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">Primary guardian</legend>
            <label className="min-w-0 text-sm font-medium">
              First name
              <input className={fieldClass} name="guardianFirstName" required />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Last name
              <input className={fieldClass} name="guardianLastName" required />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Relationship
              <input
                className={fieldClass}
                name="guardianRelationship"
                placeholder="Mother, uncle, sponsor…"
                required
              />
            </label>
            <div className="flex min-w-0 flex-col justify-end gap-2 text-sm">
              <label className="flex min-h-11 items-center gap-3 rounded-lg px-2">
                <input
                  className="size-5 shrink-0 accent-emerald-800"
                  type="checkbox"
                  name="guardianPrimary"
                  required
                />
                Primary contact
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-lg px-2">
                <input
                  className="size-5 shrink-0 accent-emerald-800"
                  type="checkbox"
                  name="guardianFinancial"
                />
                Financially responsible
              </label>
            </div>
          </fieldset>
          <Button className="w-full sm:w-auto" type="submit">
            Create student record
          </Button>
        </form>
      )}
    </main>
  );
}
